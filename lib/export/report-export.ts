import type { AIReport } from "@/types/database";

export function downloadMarkdownReport(report: AIReport) {
  const blob = new Blob([report.content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadPdfReport(report: AIReport) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(report.title, pageWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${report.report_type} · ${report.timeframe}`, margin, y);
  y += 20;
  doc.setTextColor(0);

  const body = report.content.replace(/^#+\s/gm, "").trim();
  const lines = doc.splitTextToSize(body, pageWidth);
  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 14;
  }

  if (report.insights.length > 0) {
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Key Insights", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    report.insights.forEach((insight, i) => {
      const insightLines = doc.splitTextToSize(`${i + 1}. ${insight}`, pageWidth);
      for (const line of insightLines) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 14;
      }
    });
  }

  doc.save(`${report.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`);
}
