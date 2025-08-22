import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import FilterModal from "../component/FilterModal";
import AddModal from "../component/AddModal";
import Loading from "../component/Loading";

export function Button({ children, onClick, className, type }) {
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      className={`bg-blue-400 rounded-sm font-semibold px-4 py-2 hover:bg-blue-500 text-white transform-all duration-300 ${className} `}
    >
      {children}
    </button>
  );
}

function CreateReservation() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modal, setModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const tableHeadings = [
    "Registered Dryer",
    "Location (Sablayan)",
    "Status",
    "Action",
  ];

  const tableDataCell = ["dryer_name", "location", "status", "action"];

  const filters = [
    {
      label: "Status",
      id: "filter",
      option: [
        { value: "all", phrase: "All" },
        { value: "available", phrase: "Available" },
        { value: "occupied", phrase: "Occupied" },
      ],
    },
  ];

  const adds = [
    {
      label: "Crop Type",
      type: "text",
      placeholder: "ex. Rice",
      required: true,
      name: "crop_type",
    },
    {
      label: "Quantity (Cavans)",
      type: "number",
      min: 1,
      placeholder: "ex. 50",
      required: true,
      name: "quantity",
    },
    {
      label: "Payment Type",
      type: "select",
      name: "payment",
      option: [
        { value: "gcash", phrase: "Gcash" },
      ],
    },
  ];

  function handleView(i, status) {
    alert(`id: ${i + 1}\nStatus: ${status}`);
    status === 'available' && setAddModal(true);
  }

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const Myalert = `
      Crop Type: ${data.crop_type}\n
      Quantity (Cavans): ${data.quantity}\n
      Payment Type: ${data.payment}`;
    alert(Myalert);
    setLoading(false);
    setAddModal(false);
  };

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
                    <Button onClick={() => handleView(index, data.status)}>Reserve</Button>
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
            dryer_name: i % 2 === 0 ? "A" : "1",
            location: i % 2 === 0 ? "B" : "2",
            status: i % 2 === 0 ? "available" : "occupied",
            action: 
              <Button onClick={() => handleView(i, i % 2 === 0 ? "available" : "occupied")}>Reserve</Button>,
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
      filter && filter !== "all"
        ? info.status.toLowerCase().includes(filter.toLowerCase())
        : true;

    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "status" && key !== "action")
          .some(([value]) =>
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
      {modal && (
        <FilterModal
          setModal={setModal}
          setFilter={setFilter}
          filters={filters}
        />
      )}
      {addModal && (
        <AddModal setAddModal={setAddModal} handleSubmit={handleSubmit} adds={adds} />
      )}
      <div className="w-full h-[calc(100%-56px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5">
        <Search setSearch={setSearch} setModal={setModal} />
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
                    No Available Solar Dryers Found.
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

export default CreateReservation;
