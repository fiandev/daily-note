import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const notionApiKey = process.env.NOTION_API_KEY;
  if (!notionApiKey || typeof notionApiKey !== "string") {
    return NextResponse.json(
      { message: "Notion API Key is not configured on the server." },
      { status: 401 }
    );
  }

  const notion = new Client({ auth: notionApiKey });
  const SOURCE_ID = "28a0fb92-fd1d-8054-b3f1-000ba84308b8";

  try {
    const source = await notion.dataSources.query({
      data_source_id: SOURCE_ID,
    });

    const items = await Promise.all(
      source.results.map(async (page: any) => {
        const props = page.properties;

        const blocks = await notion.blocks.children.list({
          block_id: page.id,
        });

        const content = blocks.results
          .map((block: any) => {
            const type = block.type;
            if (block[type]?.rich_text) {
              return block[type].rich_text
                .map((t: any) => t.plain_text)
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
      })
    );
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch data from Notion", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const { topic, content, date, status } = body;

  const notionApiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !databaseId) {
    return NextResponse.json(
      { message: "Notion API or Database ID not configured." },
      { status: 500 }
    );
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
    return NextResponse.json(newPage);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create note", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  res: NextResponse
) {
  const { id } = await params;
  const body = await req.json();
  const { topic, content, date, status } = body;
  const notionApiKey = process.env.NOTION_API_KEY;

  if (!notionApiKey) {
    return NextResponse.json(
      { message: "Notion API not configured." },
      { status: 500 }
    );
  }

  const notion = new Client({ auth: notionApiKey });

  try {
    const updatedPage = await notion.pages.update({
      page_id: id,
      properties: {
        Topic: { title: [{ text: { content: topic } }] },
        Content: { rich_text: [{ text: { content: content } }] },
        Date: { date: { start: date } },
        Status: { status: { name: status } },
      },
    });
    return NextResponse.json(updatedPage);
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to update note ${id}`, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  res: NextResponse
) {
  const { id } = await params;
  const notionApiKey = process.env.NOTION_API_KEY;

  if (!notionApiKey) {
    return NextResponse.json(
      { message: "Notion API not configured." },
      { status: 500 }
    );
  }

  const notion = new Client({ auth: notionApiKey });

  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    });
    return NextResponse.json({ message: `Note ${id} deleted successfully.` });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to delete note ${id}`, error: error.message },
      { status: 500 }
    );
  }
}
