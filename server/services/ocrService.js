const Tesseract = require("tesseract.js");
const path = require("path");

async function extractText(imagePath) {
  const filePath = path.isAbsolute(imagePath)
    ? imagePath
    : path.join(__dirname, "..", imagePath);

  const result = await Tesseract.recognize(filePath, "eng+kin+fra", {
    logger: (info) => {
      if (info.status === "recognizing text") {
        process.stdout.write(`\rOCR progress: ${Math.round(info.progress * 100)}%`);
      }
    },
  });

  console.log(""); // newline after progress

  const text = result.data.text.trim();
  if (!text) {
    throw new Error("No text could be extracted from the image");
  }
  return text;
}

module.exports = { extractText };
