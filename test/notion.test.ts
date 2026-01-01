import { Client } from "@notionhq/client";
import fs from "fs";
import "dotenv/config";

(async () => {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const SOURCE_ID = "28a0fb92-fd1d-8054-b3f1-000ba84308b8";

  try {
    const source = await notion.dataSources.query({
      data_source_id: SOURCE_ID,
    });

    // Pake Promise.all biar nungguin semua block ditarik
    const items = await Promise.all(
      source.results.map(async (page: any) => {
        const props = page.properties;

        // Tarik isi konten body page
        const blocks = await notion.blocks.children.list({
          block_id: page.id,
        });

        const content = blocks.results
          .map((block: any) => {
            const type = block.type;
            const richText = block[type]?.rich_text;
            return richText
              ? richText.map((t: any) => t.plain_text).join("")
              : "";
          })
          .filter((text: string) => text.trim().length > 0)
          .join("\n")
          .replace(/\n\s*\n/g, "\n"); // Bersihin double newline

        fs.writeFileSync("page.json", JSON.stringify(page, null, 2));
        fs.writeFileSync("props.json", JSON.stringify(page, null, 2));

        console.log({ props, page });

        return {
          topic: props.Topic?.title[0]?.plain_text || "No Topic",
          date: props.Date?.date || props.Timeline?.date || null,
          content: content,
          status: props.Status?.status?.name || "No Status",
        };
      }),
    );

    // fs.writeFileSync("final_dump.json", JSON.stringify(items, null, 2));
    // console.log("\nDone! Cek final_dump.json");
  } catch (error: any) {
    console.error("Gagal tarik data:", error.message);
  }
})();
