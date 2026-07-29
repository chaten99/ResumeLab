import { PDFParse } from "pdf-parse";
import AppError from "../utils/AppError.js";
import { sanitizeExtractedText } from "../utils/textSanitizer.js";

const PDF_SIGNATURE = "%PDF-";
const validatePdfSignature = (buffer) => {
    const signature = buffer.subarray(0, PDF_SIGNATURE.length).toString();
    if (signature !== PDF_SIGNATURE) {
        throw new AppError("Invalid PDF file", 400);
    }
};

export const parseResumePdf = async (buffer) => {
    if (!buffer || buffer.length === 0) {
        throw new AppError("Invalid PDF file", 400);
    }
    validatePdfSignature(buffer);
    let result;

    const parser = new PDFParse({
        data: buffer,
    });

    try {
        result = await parser.getText();
    } catch {
        throw new AppError("Unable to read the uploaded PDF", 400);
    }

    const extractedText = sanitizeExtractedText(result.text || "");

    if (!extractedText) {
        throw new AppError("No Readable text found in the uploaded PDF", 400);
    }

    return {
        text: extractedText,
        pageCount: result.pages?.length ?? null,
    };
};
