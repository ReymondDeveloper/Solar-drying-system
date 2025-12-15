import { CgSoftwareDownload } from "react-icons/cg";
import JsPdf from "jspdf";

export default function Report({ report_title, column, data }) {
  const getDataUrl = (imagePath) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = imagePath;
    });
  };

  async function Generate() {
    const doc = new JsPdf("p", "mm", "a4");
    const getCenteredPage = (text) =>
      doc.internal.pageSize.width / 2 - doc.getTextWidth(text) / 2;

    doc.setFontSize(10);

    const logoDataUrl = await getDataUrl("/logo.png"); // Absolute path from public/
    doc.addImage(logoDataUrl, "PNG", 5, 12, 30, 25);

    doc.text(
      "Republic of the Philippines",
      getCenteredPage("Republic of the Philippines"),
      20
    );

    doc.text(
      "Province of Occidental Mindoro",
      getCenteredPage("Province of Occidental Mindoro"),
      24
    );

    doc.setFont("helvetica", "bold");
    doc.text(
      "Municipality of Sablayan",
      getCenteredPage("Municipality of Sablayan"),
      28
    );

    doc.setFont("helvetica", "normal");
    doc.text("o0o", getCenteredPage("o0o"), 32);

    doc.setFont("helvetica", "bold");
    doc.text(
      "OFFICE OF THE MUNICIPAL AGRICULTURIST",
      getCenteredPage("OFFICE OF THE MUNICIPAL AGRICULTURIST"),
      36
    );

    doc.rect(5, 40, 200, 1, "F");

    doc.setFontSize(12);
    doc.text(report_title, getCenteredPage(report_title), 48);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const tableWidth = pageWidth - 10;
    const bottomMargin = 10;
    const maxYPosition = pageHeight - bottomMargin;

    let y = 52;
    let x = 5;

    column.forEach((c) => {
      c.x = x;
      c.width = tableWidth * c.ratio;
      x += c.width;
    });

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    column.forEach((col) => {
      doc.rect(col.x, y, col.width, 7, "S");
      doc.text(col.label, col.x + 2, y + 5);
    });

    y += 7;
    doc.setFont("helvetica", "normal");

    data.forEach((u, i) => {
      const row = {
        "#": i + 1,
        "Registered Dryer": u.dryer_id?.dryer_name || u.dryer_name,
        "Location (Sablayan)": u.dryer_id?.location || u.location || "-",
        "Date Created": u.created_at
          ? new Date(u.created_at).toLocaleString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-",
        Status: u.status
          ? u.status.charAt(0).toUpperCase() + u.status.slice(1)
          : "-",
        Duration: `${u.date_from || "N/A"} - ${u.date_to || "N/A"}`,
        "Operation Status": u.is_operation
          ? "Yes"
          : `No - ${u.operation_reason ?? "Maintenance"}`,
        "Reservation Status":
          u.available_capacity > 0 ? "Available" : "Occupied",
        Name: u.name,
        Address: u.address,
        Email: u.email,
        Role: u.role,
        "User ID": u.user_id,
        "Crop Type": u.crop_type_id?.crop_type_name
          ? u.crop_type_id?.crop_type_name.charAt(0).toUpperCase() +
            u.crop_type_id?.crop_type_name.slice(1)
          : "-",
        Quantity: u.crop_type_id?.quantity || "-",
        Farmer: u.farmer_id?.name || "-",
      };

      let maxRowHeight = 6;
      let debugLines = {};

      column.forEach((col) => {
        const cellText = String(row[col.label] ?? "");
        const lines = doc.splitTextToSize(cellText, col.width - 4);
        const cellHeight = lines.length * 4.5;
        maxRowHeight = Math.max(maxRowHeight, cellHeight);
        debugLines[col.label] = lines.length;
      });

      const wouldExceedPage = y + maxRowHeight > maxYPosition;

      if (wouldExceedPage && i > 0) {
        doc.addPage();
        y = 12;

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        column.forEach((col) => {
          doc.rect(col.x, y, col.width, 7, "S");
          doc.text(col.label, col.x + 2, y + 5);
        });
        y += 7;
        doc.setFont("helvetica", "normal");
      }

      column.forEach((col) => {
        const cellText = String(row[col.label] ?? "");
        const lines = doc.splitTextToSize(cellText, col.width - 4);
        doc.rect(col.x, y, col.width, maxRowHeight, "S");

        lines.forEach((line, lineIdx) => {
          doc.text(line, col.x + 2, y + 3 + lineIdx * 4);
        });
      });

      y += maxRowHeight;
    });

    const hasQuantity = data.some((u) => {
      const qty = parseFloat(u.crop_type_id?.quantity);
      return !Number.isNaN(qty) && qty > 0;
    });

    if (hasQuantity) {
      const totalQuantity = data.reduce((sum, u) => {
        const qty = parseFloat(u.crop_type_id?.quantity) || 0;
        return sum + qty;
      }, 0);

      // ---- single 100% width row ----
      const fullWidth = tableWidth; // same as earlier: pageWidth - 10
      const startX = 5; // same as your table start
      const rowHeight = 7;

      // page break for this row
      if (y + rowHeight > maxYPosition) {
        doc.addPage();
        y = 12;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        column.forEach((col) => {
          doc.rect(col.x, y, col.width, 7, "S");
          doc.text(col.label, col.x + 2, y + 5);
        });
        y += 7;
        doc.setFont("helvetica", "normal");
      }

      const text = `TOTAL CAVANS: ${totalQuantity.toLocaleString("en-PH")}`;

      doc.setFont("helvetica", "bold");
      doc.rect(startX, y, fullWidth, rowHeight, "S"); // one big cell
      doc.text(text, startX + 2, y + 5); // left‑aligned inside
      doc.setFont("helvetica", "normal");

      y += rowHeight;
    }

    doc.save(`${report_title}.pdf`);
  }

  return (
    <div className="bg-green-200 rounded-full border-5 border-green-300 p-1 flex items-center">
      <button
        onClick={() => Generate()}
        className="flex items-center gap-2 rounded-full p-3 px-5 cursor-pointer text-green-900 hover:bg-[rgba(0,0,0,0.1)] transition-all duration-300"
      >
        <CgSoftwareDownload />
        <span>Generate Report</span>
      </button>
    </div>
  );
}
