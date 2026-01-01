import { NextRequest, NextResponse } from "next/server";
import { isUserAllow } from "../../login/route";
import { Client } from "@notionhq/client";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const CACHE_KEY = "notion_notes_data";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const token = req.headers.get("Authorization")?.split(" ")[1] || "";
  const { topic, content, date, status } = body;

  const user = await isUserAllow(token);
  if (!user)
    return NextResponse.json({ message: "User not allowed." }, { status: 401 });

  const notionApiKey = process.env.NOTION_API_KEY;
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

    // Invalidate Cache
    myCache.del(CACHE_KEY);

    return NextResponse.json(updatedPage);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed", error: error },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get("Authorization")?.split(" ")[1] || "";

  const user = await isUserAllow(token);
  if (!user)
    return NextResponse.json({ message: "User not allowed." }, { status: 401 });

  const notionApiKey = process.env.NOTION_API_KEY;
  const notion = new Client({ auth: notionApiKey });

  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    });

    // Invalidate Cache
    myCache.del(CACHE_KEY);

    return NextResponse.json({ message: "Deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed", error: error },
      { status: 500 },
    );
  }
}
