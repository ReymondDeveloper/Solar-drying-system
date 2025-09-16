import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Loading from "../component/Loading";
import Modal from "../component/Modal";
import Button from "../component/Button";

function ReservationHistory() {
  const farmerId = localStorage.getItem("farmer_id") || localStorage.getItem("id") || null;
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalView, setModalView] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [datasView, setDatasView] = useState([]);
  const tableHeadings = [
    "Farmer",
    "Booked Dryer",
    "Location (Sablayan)",
    "Crop Type",
    "Quantity",
    "Payment",
    "Date",
    "Status",
    "Action",
  ];

  const tableDataCell = [
    "farmer_name",
    "dryer_name",
    "location",
    "crop_type_name",
    "quantity",
    "payment",
    "date",
    "status",
    "action",
  ];

  const fieldsFilter = [
    {
      label: "Status",
      type: "select",
      name: "status",
      options: [
        { value: "all", phrase: "All" },
        { value: "approved", phrase: "Approved" },
        { value: "denied", phrase: "Denied" },
      ],
    },
  ];

  const handleSubmitFilter = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    setFilter(data.status);
    setLoading(false);
    setModalFilter(false);
  };

  const handleSubmitView = (e) => {
    e.preventDefault();
    setLoading(true);
    setLoading(false);
    setModalView(false);
  };

  function parseNotes(notes) {
    if (!notes) return null;
    if (typeof notes === "object") return notes;

    try {
      const parsed = JSON.parse(notes);
      if (typeof parsed === "object") return parsed;
    } catch (err) {}

    const obj = {};
    notes.split(",").forEach((part) => {
      const [k, ...rest] = part.split(":");
      if (!k || rest.length === 0) return;
      const v = rest.join(":").trim();
      const key = k.trim().toLowerCase().replace(/\s+/g, "_");
      obj[key] = v;
    });

    return Object.keys(obj).length ? obj : { notes: String(notes) };
  }

  function handleView(reservation) {
    if (reservation?.notes) {
      const parsed = parseNotes(reservation.notes);
      setDatasView([parsed]);
    } else {
      setDatasView([]);
    }
    setModalView(true);
  }

  const fetchHistory = async () => {
    if (!farmerId) return;
    setIsLoading(true);
  
    try {
      const token = localStorage.getItem("token");   
      const res = await axios.get(`${import.meta.env.VITE_API}/reservations`, {
        params: { farmer_id: farmerId },
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      });
  
      if (!Array.isArray(res.data)) throw new Error("Invalid API response");
  
      setData(
        res.data.map((reservation) => ({
          farmer_name: reservation.farmer_name || "N/A",
          dryer_name: reservation.dryer_name || "N/A",
          location: reservation.location || "N/A",
          crop_type_name: reservation.crop_type_name || "N/A",
          quantity: reservation.quantity || 0,
          payment: reservation.payment || "N/A",
          date: reservation.created_at
            ? new Date(reservation.created_at).toLocaleDateString()
            : "N/A",
          status: reservation.status || "pending",
          action: (
            <Button
              onClick={() => handleView(reservation)}
              className="bg-blue-400 hover:bg-blue-500 text-white"
            >
              View
            </Button>
          ),
        }))
      );
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [farmerId, currentPage, limit]);

  const FilteredData = data.filter((info) => {
    const filterByFilters =
      filter && filter !== "all"
        ? info.status.toLowerCase().includes(filter.toLowerCase())
        : true;

    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "action" && key !== "status")
          .some(([, value]) =>
            String(value).toLowerCase().includes(search.toLowerCase())
          )
      : true;
    return filterByFilters && filterBySearch;
  });

  const totalPages = Math.max(1, Math.ceil(FilteredData.length / limit));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * limit;

  return (
    <>
      {loading && <Loading />}
      {modalFilter && (
        <Modal
          setModal={setModalFilter}
          handleSubmit={handleSubmitFilter}
          fields={fieldsFilter}
          title={"Filters"}
          button_name={"Apply Status"}
        />
      )}
      {modalView && (
        <Modal
          setModal={setModalView}
          handleSubmit={handleSubmitView}
          datas={datasView}
          title={"Reservation Details"}
          button_name={"Done"}
        />
      )}
      <div
        className={`w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5 ${
          modalFilter || modalView ? "overflow-hidden" : "overflow-auto"
        }`}
      >
        <Search setSearch={setSearch} setModal={setModalFilter} />
        <div className="w-full lg:bg-gray-300 rounded-lg lg:p-5 my-5">
          <div className="overflow-auto max-h-[400px]">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <>
                <Table
                  data={FilteredData.slice(startIndex, startIndex + limit)}
                  startIndex={startIndex}
                  tableHeadings={tableHeadings}
                  tableDataCell={tableDataCell}
                />
                {FilteredData?.length === 0 && (
                  <div className="flex justify-center items-center font-bold py-5">
                    No History Found.
                  </div>
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

export default ReservationHistory;
