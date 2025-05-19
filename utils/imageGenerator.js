import Replicate from "replicate";
import fetch from "node-fetch";
import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateNewsImage(prompt, filename = "output.png") {
  const input = {
    width: 768,
    height: 768,
    prompt,
    refine: "expert_ensemble_refiner",
    apply_watermark: false,
    num_inference_steps: 25,
  };

  const output = await replicate.run(
    "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
    { input }
  );

  const imageUrl = output[0];
  const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
  const savePath = path.join(__dirname, "..", "documents", filename);
  await writeFile(savePath, Buffer.from(imageBuffer));
  return savePath;
}
