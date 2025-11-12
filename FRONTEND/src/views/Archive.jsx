import { useState, useEffect, useCallback } from "react";
import Pagination from "../utils/Pagination";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Search from "../component/Search";
import Button from "../component/Button";
import Modal from "../component/Modal";
import api from "../api/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import "jspdf-autotable";

function Archive() {
  const [archiveData, setArchiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [search, setSearch] = useState("");
  const [datasView, setDatasView] = useState([]);
  const [modalView, setModalView] = useState(false);

  const fetchArchiveData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.get("/reservations/archive", {
        params: {
          limit: limit,
          offset: currentPage * limit - limit,
        },
      });

      result.data.totalCount &&
        setTotalPages(Math.ceil(result.data.totalCount / limit));

      const formattedData = result.data.data.map((item) => {
        return {
          ...item,
          created_at: item.created_at
            ? new Date(item.created_at).toLocaleString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
          action: (
            <Button
              onClick={() => handleView(item)}
              className="bg-blue-400 hover:bg-blue-500 text-white"
            >
              View
            </Button>
          ),
        };
      });
      setArchiveData(formattedData);
    } catch (error) {
      console.error("Error fetching archived reservations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [limit, currentPage]);

  useEffect(() => {
    fetchArchiveData();
  }, [fetchArchiveData]);

  const filteredData = archiveData.filter((item) => {
    return Object.values(item).some(
      (value) =>
        value && value.toString().toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleView = (item) => {
    setDatasView(item);
    setModalView(true);
  };

  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * limit;

  const downloadExcel = () => {
    const header = [
      "Farmer",
      "Booked Dryer",
      "Location",
      "Crop Type",
      "Quantity",
      "Payment",
      "Date",
      "Status",
    ];

    const dataToExport = filteredData.map((item) => [
      item.farmer_name || "N/A",
      item.dryer_name || "N/A",
      item.dryer_location || "N/A",
      item.crop_type || "N/A",
      item.quantity || 0,
      item.payment || "N/A",
      item.created_at || "N/A",
      item.status || "N/A",
    ]);

    const combinedData = [header, ...dataToExport];

    const ws = XLSX.utils.aoa_to_sheet(combinedData);

    ws["!cols"] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 30 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Archive Data");

    XLSX.writeFile(wb, "Archive_Report.xlsx");
  };

  const downloadPDF = () => {
    if (filteredData.length === 0) {
      toast.error("No data available to download.");
      return;
    }

    const doc = new jsPDF("l", "mm", "a4");
    const columns = [
      "Farmer",
      "Booked Dryer",
      "Location",
      "Crop Type",
      "Quantity",
      "Payment",
      "Date",
      "Status",
    ];

    const rows = filteredData.map((item) => [
      item.farmer_name || "N/A",
      item.dryer_name || "N/A",
      item.dryer_location || "N/A",
      item.crop_type || "N/A",
      item.quantity || 0,
      item.payment || "N/A",
      item.created_at || "N/A",
      item.status || "N/A",
    ]);

    const getCenteredPage = (text) =>
      doc.internal.pageSize.width / 2 - doc.getTextWidth(text) / 2;
    doc.setFontSize(12);
    doc.text(
      "Archive Reservation Report",
      getCenteredPage("Archive Reservation Report"),
      10
    );
    doc.text(
      "Generated on: " + new Date().toLocaleString(),
      getCenteredPage("Generated on: " + new Date().toLocaleString()),
      16
    );

    let y = 30;
    const columnWidth = 37;
    const columnWidths = 34;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    columns.forEach((col, index) => {
      doc.text(col, 10 + index * columnWidth, y);
    });

    doc.setLineWidth(0.2);
    doc.line(10, y + 2, 10 + columns.length * columnWidths, y + 2);

    y += 10;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    rows.forEach((row) => {
      row.forEach((cell, index) => {
        doc.text(cell.toString(), 10 + index * columnWidth, y);
      });
      y += 8;
    });

    doc.save("Archive_Report.pdf");
  };

  return (
    <>
      {modalView && (
        <Modal
          setModal={setModalView}
          datas={datasView}
          title={"Reservation Details"}
          button_name={"Done"}
        />
      )}

      <div className="w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5">
        <Search setSearch={setSearch} />
        <div className="flex justify-end gap-4 my-4">
          <Button
            onClick={downloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Download Excel
          </Button>
          <Button
            onClick={downloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Download PDF
          </Button>
        </div>
        <div className="w-full lg:bg-gray-300 rounded-lg lg:p-5 my-5">
          <div className="overflow-auto max-h-[400px]">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <>
                <Table
                  data={filteredData}
                  startIndex={startIndex}
                  tableHeadings={[
                    "Farmer",
                    "Booked Dryer",
                    "Location",
                    "Crop Type",
                    "Quantity",
                    "Payment",
                    "Date",
                    "Status",
                  ]}
                  tableDataCell={[
                    "farmer_name",
                    "dryer_name",
                    "dryer_location",
                    "crop_type",
                    "quantity",
                    "payment",
                    "created_at",
                    "status",
                  ]}
                />
              </>
            )}
          </div>
        </div>

        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          currentPageSafe={currentPageSafe}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}

export default Archive;
