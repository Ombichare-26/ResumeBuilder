import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import mammoth from "mammoth";

export const parseFile = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found: " + filePath);
    }

    const extension = path.extname(filePath).toLowerCase();

    // --- HANDLE PDF ---
    if (extension === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    }

    // --- HANDLE DOCX ---
    if (extension === ".docx" || extension === ".doc") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    return "";
  } catch (error) {
    console.error("Error in parseFile service:", error.message);
    throw error;
  }
};