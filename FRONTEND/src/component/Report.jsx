import { CgSoftwareDownload } from "react-icons/cg";
import JsPdf from "jspdf";

export default function Report({ report_title, column, data }) {
    function Generate() {
		console.clear();
		console.log("🚀 PDF Generation Started");
		
		const doc = new JsPdf("p", "mm", "a4");
		const getCenteredPage = (text) => doc.internal.pageSize.width / 2 - doc.getTextWidth(text) / 2;

		// ✅ DEBUG: Initial Setup
		console.log("=== PDF SETUP ===");
		console.log("Page Width:", doc.internal.pageSize.getWidth()); // Should be ~210mm
		console.log("Page Height:", doc.internal.pageSize.getHeight()); // Should be 297mm
		console.log("Data length:", data.length); // ⚠️ CHECK THIS FIRST

		doc.setFontSize(10);

		// Header section
		const logo = '/logo.png';
		doc.addImage(logo, 'PNG', 5, 12, 30, 25);

		doc.text(
			"Republic of the Philippines",
			getCenteredPage("Republic of the Philippines"),
			20,
		);

		doc.text(
			"Province of Occidental Mindoro",
			getCenteredPage("Province of Occidental Mindoro"),
			24,
		);

		doc.setFont("helvetica", "bold");
		doc.text(
			"Municipality of Sablayan",
			getCenteredPage("Municipality of Sablayan"),
			28,
		);

		doc.setFont("helvetica", "normal");
		doc.text(
			"o0o",
			getCenteredPage("o0o"),
			32,
		);

		doc.setFont("helvetica", "bold");
		doc.text(
			"OFFICE OF THE MUNICIPAL TREASURER",
			getCenteredPage("OFFICE OF THE MUNICIPAL TREASURER"),
			36,
		);

		doc.rect(5, 40, 200, 1, 'F');

		doc.setFontSize(12);
		doc.text(
			report_title,
			getCenteredPage(report_title),
			48,
		);

		// ✅ TABLE SETUP
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
		const tableWidth = pageWidth - 10;
		const bottomMargin = 10;
		const maxYPosition = pageHeight - bottomMargin; // 287mm
		
		let y = 52; // Content starts after headers
		let x = 5;
		let pageNumber = 1;
		let totalRowsRendered = 0;

		console.log("=== TABLE SETUP ===");
		console.log("Table width:", tableWidth.toFixed(2), "mm");
		console.log("Max Y position:", maxYPosition.toFixed(2), "mm");
		console.log("Starting Y:", y.toFixed(2), "mm");
		console.log("Usable height per page:", (maxYPosition - y).toFixed(2), "mm");
		console.log("Columns:", column.length);

		// Configure column widths
		column.forEach((c) => {
			c.x = x;
			c.width = tableWidth * c.ratio;
			x += c.width;
			console.log(`  Column "${c.label}": width=${c.width.toFixed(2)}mm, ratio=${c.ratio}`);
		});

		// Draw table headers (first page only)
		doc.setFontSize(8);
		doc.setFont("helvetica", "bold");
		column.forEach((col) => {
			doc.rect(col.x, y, col.width, 7, "S");
			doc.text(col.label, col.x + 2, y + 5);
		});

		y += 7; // Move past header row
		doc.setFont("helvetica", "normal");

		console.log("\n=== ROW PROCESSING ===");

		// ✅ MAIN LOOP WITH DEBUGGING
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
				"Status": u.status || "-",
				"Duration": `${u.date_from || "N/A"} - ${u.date_to || "N/A"}`,
				"Operation Status": u.is_operation
					? "Yes"
					: `No - ${u.operation_reason ?? "Maintenance"}`,
				"Reservation Status": u.available_capacity > 0 ? "available" : "occupied",
				"First Name": u.first_name,
				"Last Name": u.last_name,
				"Address": u.address,
				"Email": u.email,
				"Role": u.role,
			};

			// Calculate max row height based on text wrapping
			let maxRowHeight = 6;
			let debugLines = {};
			
			column.forEach((col) => {
				const cellText = String(row[col.label] ?? "");
				const lines = doc.splitTextToSize(cellText, col.width - 4);
				const cellHeight = lines.length * 4.5; // ✅ Reduced from 5 for tighter spacing
				maxRowHeight = Math.max(maxRowHeight, cellHeight);
				debugLines[col.label] = lines.length;
			});

			// ✅ PAGE BREAK LOGIC - CRITICAL
			const wouldExceedPage = (y + maxRowHeight) > maxYPosition;
			
			if (wouldExceedPage && i > 0) { // Don't break before first row
				console.log(`📄 PAGE BREAK at row ${i + 1}: y=${y.toFixed(1)}mm, nextY=${(y + maxRowHeight).toFixed(1)}mm (max: ${maxYPosition.toFixed(1)}mm)`);
				
				doc.addPage();
				pageNumber++;
				y = 12; // Top margin for new pages
				
				// ✅ REDRAW HEADERS ON NEW PAGE
				doc.setFontSize(8);
				doc.setFont("helvetica", "bold");
				column.forEach((col) => {
					doc.rect(col.x, y, col.width, 7, "S");
					doc.text(col.label, col.x + 2, y + 5);
				});
				y += 7;
				doc.setFont("helvetica", "normal");
				
				console.log(`  → New page ${pageNumber} started at y=${y.toFixed(1)}mm`);
			}

			// Draw the row
			column.forEach((col) => {
				const cellText = String(row[col.label] ?? "");
				const lines = doc.splitTextToSize(cellText, col.width - 4);
				doc.rect(col.x, y, col.width, maxRowHeight, "S");
				
				lines.forEach((line, lineIdx) => {
					doc.text(
						line,
						col.x + 2,
						y + 3 + lineIdx * 4
					);
				});
			});

			totalRowsRendered++;
			
			// Log every 10 rows
			if ((i + 1) % 10 === 0 || i === 0 || i === data.length - 1) {
				console.log(`Row ${String(i + 1).padStart(4)}: height=${maxRowHeight.toFixed(1)}mm, y=${y.toFixed(1)}mm, page=${pageNumber}, lines=${JSON.stringify(debugLines)}`);
			}

			y += maxRowHeight;
		});

		console.log("\n=== SUMMARY ===");
		console.log("✅ Total rows rendered:", totalRowsRendered);
		console.log("✅ Total pages:", doc.internal.pages.length - 1); // -1 for empty first page
		console.log("✅ Expected capacity:", Math.ceil(totalRowsRendered / (pageHeight - 52)));

		// ✅ VALIDATION CHECKS
		if (data.length === 0) {
			console.error("❌ ERROR: No data provided!");
		} else if (totalRowsRendered !== data.length) {
			console.error(`❌ ERROR: Only rendered ${totalRowsRendered} of ${data.length} rows!`);
		} else {
			console.log("✅ All rows rendered successfully!");
		}

		doc.save(`${report_title}.pdf`);
		console.log(`📥 PDF saved as: ${report_title}.pdf`);
	}

    return(
        <div className="bg-green-200 rounded-full border-5 border-green-300 p-1 flex items-center">
            <button onClick={() => Generate()} className="flex items-center gap-2 rounded-full p-3 px-5 cursor-pointer text-green-900 hover:bg-[rgba(0,0,0,0.1)] transition-all duration-300">
                <CgSoftwareDownload />
                <span>Generate Report</span>
            </button>
        </div>
    )
}