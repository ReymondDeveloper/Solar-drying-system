import { useState, useEffect, useCallback } from "react";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Loading from "../component/Loading";
import Modal from "../component/Modal";
import Button from "../component/Button";
import api from "../api/api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ReservationHistory() {
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
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const tableHeadings =
    role === "farmer"
      ? [
          "Magsasaka",
          "Pinag-book na Patuyuan",
          "Lokasyon",
          "Uri ng Pananim",
          "Dami (Canvans)",
          "Paraan ng Pagbabayad",
          "Petsa",
          "Katayuan",
          "Aksyon",
        ]
      : [
          "Farmer",
          "Booked Dryer",
          "Location",
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
    "crop_type",
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
      colspan: 2,
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

  const handleView = useCallback((data) => {
    setDatasView(() => data);
    setModalView(true);
  }, []);

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("reservation_history_data");
    const data = JSON.parse(local);
    console.log("🧩 LOG: Local cached data:", data);

    setData(
      Array.isArray(data)
        ? data?.map((res) => ({
            farmer_name: res.farmer_id.first_name || "N/A",
            dryer_name: res.dryer_id.dryer_name || "N/A",
            location: res.dryer_id.location || "N/A",
            crop_type: res.crop_type_id.crop_type_name || "N/A",
            quantity: res.crop_type_id.quantity || 0,
            payment: res.crop_type_id.payment || "N/A",
            notes: res.notes || res.crop_type_id.notes || "",
            date: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            status: res.status || "pending",
            action: (
              <Button
                onClick={() => handleView(res)}
                className="bg-blue-400 hover:bg-blue-500 text-white"
              >
                View
              </Button>
            ),
          }))
        : []
    );

    if (!Array.isArray(data)) setIsLoading(true);

    try {
      const result = await api.get(
        `${
          import.meta.env.VITE_API
        }/reservations/home?farmer_id=${localStorage.getItem("id")}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!Array.isArray(result.data)) throw new Error("Invalid data from API");
      const isDifferent =
        JSON.stringify(data) !==
        JSON.stringify(Array.isArray(result.data) ? result.data : []);
        
    console.log("🧩 LOG: Local cached data1:", result.data);

      if (isDifferent) {
        setData(
          result.data?.map((res) => ({
            farmer_name: res.farmer_id.first_name || "N/A",
            dryer_name: res.dryer_id.dryer_name || "N/A",
            location: res.dryer_id.location || "N/A",
            crop_type: res.crop_type_id.crop_type_name || "N/A",
            quantity: res.crop_type_id.quantity || 0,
            payment: res.crop_type_id.payment || "N/A",
            notes: res.notes || res.crop_type_id.notes || "",  
            date: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            status: res.status || "pending",
            action: (
              <Button
                onClick={() => handleView(res)}
                className="bg-blue-400 hover:bg-blue-500 text-white"
              >
                View
              </Button>
            ),
          }))
        );
        localStorage.setItem(
          "reservation_history_data",
          JSON.stringify(result.data)
        );
      }
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [handleView]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

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
      <ToastContainer position="top-center" autoClose={3000} />
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
          title={
            role === "farmer"
              ? "Mga Detalye ng Reserbasyon"
              : "Reservation Details"
          }
          button_name={role === "farmer" ? "Tapos" : "Done"}
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
                    {role === "farmer"
                      ? "Wala ka pang kasaysayan ng transaksyon."
                      : "Your transaction history is empty."}
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
