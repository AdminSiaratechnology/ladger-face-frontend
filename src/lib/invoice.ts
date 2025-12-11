import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateInvoicePdf(previewBill, company) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 40;

  // ============================================
  // COMPANY HEADER (EXACT AS PREVIEW)
  // ============================================
  doc.setFontSize(20);
  doc.text(company?.CompanyName || "Company Name", marginLeft, 40);

  doc.setFontSize(10);

  if (company?.Address)
    doc.text(company.Address, marginLeft, 58);

  if (company?.phone)
    doc.text("Phone: " + company.phone, marginLeft, 72);

  if (company?.gstNumber)
    doc.text("GST: " + company.gstNumber, marginLeft, 86);

  if (company?.website)
    doc.text("Website: " + company.website, marginLeft, 100);

  // LOGO RIGHT SIDE
  if (company?.logo) {
    try {
      doc.addImage(company.logo, "PNG", pageWidth - 150, 30, 100, 70);
    } catch (err) {
      console.log("Logo load failed", err);
    }
  }

  // ============================================
  // BILL INFO (MATCH PREVIEW)
  // ============================================
  doc.setFontSize(12);
  doc.text(`Invoice No: ${previewBill.billNumber}`, marginLeft, 140);

  const billDate = new Date(previewBill.createdAt || Date.now());
  doc.text(`Date: ${billDate.toLocaleString()}`, marginLeft, 160);

  doc.text(`Customer: ${previewBill.customerName || "N/A"}`, pageWidth - 260, 140);
  doc.text(`Phone: ${previewBill.customerPhone || "N/A"}`, pageWidth - 260, 160);

  // ============================================
  // ITEMS TABLE (EXACT PREVIEW LOOK)
  // ============================================
  autoTable(doc, {
    startY: 190,
    margin: { left: marginLeft, right: marginLeft },
    tableWidth: pageWidth - marginLeft * 2,

    head: [["#", "Product", "Batch", "Qty", "Price", "Total"]],
    body: previewBill.items.map((it, i) => [
      i + 1,
      it.name,
      it.batch || "-",
      it.qty,
      `₹${Number(it.price).toFixed(2)}`,
      `₹${Number(it.total).toFixed(2)}`
    ]),

    styles: {
      fontSize: 10,
      cellPadding: 6,
      lineWidth: 0.5,
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: 20,
      fontStyle: "bold",
    },
    tableLineColor: 180,
    tableLineWidth: 0.5,
  });

  const finalY = doc.lastAutoTable.finalY + 30;

  // ============================================
  // TOTALS SECTION (EXACT MATCH)
  // ============================================
  doc.setFontSize(12);
  doc.text(
    `Subtotal: ₹${previewBill.subtotal.toFixed(2)}`,
    pageWidth - 200,
    finalY
  );

  doc.text(
    `Tax: ₹${previewBill.taxAmount.toFixed(2)}`,
    pageWidth - 200,
    finalY + 18
  );

  doc.setFontSize(15);
  doc.setTextColor(0, 128, 0);
  doc.text(
    `Grand Total: ₹${previewBill.grandTotal.toFixed(2)}`,
    pageWidth - 200,
    finalY + 45
  );
  doc.setTextColor(0, 0, 0);

  // ============================================
  // PAYMENT DETAILS (EXACT MATCH)
  // ============================================
  let payY = finalY + 100;

  doc.setFontSize(14);
  doc.text("Payment Details", marginLeft, payY);

  payY += 25;
  doc.setFontSize(12);

  if (previewBill.paymentInfo?.isSplit) {
    doc.text(`Cash: ₹${previewBill.paymentInfo.splitPayment.cash}`, marginLeft + 10, payY);
    payY += 15;
    doc.text(`Card: ₹${previewBill.paymentInfo.splitPayment.card}`, marginLeft + 10, payY);
    payY += 15;
    doc.text(`UPI: ₹${previewBill.paymentInfo.splitPayment.upi}`, marginLeft + 10, payY);
  } else {
    doc.text(
      `Payment Mode: ${previewBill.paymentInfo.singlePayment}`,
      marginLeft + 10,
      payY
    );
  }

  // ============================================
  // FOOTER EXACTLY CENTERED
  // ============================================
  doc.setFontSize(12);
  const footer = "Thank you for shopping with us!";
  const footerX = (pageWidth - doc.getTextWidth(footer)) / 2;
  doc.text(footer, footerX, payY + 80);

  // ============================================
  // FINAL SAVE
  // ============================================
  doc.save(`invoice_${previewBill.billNumber}.pdf`);
}
