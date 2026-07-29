import fs from "fs";
import connectDB from "../src/config/db.js";
import { buildAuditReportData } from "../src/services/report.service.js";
import { generateAuditReportPdf } from "../src/services/pdf.service.js";
import Analysis from "../src/models/analysis.model.js";

const runPuppeteerTest = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await connectDB();

        const analysis = await Analysis.findOne({ status: "completed" });

        if (!analysis) {
            console.log("No completed analysis found in DB.");
            process.exit(1);
        }

        console.log("Gathering Audit Report Data for analysis:", analysis._id);
        const reportData = await buildAuditReportData({
            analysisId: analysis._id,
            userId: analysis.userId,
        });

        console.log("Candidate Name:", reportData.user.name);
        console.log("Target Role:", reportData.resume.targetRole);
        console.log("Overall Score:", reportData.scores.overall);

        // Mock express response object writing to file
        const writeStream = fs.createWriteStream("scratch/test_puppeteer_report.pdf");

        const mockRes = {
            headersSent: false,
            end: (buffer) => {
                writeStream.write(buffer);
                writeStream.end();
            },
            status: () => mockRes,
            json: () => mockRes,
        };

        await generateAuditReportPdf(reportData, mockRes);

        writeStream.on("finish", () => {
            console.log("=== PUPPETEER HTML-TO-PDF REPORT GENERATED SUCCESSFULLY (scratch/test_puppeteer_report.pdf) ===");
            process.exit(0);
        });
    } catch (err) {
        console.error("PUPPETEER TEST FAILED:", err);
        process.exit(1);
    }
};

runPuppeteerTest();
