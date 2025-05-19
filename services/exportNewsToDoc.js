import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getNews } from "./fetchNews.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportNewsToDoc = async (req, res) => {
  try {
    console.log("Fetching news articles...");

    // 1. Fetch news articles
    const articles = await getNews();
    if (!Array.isArray(articles) || articles.length === 0) {
      throw new Error("No news found to export");
    }

    console.log(`Found ${articles.length} news articles.`);

    // 2. Create a Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Top News Today",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            ...articles
              .map((article, index) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${index + 1}. ${article.title}`,
                      bold: true,
                      size: 26,
                    }),
                  ],
                }),
                new Paragraph({ text: article.description }),
                new Paragraph({
                  text: article.url,
                  style: "Hyperlink",
                }),
                new Paragraph({ text: " " }), // Spacer
              ])
              .flat(),
          ],
        },
      ],
    });

    // 3. Create file path with date
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const filePath = path.join(
      __dirname,
      "..",
      "documents",
      `TopNews_${formattedDate}.docx`
    );

    console.log(`Saving document to ${filePath}...`);

    // 4. Write to disk
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    console.log("Document saved successfully.");

    res.status(200).json({
      success: true,
      message: "News exported to Word document successfully.",
      filePath,
    });
  } catch (error) {
    console.error("Error exporting news:", error.message);
    res.status(500).json({ success: false, message: "Error exporting news." });
  }
};
