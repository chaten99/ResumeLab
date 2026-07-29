import gemini from "./src/config/gemini.js";
import { env } from "./src/config/env.js";

try {
    const response = await gemini.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: "Reply with exactly: Gemini connected",
    });

    console.log(response.text);
} catch (error) {
    console.error("Gemini test failed:", error);
}
