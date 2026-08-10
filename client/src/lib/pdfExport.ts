// @ts-ignore
import html2pdf from "html2pdf.js";

export const downloadPdfFromElement = async (elementId: string, filename: string = "Resume.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Resume container element not found");
  }

  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
  };

  await html2pdf().set(opt).from(element).save();
};
