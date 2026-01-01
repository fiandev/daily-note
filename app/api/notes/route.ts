import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import { isUserAllow } from "../login/route";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const CACHE_KEY = "notion_notes_data";

export async function GET() {
  const notionApiKey = process.env.NOTION_API_KEY;
  if (!notionApiKey) {
    return NextResponse.json(
      { message: "Notion API Key is not configured." },
      { status: 401 },
    );
  }

  const cachedData = myCache.get(CACHE_KEY);
  if (cachedData) {
    return NextResponse.json(cachedData, {
      headers: { "X-Cache-Status": "HIT" },
    });
  }

  const notion = new Client({ auth: notionApiKey });
  const SOURCE_ID = "28a0fb92-fd1d-8054-b3f1-000ba84308b8";

  try {
    const source = await notion.dataSources.query({
      data_source_id: SOURCE_ID,
    });

    const items = await Promise.all(
      source.results.map(async (page: { [x: string]: any }) => {
        const props = page.properties;
        const blocks = await notion.blocks.children.list({
          block_id: page.id,
        });

        const content = blocks.results
          .map((block: { [x: string]: any }) => {
            const type = block.type;
            if (block[type]?.rich_text) {
              return block[type].rich_text
                .map((t: { plain_text: string }) => t.plain_text)
                .join("");
            }
            return "";
          })
          .filter((text: string) => text.trim().length > 0)
          .join("\n")
          .replace(/\n\s*\n/g, "\n");

        return {
          id: page.id,
          topic: props.Topic?.title[0]?.plain_text || "No Topic",
          date: props.Date?.date || props.Timeline?.date || null,
          content: content,
          status: props.Status?.status?.name || "No Status",
        };
      }),
    );

    return NextResponse.json(items, {
      headers: { "X-Cache-Status": "MISS" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch data from Notion", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = req.headers.get("Authorization")?.split(" ")[1] || "";
  const { topic, content, date, status } = body;

  const user = await isUserAllow(token);
  if (!user)
    return NextResponse.json({ message: "User not allowed." }, { status: 401 });

  const notionApiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!notionApiKey || !databaseId) {
    return NextResponse.json({ message: "Config missing." }, { status: 500 });
  }

  const notion = new Client({ auth: notionApiKey });

  try {
    const newPage = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Topic: { title: [{ text: { content: topic } }] },
        Content: { rich_text: [{ text: { content: content } }] },
        Date: { date: { start: date } },
        Status: { status: { name: status } },
      },
    });

    // 3. Invalidate Cache (Hapus cache agar data baru muncul di GET)
    myCache.del(CACHE_KEY);

    return NextResponse.json(newPage);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed", error: error },
      { status: 500 },
    );
  }
}
