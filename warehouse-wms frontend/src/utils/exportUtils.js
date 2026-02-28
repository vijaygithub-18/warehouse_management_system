import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    return { success: false, message: "No data to export" };
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(
    wb,
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
  );

  return { success: true, message: "Excel file downloaded successfully" };
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    return { success: false, message: "No data to export" };
  }

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) =>
        typeof val === "string" && val.includes(",") ? `"${val}"` : val,
      )
      .join(","),
  );
  const csv = [headers, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return { success: true, message: "CSV file downloaded successfully" };
};

export const exportToPDF = (data, filename, title = "Report") => {
  if (!data || data.length === 0) {
    return { success: false, message: "No data to export" };
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  const headers = [Object.keys(data[0])];
  const rows = data.map((row) => Object.values(row));

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });

  doc.save(`${filename}_${new Date().toISOString().split("T")[0]}.pdf`);

  return { success: true, message: "PDF file downloaded successfully" };
};
