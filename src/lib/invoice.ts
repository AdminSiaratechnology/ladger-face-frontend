import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateInvoicePdf(previewBill, company) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 40;

  // ============================================
  // COMPANY HEADER
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

  if (company?.logo) {
    try {
      doc.addImage(company.logo, "PNG", pageWidth - 150, 30, 100, 70);
    } catch (err) {
      console.log("Logo load failed", err);
    }
  }

  // ============================================
  // BILL INFO
  // ============================================
  doc.setFontSize(12);
  doc.text(`Invoice No: ${previewBill.billNumber}`, marginLeft, 140);

  const billDate = new Date(previewBill.createdAt || Date.now());
  doc.text(`Date: ${billDate.toLocaleString()}`, marginLeft, 160);

  doc.text(
    `Customer: ${previewBill.customer?.name || "N/A"}`,
    pageWidth - 260,
    140
  );
  doc.text(
    `Phone: ${previewBill.customer?.phone || "N/A"}`,
    pageWidth - 260,
    160
  );

  // ============================================
  // ITEMS TABLE
  // ============================================
  autoTable(doc, {
    startY: 190,
    margin: { left: marginLeft, right: marginLeft },
    tableWidth: pageWidth - marginLeft * 2,

    head: [["#", "Product", "Batch", "Qty", "Price", "Total"]],
    body: previewBill.items.map((it, i) => [
      i + 1,
      it.name || it.ItemName || "-",
      it.batch || "-",
      it.qty,
      `₹${Number(it.price || 0).toFixed(2)}`,
      `₹${Number((it.qty || 0) * (it.price || 0)).toFixed(2)}`
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
  // TOTALS SECTION (FIXED)
  // ============================================
  doc.setFontSize(12);
  doc.text(
    `Subtotal: ₹${Number(previewBill.subtotal || 0).toFixed(2)}`,
    pageWidth - 200,
    finalY
  );

  doc.text(
    `Tax: ₹${Number(previewBill.gstAmount || 0).toFixed(2)}`,
    pageWidth - 200,
    finalY + 18
  );

  doc.setFontSize(15);
  doc.setTextColor(0, 128, 0);
  doc.text(
    `Grand Total: ₹${Number(previewBill.totalAmount || 0).toFixed(2)}`,
    pageWidth - 200,
    finalY + 45
  );
  doc.setTextColor(0, 0, 0);

  // ============================================
  // PAYMENT DETAILS (FIXED)
  // ============================================
  let payY = finalY + 100;

  doc.setFontSize(14);
  doc.text("Payment Details", marginLeft, payY);

  payY += 25;
  doc.setFontSize(12);

  doc.text(
    `Payment Mode: ${previewBill.paymentInfo.paymentType}`,
    marginLeft + 10,
    payY
  );

  if (previewBill.paymentInfo.paymentType === "SPLIT") {
    payY += 18;
    doc.text(
      `Cash: ₹${previewBill.paymentInfo.payments.cash}`,
      marginLeft + 10,
      payY
    );
    payY += 15;
    doc.text(
      `Card: ₹${previewBill.paymentInfo.payments.card}`,
      marginLeft + 10,
      payY
    );
    payY += 15;
    doc.text(
      `UPI: ₹${previewBill.paymentInfo.payments.upi}`,
      marginLeft + 10,
      payY
    );
  }

  // ============================================
  // FOOTER
  // ============================================
  doc.setFontSize(12);
  const footer = "Thank you for shopping with us!";
  const footerX = (pageWidth - doc.getTextWidth(footer)) / 2;
  doc.text(footer, footerX, payY + 80);

  // ============================================
  // SAVE PDF
  // ============================================
  doc.save(`invoice_${previewBill.billNumber}.pdf`);
}
