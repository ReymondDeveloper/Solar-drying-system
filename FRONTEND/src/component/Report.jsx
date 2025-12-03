import { CgSoftwareDownload } from "react-icons/cg";
import JsPdf from "jspdf";

export default function Report({ report_title, column, data }) {
    function Generate() {
		const doc = new JsPdf("p", "mm", "a4");
		const getCenteredPage = (text) => doc.internal.pageSize.width / 2 - doc.getTextWidth(text) / 2;

		doc.setFontSize(10);

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

		const pageWidth = doc.internal.pageSize.getWidth();
		const tableWidth = pageWidth - 10;
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

			let maxRowHeight = 6;
			column.forEach((col) => {
				const cellText = String(row[col.label] ?? "");
				const lines = doc.splitTextToSize(cellText, col.width - 4);
				const cellHeight = lines.length * 5;
				maxRowHeight = Math.max(maxRowHeight, cellHeight);
			});

			if (y + maxRowHeight > 285) {
				doc.addPage();
				y = 12;
			}

			column.forEach((col) => {
				const cellText = String(row[col.label] ?? "");
				const lines = doc.splitTextToSize(cellText, col.width - 4);

				doc.rect(col.x, y, col.width, maxRowHeight, "S");

				lines.forEach((line, lineIdx) => {
				doc.text(
					line,
					col.x + 2,
					y + 4 + lineIdx * 4
				);
				});
			});

			y += maxRowHeight;
			});


		doc.save(`${report_title}.pdf`);
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