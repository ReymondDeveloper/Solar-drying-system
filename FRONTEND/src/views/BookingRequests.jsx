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

function BookingRequests() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalView, setModalView] = useState(false);
  const [filter, setFilter] = useState({ status: "all", location: "all" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const tableHeadings = [
    "Farmer Name",
    "Dryer Location",
    "Crop Type",
    "Quantity (Cavans)",
    "Status",
    "Action",
  ];

  const tableDataCell = [
    "farmer_name",
    "location",
    "crop_type",
    "quantity",
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
      ],
    },
  ];

  const handleSubmitFilter = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    setFilter((prev) => ({ ...prev, ...data }));
    setLoading(false);
    setModalFilter(false);
  };

  const handleSubmitView = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      setLoading(true);
      await api.put(
        `${import.meta.env.VITE_API}/reservations/${data.id}`,
        { status: data.status }
      );
      toast.success("Booking is updated successfully!");
      setModalView(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const [fieldsView, setFieldsView] = useState([]);

  const handleView = useCallback((data) => {
    setFieldsView([
      {
        label: "ID",
        type: "hidden",
        name: "id",
        defaultValue: data.id,   
      },
      {
        label: "Crop Type",
        type: "text",
        name: "crop_type",
        defaultValue: data.crop_type,
        disabled: true,
        colspan: 2,
      },
      {
        label: "Quantity",
        type: "number",
        name: "quantity",
        defaultValue: data.quantity,
        disabled: true,
        colspan: 2,
      },
      {
        label: "Payment",
        type: "text",
        name: "payment",
        defaultValue: data.payment,
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
        ],
        colspan: 2,
      },
    ]);
    setModalView(true);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`${import.meta.env.VITE_API}/reservations`, {
        params: { offset: (currentPage - 1) * limit, limit },
      });
      console.log("Fetched reservations:", res.data);

      if (!Array.isArray(res.data)) throw new Error("Invalid data from API");

      setData(
        res.data.map((res) => ({
          id: res.id,
          farmer_name: res.farmer_name || "N/A",
          location: res.dryer_location || "N/A",
          crop_type: res.crop_type || "N/A",
          quantity: res.quantity || "N/A",
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
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, handleView]);

  useEffect(() => {
    fetchData();
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
          fields={fieldsView}
          title={"Booking Details"}
          button_name={"Update"}
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
