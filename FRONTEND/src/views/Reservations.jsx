import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";

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

function Reservations() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const tableHeadings = [
    "Account Name",
    "Boooked Dryer",
    "Date",
    "Status",
    "Action",
  ];

  const tableDataCell = [
    "account_name",
    "dryer_name",
    "date",
    "status",
    "action",
  ];

  const filters = [
    {
      label: "Status",
      id: "status",
      option: [
        { value: "all", phrase: "All" },
        { value: "approved", phrase: "Approved" },
        { value: "denied", phrase: "Denied" },
      ],
    },
  ];

  function FakeFallbackData() {
    return Array.from({ length: 6 }, (_, i) => ({
      account_name: i % 2 === 0 ? "A" : "1",
      dryer_name: i % 2 === 0 ? "B" : "2",
      date: i % 2 === 0 ? "C" : "3",
      status: i % 2 === 0 ? "D" : "4",
      action: <Button onClick={() => alert(i + 1)}>Print</Button>,
    }));
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
            ? Results.map((data) => {
                return {
                  account_name: data.account_name,
                  dryer_name: data.dryer_name,
                  date: data.date,
                  status: data.status,
                  action: <Button onClick={() => alert(data.id)}>Print</Button>,
                };
              })
            : []
        );
        throw new Error("Simulated error for testing purposes.");
      } catch (error) {
        console.log(error);
        // setIsError(true);
        setData(FakeFallbackData());
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [limit, currentPage]);

  const FilteredData = data.filter((info) => {
    const filterByStatus =
      status && status !== "all"
        ? info.status.toLowerCase().includes(status.toLowerCase())
        : true;

    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "action" && key !== "status")
          .some(([_, value]) =>
            String(value).toLowerCase().includes(search.toLowerCase())
          )
      : true;
    return filterByStatus && filterBySearch;
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
      {modal && (
        <Modal setModal={setModal} setStatus={setStatus} filters={filters} />
      )}
      <div className="w-full h-[calc(100%-56px)] bg-[rgba(0,0,0,0.1)] backdrop-blur-[6px] rounded-lg p-5">
        <Search setSearch={setSearch} setModal={setModal} />
        <div className="w-full bg-gray-300 rounded-lg p-5 my-5">
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
                    No Reservations Found.
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

export default Reservations;
