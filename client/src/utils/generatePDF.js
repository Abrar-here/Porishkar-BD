import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // 👈 import as a function, not just a side-effect

export const generateCollectorPDF = (collector, dateRange) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text("Collector Performance Assessment", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
  if (dateRange.start && dateRange.end) {
    doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 14, 34);
  }

  // Collector Info
  doc.setFontSize(12);
  doc.text(`Collector Name: ${collector.name}`, 14, 46);
  doc.text(`Email: ${collector.email}`, 14, 53);
  doc.text(`Composite Score: ${collector.compositeScore}`, 14, 60);

  // Metrics Table
  autoTable(doc, { 
    startY: 68,
    head: [["Metric", "Count"]],
    body: [
      ["Total Pickups Completed", collector.totalCompleted],
      ["Disputed Collections", collector.disputedCount],
    ],
  });

  // Footer / HR Signatures
  const finalY = doc.lastAutoTable.finalY + 30; // this still works — lastAutoTable is still attached to doc
  doc.text("Evaluated By: ___________________", 14, finalY);
  doc.text("Signature: ___________________", 120, finalY);

  doc.save(`${collector.name}_Performance_Report.pdf`);
};