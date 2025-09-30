import { useState, useEffect } from "react";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import api from "../api/api";

function Availability() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const tableHeadings = ["Registered Dryer", "Location (Sablayan)", "Date Created" ,"Status"];
  const tableDataCell = ["dryer_name", "location", "created_at", "status"];

  const fields = [
    {
      label: "Status",
      type: "select",
      name: "status",
      options: [
        { value: "all", phrase: "All" },
        { value: "available", phrase: "Available" },
        { value: "occupied", phrase: "Occupied" },
      ],
      colspan: 2,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = Object.fromEntries(new FormData(e.target).entries());
      setFilter(data.status);
      setModal(false);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const res = await api.get(`${import.meta.env.VITE_API}/dryers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },  
        });

        const dryers = res.data.Results || res.data;

        const formatted = dryers.map((dryer) => ({
          dryer_name: dryer.dryer_name,
          location: dryer.location,
          status: dryer.status?.trim() || "available",
          created_at: dryer.created_at
            ? new Date(dryer.created_at).toLocaleString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
        }));

        setData(formatted);
      } catch (error) {
        console.error("Error fetching dryers:", error.response?.data?.message || error.message);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const FilteredData = data.filter((info) => {
    const filterByFilters =
      filter && filter !== "all"
        ? info.status.toLowerCase().includes(filter.toLowerCase())
        : true;
  
    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "status")
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
      {modal && (
        <Modal
          setModal={setModal}
          handleSubmit={handleSubmit}
          fields={fields}
          title={"Filters"}
          button_name={"Apply Status"}
        />
      )}
      <div
        className={`w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5 ${
          modal ? "overflow-hidden" : "overflow-auto"
        }`}
      >
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
                  <>
                    <div className="hidden lg:flex justify-center items-center font-bold py-5">
                      No Available Solar Dryers Found.
                    </div>
                    <div className="lg:hidden rounded-md flex flex-col">
                      <div className="bg-[rgb(138,183,45)] p-2 flex justify-end rounded-t-md">
                        <div className="w-6 h-6 flex justify-center items-center text-[rgb(138,183,45)] font-bold rounded-full bg-white">
                          0
                        </div>
                      </div>
                      <div className="p-3 bg-[rgba(255,255,255,0.9)] backdrop-filter-[6px] border border-[rgb(138,183,45)] rounded-b-md text-center font-bold">
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

export default Availability;
