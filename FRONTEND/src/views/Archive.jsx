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
import "jspdf-autotable";
import Loading from "../component/Loading";
import { ToastContainer, toast } from "react-toastify";

function Archive() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [search, setSearch] = useState("");
  const [modalFilter, setModalFilter] = useState(false);
  const [filter, setFilter] = useState({
    status: "all",
    location: "all",
    date_from: null,
  });
  const { addresses } = useAddresses();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);

  function useAddresses() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchAddresses = async () => {
        setLoading(true);
        try {
          const res = await api.get("/addresses");
          setAddresses(res.data);
        } catch (err) {
          console.error("Failed to fetch addresses:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchAddresses();
    }, []);

    return { addresses, loading };
  }

  const tableHeadings = ["Farmer", "Booked Dryer", "Location", "Crop Type", "Quantity", "Payment", "Date", "Status",];

  const tableDataCell = ["farmer_name", "dryer_name", "dryer_location", "crop_type", "quantity", "payment", "created_at", "status",];

  const fieldsFilter = [
    {
      label: "Location (Sablayan)",
      type: "select",
      name: "location",
      options: [
        { value: "all", phrase: "All" },
        ...addresses.map((a) => ({ value: a.name, phrase: a.name })),
      ],
      defaultValue: filter.location,
      colspan: 2,
    },
    {
      label: "Status",
      type: "select",
      name: "status",
      options: [
        { value: "all", phrase: "All" },
        { value: "pending", phrase: "Pending" },
        { value: "approved", phrase: "Approved" },
        { value: "denied", phrase: "Denied" },
        { value: "completed", phrase: "Completed" },
      ],
      defaultValue: filter.status,
      colspan: 1,
    },
    {
      label: "Date",
      type: "date",
      name: "date_from",
      colspan: 1,
    },
  ];

  const handleSubmitFilter = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = Object.fromEntries(new FormData(e.target).entries());
      setFilter((prev) => ({ ...prev, ...data }));
      setModalFilter(false);
      setCurrentPage(1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("archive_data");
    const data = JSON.parse(local);
    setData(
      Array.isArray(data)
        ? data?.map((res) => ({
            ...res,
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
          }))
        : []
    );

    if (!Array.isArray(data)) setIsLoading(true);

    try {

      const result = await api.get("/reservations/archive", {
        params: {
          limit: limit,
          offset: currentPage * limit - limit,
          status: filter.status,
          location: filter.location,
          date_from: filter.date_from,
          search: search,
        },
      });

      result.data.totalCount &&
        setTotalPages(Math.ceil(result.data.totalCount / limit));

      if (!Array.isArray(result.data.data))
        throw new Error("Invalid data from API");
      const isDifferent =
        JSON.stringify(data) !==
        JSON.stringify(Array.isArray(result.data.data) ? result.data.data : []);
      if (isDifferent) {
        setData(
          result.data.data?.map((res) => ({
            ...res,
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
          }))
        );
        localStorage.setItem("archive_data", JSON.stringify(result.data.data));
      }
    } catch (error) {
      console.error(error);
      setIsError(true);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    limit,
    currentPage,
    filter.status,
    filter.location,
    filter.date_from,
    search,
  ]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);
  
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * limit;

  if (isError) {
    return (
      <div className="absolute top-0 left-0 w-full h-[calc(100dvh-56px)] text-5xl flex justify-center items-center font-bold py-5">
        Error while fetching the data
      </div>
    );
  }

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

    const dataToExport = data.map((item) => [
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
    if (data.length === 0) {
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

    const rows = data.map((item) => [
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
      {loading && <Loading />}
      <ToastContainer position="top-center" autoClose={3000} />
      {modalFilter && (
        <Modal
          setModal={setModalFilter}
          handleSubmit={handleSubmitFilter}
          fields={fieldsFilter}
          title={"Filters"}
          button_name={"Apply Filters"}
        />
      )}
      <div
        className={`w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5 ${
          modalFilter ? "overflow-hidden" : "overflow-auto"
        }`}
      >
          <div className="w-full flex flex-col md:flex-row justify-center gap-5">
            <Search setSearch={setSearch} setModal={setModalFilter} />
          </div>

          <div className="w-full text-right mt-5">
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
          </div>

          <div className="w-full lg:bg-gray-300 rounded-lg lg:p-5 my-5">
            <div className="overflow-auto max-h-[400px]">
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <>
                  <Table
                    data={data}
                    startIndex={startIndex}
                    tableHeadings={tableHeadings}
                    tableDataCell={tableDataCell}
                  />
                  {data?.length === 0 && (
                    <>
                      <div className="hidden lg:flex justify-center items-center font-bold py-5">
                        No Archives Found.
                      </div>

                      <div className="lg:hidden rounded-md flex flex-col">
                        <div className="bg-[rgb(138,183,45)] p-2 flex justify-end rounded-t-md">
                          <div className="w-6 h-6 flex justify-center items-center text-[rgb(138,183,45)] font-bold rounded-full bg-white">
                            0
                          </div>
                        </div>
                        <div className="p-3 bg-[rgba(255,255,255,0.9)] backdrop-filter-[6px] border border-[rgb(138,183,45)] rounded-b-md text-center font-bold">
                          No Archives Found.
                        </div>
                      </div>
                    </>
                  )}
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
