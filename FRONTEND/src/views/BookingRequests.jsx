import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import Button from "../component/Button";

function BookingRequests() {
  const ownerId = localStorage.getItem("owner_id");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalView, setModalView] = useState(false);
  const [filter, setFilter] = useState({ status: "all", location: "all" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

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
    const updated = Object.fromEntries(formData.entries());

    try {
      setLoading(true);
      await axios.put(
        `${import.meta.env.VITE_API}/reservations/${selectedBooking.id}`,
        { status: updated.status }
      );
      alert("Status updated successfully!");
      setModalView(false);
      fetchData(); // refresh
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  function handleView(booking) {
    setSelectedBooking(booking);
    setModalView(true);
  }

  const Endpoint = `${import.meta.env.VITE_API}/reservations`;

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await axios.get(Endpoint, {
        params: { offset: (currentPage - 1) * limit, limit },
      });

      if (!Array.isArray(res.data)) throw new Error("Invalid data from API");

      setData(
        res.data.map((r) => ({
          id: r.id,
          farmer_name: r.farmer_name || "N/A",
          location: r.dryer_location || "N/A",
          crop_type: r.crop_type || "N/A",
          quantity: r.quantity || "N/A",
          status: r.status || "pending",
          action: (
            <Button
              onClick={() => handleView(r)}
              className="bg-blue-400 hover:bg-blue-500 text-white"
            >
              View
            </Button>
          ),
        }))
      );
    } catch (error) {
      console.error(error);
      setIsError(true);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ownerId) fetchData();
  }, [ownerId, currentPage, limit]);

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

  if (isError) {
    return (
      <div className="absolute top-0 left-0 w-full h-[calc(100dvh-56px)] text-5xl flex justify-center items-center font-bold py-5">
        Error while fetching the data
      </div>
    );
  }

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
      {modalView && selectedBooking && (
        <Modal
          setModal={setModalView}
          handleSubmit={handleSubmitView}
          datas={[
            {
              crop_type: selectedBooking.crop_type,
              quantity: selectedBooking.quantity,
              payment: selectedBooking.payment,
              status: (
                <select
                  className="w-full outline-0"
                  name="status"
                  defaultValue={selectedBooking.status}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </select>
              ),
            },
          ]}
          title={`Booking by ${selectedBooking.farmer_name}`}
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
                    Under Maintenance
                    {/* No Booking Requests Found. */}
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
