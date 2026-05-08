import PDFDocument from "pdfkit";

export function buildScanPdf(scan) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 48 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(22).text("PhishGuard AI Scan Report");
    doc.moveDown();
    doc.fontSize(12).text(`Report ID: ${scan._id}`);
    doc.text(`Type: ${scan.type}`);
    doc.text(`Verdict: ${scan.verdict.toUpperCase()}`);
    doc.text(`Threat Score: ${scan.threatScore}/100`);
    doc.text(`Probability: ${(scan.probability * 100).toFixed(1)}%`);
    doc.text(`Created: ${scan.createdAt.toISOString()}`);
    doc.moveDown();
    doc.fontSize(14).text("Input", { underline: true });
    doc.fontSize(11).text(scan.input, { width: 500 });
    doc.moveDown();
    doc.fontSize(14).text("Indicators", { underline: true });
    (scan.indicators || []).forEach((indicator) => doc.fontSize(11).text(`- ${indicator}`));
    doc.end();
  });
}

