import { PDFParse } from "pdf-parse";
import fs from "fs";
import AppError from "../utils/AppError.js";

const PDF_SIGNATURE = "%PDF-";
const validatePdfSignature = (buffer) => {
    const signature = buffer.subarray(0, PDF_SIGNATURE.length).toString();
    if(signature !== PDF_SIGNATURE) {
        throw new AppError("Invalid PDF file", 400);
    }
};

const cleanExtractedText = (text) => {
     return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export const parseResumePdf = async (buffer) => {
    if(!buffer || buffer.length === 0) {
        throw new AppError("Invalid PDF file", 400);
    }
    validatePdfSignature(buffer);
    let result;

    const parser = new PDFParse({
        data: buffer,
    });


    try {
        result = await parser.getText();

        console.log("pdf result: ", result);
    } catch {
        throw new AppError("Unable to read the uploaded PDF", 400);
    }
    const extractedText = cleanExtractedText(result.text || "");
    if(!extractedText) {
        throw new AppError("No Readable text found in the uploaded PDF", 400);
    }
    return {
        text: extractedText,
        pageCount: result.pages.length ?? null,
    }
}
