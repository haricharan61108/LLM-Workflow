import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import { Together } from "together-ai";
import { generateNewsImage } from "../utils/imageGenerator.js";
import { overlayTextOnImage } from "../utils/textOverlay.js"; // <== NEW

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const together = new Together();

export const extractAndSendNewsToLLM = async (req, res) => {
  try {
    const folderPath = path.join(__dirname, "..", "documents");
    const files = fs.readdirSync(folderPath);
    const latestDocx = files
      .filter(file => file.endsWith(".docx"))
      .sort(
        (a, b) =>
          fs.statSync(path.join(folderPath, b)).mtime -
          fs.statSync(path.join(folderPath, a)).mtime
      )[0];

    if (!latestDocx) throw new Error("No news document found.");

    const filePath = path.join(folderPath, latestDocx);
    console.log("Reading document:", filePath);

    // Step 2: Extract text from the document
    const fileBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const extractedText = result.value;

    console.log("Extracted text size:", extractedText.length);

    // Step 3: Send the text to the LLM
    const prompt = `Here are today's news articles:\n\n${extractedText}\n\nPick exactly 2 news articles: one from India and one from the World. Respond ONLY with the two selected headlines and a one-line summary for each. STRICTLY follow this format and DO NOT include any internal reasoning or extra text:\n\nIndia:\n<Headline>\n<Summary>\n\nWorld:\n<Headline>\n<Summary>`;

    const response = await together.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "Qwen/Qwen3-235B-A22B-fp8-tput"
    });

    const modelOutput = response.choices[0].message.content;
    const cleanedOutput = modelOutput.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    console.log("Model Output:\n", cleanedOutput);

    // Step 4: Parse the model output
    const [indiaBlock, worldBlock] = cleanedOutput.split("World:");

    const indiaLines = indiaBlock.replace("India:", "").trim().split("\n");
    const indiaPrompt = indiaLines[0];
    const indiaSummary = indiaLines[1];

    const worldLines = worldBlock.trim().split("\n");
    const worldPrompt = worldLines[0];
    const worldSummary = worldLines[1];

    // Step 5: Generate images and overlay text
    const indiaImageFilename = "india_news_image.png";
    const indiaImagePath = await generateNewsImage(indiaPrompt, indiaImageFilename);
    await overlayTextOnImage(
      path.join(folderPath, indiaImageFilename),
      "India: " + indiaPrompt,
      indiaSummary
    );

    const worldImageFilename = "world_news_image.png";
    const worldImagePath = await generateNewsImage(worldPrompt, worldImageFilename);
    await overlayTextOnImage(
      path.join(folderPath, worldImageFilename),
      "World: " + worldPrompt,
      worldSummary
    );

    console.log("India news image saved at:", indiaImagePath);
    console.log("World news image saved at:", worldImagePath);

    // Step 6: Return response
    res.status(200).json({
      success: true,
      message: "Top 2 news selected by LLM.",
      topNews: cleanedOutput
    });
  } catch (error) {
    console.error("Error in LLM news processing:", error.message);
    res.status(500).json({
      success: false,
      message: "Error processing LLM news.",
      error: error.message
    });
  }
};
