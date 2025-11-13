import { useState, useEffect, useCallback } from "react";
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
  const [filter, setFilter] = useState({ status: "all", location: "all" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const tableHeadings = [
    "Farmer Name",
    "Dryer Location",
    "Crop Type",
    "Quantity (Cavans)",
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
      colspan: 2,
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

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      setLoading(true);
      await api.put(`/reservations/${data.id}`,
        {
          status: data.status,
          notes: data.notes || null,
        }
      );

      toast.success("Booking is updated successfully!");

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: localStorage.getItem("booking_requests_farmer_id"),
        context:
          `Dryer's owner of "${localStorage
            .getItem("booking_requests_dryer_name")
            .toUpperCase()}" successfully updated your reservation status at ` +
          new Date().toLocaleString(),
        url: "/home/reservation-history",
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
        disabled: true,
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
        options: [
          { value: "pending", phrase: "Pending" },
          { value: "approved", phrase: "Approved" },
          { value: "denied", phrase: "Denied" },
          { value: "completed", phrase: "Completed" },
        ],
        colspan: 2,
        onChange: isOwner ? handleStatusChange : undefined,
      },
    ];

    if (data.status === "denied") {
      baseFields.push({
        label: "Notes",
        type: "textarea",
        name: "notes",
        defaultValue: data.crop_type_id.notes || "",
        placeholder: "Reason for denial",
        colspan: 2,
      });
    }

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
            farmer_name: res.farmer_id.first_name || "N/A",
            location: res.dryer_id.location || "N/A",
            crop_type: res.crop_type_id.crop_type_name || "N/A",
            quantity: res.crop_type_id.quantity || "N/A",
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            duration: `${res.date_from || "N/A"} - ${res.date_to || "N/A"}`,
            status: res.status || "pending",
            notes: res.crop_type_id.notes || "",
            action: (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => res.status && res.status !== "completed" && handleEdit(res)}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  Edit
                </Button>
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
            farmer_name: res.farmer_id.first_name || "N/A",
            location: res.dryer_id.location || "N/A",
            crop_type: res.crop_type_id.crop_type_name || "N/A",
            quantity: res.crop_type_id.quantity || "N/A",
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            duration: `${res.date_from || "N/A"} - ${res.date_to || "N/A"}`,
            status: res.status || "pending",
            notes: res.crop_type_id.notes || "",
            action: (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => handleEdit(res)}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  Edit
                </Button>
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
    }
  }, [handleEdit, handleView, limit, currentPage]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const FilteredData = data.filter((info) => {
    const filterByStatus =
      filter.status && filter.status !== "all"
        ? info.status.toLowerCase() === filter.status.toLowerCase()
        : true;

    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "status" && key !== "action")
          .some(([, value]) =>
            String(value).toLowerCase().includes(search.toLowerCase())
          )
      : true;

    return filterByStatus && filterBySearch;
  });

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
        <Search setSearch={setSearch} setModal={setModalFilter} />
        <div className="w-full lg:bg-gray-300 rounded-lg lg:p-5 my-5">
          <div className="overflow-auto max-h-[400px]">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <>
                <Table
                  data={FilteredData}
                  startIndex={startIndex}
                  tableHeadings={tableHeadings}
                  tableDataCell={tableDataCell}
                />
                {FilteredData?.length === 0 && (
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
