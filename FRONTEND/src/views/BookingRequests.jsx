import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import Button from "../component/Button";
import api from "../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Report from "../component/Report"

function BookingRequests() {
  const role = localStorage.getItem("role");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalView, setModalView] = useState(false);
  const [datasView, setDatasView] = useState([]);
  const [fieldsEdit, setFieldsEdit] = useState([]);
  const [modalEdit, setModalEdit] = useState(false);
  const [filter, setFilter] = useState({ 
    status: "all",
    location: "all",
    date_from: null,
    date_to: null,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { addresses } = useAddresses();
  const location = useLocation();
  const [report, setReport] = useState([]);

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

  const tableHeadings = [
    "Farmer Name",
    "Dryer Location",
    "Crop Type",
    "Quantity (Cavan)",
    "Date Created",
    "Duration",
    "Status",
    "Action",
  ];

  const tableDataCell = [
    "farmer_name",
    "location",
    "crop_type",
    "quantity",
    "created_at",
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
        { value: "all", phrase: "All" },
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
        { value: "all", phrase: "All" },
        ...addresses.map((a) => ({ value: a.name, phrase: a.name })),
      ],
      defaultValue: filter.location,
      colspan: 2,
    },
    {
      label: "Date From",
      type: "date",
      name: "date_from",
      colspan: 1,
      onchange: (e) => {
        if (document.querySelector('input[name="date_to"]')) {
          document.querySelector('input[name="date_to"]').min = e.target.value;
        }
      },
    },
    {
      label: "Date To",
      type: "date",
      name: "date_to",
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
      window.history.replaceState({}, '', location.pathname);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      setLoading(true);
      await api.put(`/reservations/${data.id}`, {
        status: data.status,
        notes: data.notes || null,
        quantity: data.quantity,
      });

      toast.success("Booking is updated successfully!");

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: localStorage.getItem("booking_requests_farmer_id"),
        context:
          `Dryer's owner of "${localStorage
            .getItem("booking_requests_dryer_name")
            .toUpperCase()}" successfully updated your reservation status at ` +
          new Date().toLocaleString(),
        url: `/home/reservation-history?id=${data.id}`,
      });

      setModalEdit(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = useCallback((data) => {
    localStorage.setItem("booking_requests_farmer_id", data.farmer_id.id);
    localStorage.setItem(
      "booking_requests_dryer_name",
      data.dryer_id.dryer_name
    );

    const handleStatusChange = (e) => {
      const status = e.target.value;
      setFieldsEdit((prev) => {
        const fieldsWithoutNotes = prev.filter((f) => f.name !== "notes");

        if (status === "denied") {
          fieldsWithoutNotes.push({
            label: "Notes",
            type: "textarea",
            name: "notes",
            defaultValue: data.notes || "",
            placeholder: "Please enter reason for denial",
            required: true,
            colspan: 2,
          });
        }

        return fieldsWithoutNotes;
      });
    };

    const isOwner = localStorage.getItem("role") === "owner";
    const options = [];
    if (data.status === "pending") {
      options.push(
        { value: "pending", phrase: "Pending" },
        { value: "approved", phrase: "Approved" },
        { value: "denied", phrase: "Denied" }
      );
    } else if (data.status === "approved") {
      options.push(
        { value: "approved", phrase: "Approved" },
        { value: "completed", phrase: "Completed" }
      );
    } else if (data.status === "denied") {
      options.push({ value: "denied", phrase: "denied" });
    } else {
      options.push(
        { value: "pending", phrase: "Pending" },
        { value: "approved", phrase: "Approved" },
        { value: "denied", phrase: "Denied" }
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of day

    const isDateLessThanToday = (dateString) => {
      if (!dateString) return false;
      const date = new Date(dateString + "T00:00:00");
      return data.status === "denied" ? true : data.status === "pending" ? false : date > today ;
    };

    const baseFields = [
      {
        type: "hidden",
        name: "id",
        value: data.id,
      },
      {
        label: "Crop Type",
        type: "text",
        name: "crop_type",
        defaultValue: data.crop_type_id.crop_type_name,
        disabled: true,
        colspan: 2,
      },
      {
        label: "Quantity",
        type: "number",
        name: "quantity",
        defaultValue: data.crop_type_id.quantity,
        disabled: data.dryer_id.dryer_type === "MANUAL" ? false : true,
        colspan: 2,
      },
      {
        label: "Payment",
        type: "text",
        name: "payment",
        defaultValue: data.crop_type_id.payment,
        disabled: true,
        colspan: 2,
      },
      {
        label: "Status",
        type: "select",
        name: "status",
        defaultValue: data.status,
        options: options,
        disabled: data.dryer_id.dryer_type === "MANUAL" ? false : isDateLessThanToday(data.date_to),
        colspan: 2,
        onChange: isOwner ? handleStatusChange : undefined,
      },
      data.status === "denied" && {
        label: "Notes",
        type: "textarea",
        name: "notes",
        defaultValue: data.crop_type_id.notes || "",
        placeholder: "Reason for denial",
        colspan: 2,
      },
    ].filter(Boolean);

    setFieldsEdit(baseFields);
    setModalEdit(true);
  }, []);

  const handleView = useCallback((data) => {
    setDatasView(() => data);
    setModalView(true);
  }, []);

  const handleSubmitView = (e) => {
    e.preventDefault();
    setLoading(true);
    setLoading(false);
    setModalView(false);
  };

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("booking_requests_data");
    const data = JSON.parse(local);
    setData(
      Array.isArray(data)
        ? data?.map((res) => ({
            id: res.id,
            farmer_name: res.farmer_id.name || "N/A",
            location: res.dryer_id.location || "N/A",
            crop_type: res.crop_type_id?.crop_type_name || "N/A",
            quantity: res.crop_type_id?.quantity || "N/A",
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            duration: `${res.date_from || "N/A"} - ${res.date_to || "N/A"}`,
            status: res.status || "pending",
            notes: res.crop_type_id?.notes || "",
            action: (
              <div className="flex justify-center gap-2">
                {res.status !== "completed" && res.status !== "denied" && res.status !== "canceled" && (
                  <Button
                    onClick={() => handleEdit(res)}
                    className="bg-blue-400 hover:bg-blue-500 text-white"
                  >
                    Edit
                  </Button>
                )}
                
                <Button
                  onClick={() => handleView(res)}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  View
                </Button>
              </div>
            ),
          }))
        : []
    );

    if (!Array.isArray(data)) setIsLoading(true);

    try {
      const result = await api.get("/reservations/owner", {
        params: {
          ownerId: localStorage.getItem("id"),
          limit: limit,
          offset: currentPage * limit - limit,
          status: filter.status,
          location: filter.location,
          date_from: filter.date_from,
          date_to: filter.date_to,
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
            id: res.id,
            farmer_name: res.farmer_id.name || "N/A",
            location: res.dryer_id.location || "N/A",
            crop_type: res.crop_type_id?.crop_type_name || "N/A",
            quantity: res.crop_type_id?.quantity || "N/A",
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            duration: `${res.date_from || "N/A"} - ${res.date_to || "N/A"}`,
            status: res.status || "pending",
            notes: res.crop_type_id?.notes || "",
            action: (
              <div className="flex justify-center gap-2">
                {res.status !== "completed" && res.status !== "denied" && res.status !== "canceled" && (
                  <Button
                    onClick={() => handleEdit(res)}
                    className="bg-blue-400 hover:bg-blue-500 text-white"
                  >
                    Edit
                  </Button>
                )}

                <Button
                  onClick={() => handleView(res)}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  View
                </Button>
              </div>
            ),
          }))
        );
        localStorage.setItem(
          "booking_requests_data",
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
        if (JSON.parse(localStorage.getItem("booking_requests_notification")) === null) {
          localStorage.setItem("booking_requests_notification", params.get("id"));
          const data = JSON.parse(localStorage.getItem("booking_requests_data"));
          const targetReservation = data.find(item => item.id === params.get("id"));
          handleView(targetReservation);
          window.history.replaceState({}, '', location.pathname);
        }
      }
    }
  }, [
    handleEdit,
    handleView,
    limit,
    currentPage,
    filter.status,
    filter.location,
    filter.date_from,
    filter.date_to,
    search,
    location,
  ]);

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

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await api.get("/reservations/owner", {
          params: {
            ownerId: localStorage.getItem("id"),
            status: filter.status,
            location: filter.location,
            search: search,
          },
        });
        setReport(response.data.data);
      } catch {
        setReport([]);
      }
    }
    fetchReport();
  }, [
    filter.status,
    filter.location,
    filter.date_from,
    filter.date_to,
    search,
  ]);

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
      {modalEdit && (
        <Modal
          setModal={setModalEdit}
          handleSubmit={
            localStorage.getItem("role") === "owner"
              ? handleSubmitEdit
              : undefined
          }
          fields={fieldsEdit}
          title={"Booking Details"}
          button_name={
            localStorage.getItem("role") === "owner" ? "Update" : "Close"
          }
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
        <div className="w-full flex flex-col md:flex-row justify-center gap-5">
          <Search setSearch={setSearch} setModal={setModalFilter} />
          <Report 
            column={[
              { label: "#", ratio: 0.05 },
              { label: "Registered Dryer", ratio: 0.15 },
              { label: "Location (Sablayan)", ratio: 0.2 },
              { label: "Status", ratio: 0.1 },
              { label: "Duration", ratio: 0.1 },
              { label: "Crop Type", ratio: 0.1 },
              { label: "Quantity", ratio: 0.1 },
              { label: "Farmer", ratio: 0.2 },
            ]} 
            data={report} 
            report_title="LIST OF RESERVATION"
          />
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
                  <div className="text-center font-bold py-5">
                    No transactions to display at the moment.
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

export default BookingRequests;
