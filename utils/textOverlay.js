import sharp from "sharp";
import { createCanvas, loadImage } from "canvas";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function overlayTextOnImage(imagePath, title, description) {
  try {
    const width = 768;
    const height = 768;

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Load image
    const image = await loadImage(imagePath);
    ctx.drawImage(image, 0, 0, width, height);

    // Add semi-transparent black gradient rectangle behind text
    const boxHeight = 200;
    const gradient = ctx.createLinearGradient(0, 0, 0, boxHeight);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, boxHeight);

    // Set styles for text
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 6;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Title
    ctx.font = "bold 28px Arial";
    wrapText(ctx, title, width / 2, 30, width - 100, 34);

    // Description
    ctx.font = "22px Arial";
    wrapText(ctx, description, width / 2, 90, width - 100, 28);

    // Save image
    const out = fs.createWriteStream(imagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    await new Promise((resolve, reject) => {
      out.on("finish", resolve);
      out.on("error", reject);
    });

    console.log("✅ Image saved with gradient text overlay:", imagePath);
  } catch (error) {
    console.error("❌ Failed to overlay text:", error.message);
    throw error;
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, y);
}
