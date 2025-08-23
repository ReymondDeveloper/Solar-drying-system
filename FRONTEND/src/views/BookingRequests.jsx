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
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalView, setModalView] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const tableHeadings = [
    "Name",
    "Location (Sablayan)",
    "Crop Type",
    "Quantity (Cavans)",
    "Status",
    "Action",
  ];

  const tableDataCell = [
    "name",
    "location",
    "crop_type",
    "quantity",
    "status",
    "action",
  ];

  const fieldsFilter = [
    {
      label: "Location (Sablayan)",
      type: "select",
      name: "location",
      option: [
        { value: "all", phrase: "All" },
        { value: "location 1", phrase: "Location 1" },
        { value: "location 2", phrase: "Location 2" },
      ],
    },
    {
      label: "Status",
      type: "select",
      name: "status",
      option: [
        { value: "all", phrase: "All" },
        { value: "pending", phrase: "Pending" },
        { value: "approved", phrase: "Approved" },
        { value: "denied", phrase: "Denied" },
        { value: "completed", phrase: "Completed" },
      ],
    },
  ];

  const handleSubmitFilter = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const Myalert = `
      Status: ${data.status}\n
      Location: ${data.location}`;
    alert(Myalert);
    setFilter(data);
    setLoading(false);
    setModalFilter(false);
  };

  const datasView = [
    {
      crop_type: "Rice",
      quantity: "50",
      payment: "gcash",
      capacity: "100",
      status: "pending",
    },
  ];

  const handleSubmitView = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const Myalert = `
      Status: ${data.status}`;
    alert(Myalert);
    setLoading(false);
    setModalView(false);
  };

  function handleView(i) {
    alert(`id: ${i + 1}`);
    setModalView(true);
  }

  const Endpoint = "";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      const offset = (currentPage - 1) * limit;
      try {
        const res = await axios.get(Endpoint, {
          params: {
            offset,
            limit,
          },
        });

        const { Results } = res.data;
        setData(
          Array.isArray(Results)
            ? Results.map((data, index) => {
                return {
                  dryer_name: data.dryer_name,
                  location: data.location,
                  status: data.status,
                  action: (
                    <Button
                      onClick={() => handleView(i)}
                      className={"bg-blue-400 hover:bg-blue-500 text-white"}
                    >
                      View
                    </Button>
                  ),
                };
              })
            : []
        );
        throw new Error("Simulated error for testing purposes.");
      } catch (error) {
        console.log(error);
        // setIsError(true);
        function FakeFallbackData() {
          return Array.from({ length: 6 }, (_, i) => ({
            name: `Name ${i + 1}`,
            location: i % 2 === 0 ? "Location 1" : "Location 2",
            crop_type: i % 2 === 0 ? "Rice" : "Corn",
            quantity: (i + 1) * 10,
            status: i % 2 === 0 ? "pending" : "approved",
            action: (
              <Button
                onClick={() => handleView(i)}
                className={"bg-blue-400 hover:bg-blue-500 text-white"}
              >
                View
              </Button>
            ),
          }));
        }
        setData(FakeFallbackData());
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [limit, currentPage]);

  const FilteredData = data.filter((info) => {
    const filterByFilters =
      (!filter.location ||
        filter.location === "all" ||
        info.location
          .toLowerCase()
          .includes(String(filter.location).toLowerCase())) &&
      (!filter.status ||
        filter.status === "all" ||
        info.status
          .toLowerCase()
          .includes(String(filter.status).toLowerCase()));

    const filterBySearch = search
      ? Object.entries(info)
          .filter(
            ([key]) =>
              key !== "status" && key !== "action" && key !== "location"
          )
          .some(([, value]) =>
            String(value).toLowerCase().includes(search.toLowerCase())
          )
      : true;
    return filterByFilters && filterBySearch;
  });

  const totalPages = Math.max(1, Math.ceil(FilteredData.length / limit));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * limit;

  if (isError)
    return (
      <div className="absolute top-0 left-0 w-full h-[calc(100dvh-56px)] text-5xl flex justify-center items-center font-bold py-5">
        Error while fetching the data
      </div>
    );
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
          title={"Booking Details"}
          button_name={"Apply Changes"}
        />
      )}
      <div className="w-full h-[calc(100%-56px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5">
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
                  <>
                    <div className="hidden lg:flex justify-center items-center font-bold py-5">
                      No Available Solar Dryers Found.
                    </div>

                    <div className="rounded-md flex flex-col">
                      <div className="bg-[rgb(138,183,45)] p-2 flex justify-end rounded-t-md">
                        <div className="w-6 h-6 flex justify-center items-center text-[rgb(138,183,45)] font-bold rounded-full bg-white">
                          0
                        </div>
                      </div>
                      <div className="lg:hidden p-3 bg-[rgba(255,255,255,0.9)] backdrop-filter-[6px] border border-[rgb(138,183,45)] rounded-b-md text-center font-bold">
                        No Available Solar Dryers Found.
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

export default BookingRequests;
