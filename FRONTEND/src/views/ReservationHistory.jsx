import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Loading from "../component/Loading";
import Modal from "../component/Modal";
import Button from "../component/Button";
import api from "../api/api.js";
import GcashModal from "../component/GcashModal.jsx";

function ReservationHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalView, setModalView] = useState(false);
  const [gcashModal, setGcashModal] = useState(false);
  const [filter, setFilter] = useState({ status: "all", location: "all" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [datasView, setDatasView] = useState([]);
  const { addresses } = useAddresses();
  const location = useLocation();

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

  const tableHeadings =[
    "Booked Dryer",
    "Location",
    "Crop Type",
    "Quantity (Canvan)",
    "Payment",
    "Duration",
    "Status",
    "Action",
  ];

  const tableDataCell = [
    "dryer_name",
    "location",
    "crop_type",
    "quantity",
    "payment",
    "duration",
    "status",
    "action",
  ];

  const fieldsFilter = [
    {
      label: "Status",
      type: "select",
      name: "status",
      options: [
        { value: "all", phrase: "Lahat" },
        { value: "pending", phrase: "Pending" },
        { value: "approved", phrase: "Approved" },
        { value: "denied", phrase: "Denied" },
        { value: "completed", phrase: "Completed" },
      ],
      defaultValue: filter.status,
      colspan: 2,
    },
    {
      label: "Location (Sablayan)",
      type: "select",
      name: "location",
      options: [
        { value: "all", phrase: "Lahat" },
        ...addresses.map((a) => ({ value: a.name, phrase: a.name })),
      ],
      defaultValue: filter.location,
      colspan: 2,
    },
  ];

  const fieldsGcash = [
    { type: "file", name: "image", accept: "image/*" },
    {
      type: "tel",
      label: "Number",
      name: "sender",
      pattern: `^\\+63\\s?9\\d{2}\\s?\\d{3}\\s?\\d{4}$`,
      placeholder: "ex. +63 9XX XXX XXXX",
      required: true,
    },
    {
      type: "number",
      label: "Amount",
      name: "amount",
      step: "0.01",
      min: "0.01",
      placeholder: "ex. 1000.00",
      required: true,
    },
    {
      type: "text",
      label: "Reference No.",
      name: "reference",
      inputMode: "numeric",
      placeholder: "ex. 1234 567 891011",
      required: true,
    },
    {
      type: "text",
      label: "Date",
      name: "date",
      required: true,
    },
  ];

  const handleSubmitFilter = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = Object.fromEntries(new FormData(e.target).entries());
      setFilter((prev) => ({ ...prev, ...data }));
      setModalFilter(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGcash = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fields = Object.fromEntries(formData.entries());

    setLoading(true);
    const newEntry = {
      from: fields.sender,
      amount: fields.amount,
      reference_no: fields.reference,
      date: fields.date,
      reservation_id: datasView.id,
    };

    try {
      await api.post(`${import.meta.env.VITE_API}/transactions`, newEntry);
    } catch (error) {
      console.error(error);
    } finally {
      setModalView(true);
      setGcashModal(false);
      setLoading(false);
    }
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
    setData(
      Array.isArray(data)
        ? data?.map((res) => ({
            dryer_name: res.dryer_id.dryer_name || "N/A",
            location: res.dryer_id.location || "N/A",
            crop_type: res.crop_type_id.crop_type_name || "N/A",
            quantity: res.crop_type_id.quantity || 0,
            payment: res.crop_type_id.payment || "N/A",
            notes: res.notes || res.crop_type_id.notes || "",
            duration: `${res.date_from || "N/A"} - ${res.date_to || "N/A"}`,
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
      const result = await api.get("/reservations/home", {
        params: {
          farmer_id: localStorage.getItem("id"),
          limit: limit,
          offset: currentPage * limit - limit,
          status: filter.status,
          location: filter.location,
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
            dryer_name: res.dryer_id.dryer_name || "N/A",
            location: res.dryer_id.location || "N/A",
            crop_type: res.crop_type_id.crop_type_name || "N/A",
            quantity: res.crop_type_id.quantity || 0,
            payment: res.crop_type_id.payment || "N/A",
            notes: res.notes || res.crop_type_id.notes || "",
            duration: `${res.date_from || "N/A"} - ${res.date_to || "N/A"}`,
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
          JSON.stringify(result.data.data)
        );
      }
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setIsLoading(false);
      const params = new URLSearchParams(location.search);
      if (params.get("id")) {
        if (JSON.parse(localStorage.getItem("reservation_history_notification")) === null) {
          localStorage.setItem("reservation_history_notification", params.get("id"));
          const data = JSON.parse(localStorage.getItem("reservation_history_data"));
          const targetReservation = data.find(item => item.id === params.get("id"));
          handleView(targetReservation);
          window.history.replaceState({}, '', location.pathname);
        }
      }
    }
  }, [handleView, limit, currentPage, filter.status, filter.location, search, location]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("pending")) {
      setFilter((prev) => ({ ...prev, status: "pending" }));
    } else if (params.get("approved")) {
      setFilter((prev) => ({ ...prev, status: "approved" }));
    } else if (params.get("completed")) {
      setFilter((prev) => ({ ...prev, status: "completed" }));
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

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
          setGcashModal={setGcashModal}
          datas={datasView}
          title="Reservation Details"
          button_name="Done"
        />
      )}
      {gcashModal && (
        <GcashModal
          onSubmit={handleSubmitGcash}
          onClick={() => setGcashModal(() => false)}
          field={fieldsGcash}
          setLoading={setLoading}
          buttonName={"Save Record"}
        />
      )}
      <div
        className={`w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5 ${
          modalFilter || modalView ? "overflow-hidden" : "overflow-auto"
        }`}
      >
        <div className="w-full flex justify-center">
          <Search setSearch={setSearch} setModal={setModalFilter} />
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
                  <div className="flex justify-center items-center font-bold py-5">
                    Your reservation history is empty.
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

      {loading && <Loading />}
    </>
  );
}

export default ReservationHistory;
