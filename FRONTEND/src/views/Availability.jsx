import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import Button from "../component/Button";
import api from "../api/api";
import Report from "../component/Report"

function Availability() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState({
    status: "all",
    location: "all",
    is_operation: "all",
    date_from: null,
    date_to: null,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { addresses } = useAddresses();
  const navigate = useNavigate();
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
    "Registered Dryer",
    "Location (Sablayan)",
    "Date Created",
    "Operation Status",
    "Reservation Status",
    "Action",
  ];
  const tableDataCell = [
    "dryer_name",
    "location",
    "created_at",
    "is_operation",
    "status",
    "action",
  ];

  const fields = [
    {
      label: "Reservation Status",
      type: "select",
      name: "status",
      options: [
        { value: "all", phrase: "All" },
        { value: "available", phrase: "Available" },
        { value: "occupied", phrase: "Occupied" },
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
      label: "Operation Status",
      type: "select",
      name: "is_operation",
      options: [
        { value: "all", phrase: "All" },
        { value: "yes", phrase: "Yes" },
        { value: "no", phrase: "No" },
      ],
      defaultValue: filter.is_operation,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = Object.fromEntries(new FormData(e.target).entries());
      setFilter((prev) => ({ ...prev, ...data }));
      setModal(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("availability_data");
    const data = JSON.parse(local);
    setData(
      Array.isArray(data)
        ? data?.map((res) => ({
            dryer_name: res.dryer_name,
            location: res.location,
            status: res.available_capacity > 0 ? "available" : "occupied",
            is_operation: res.is_operation
              ? "Yes"
              : `No - ${res.operation_reason ?? "Maintenance"}`,
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            action: (
              <Button
                onClick={() => navigate("/home/create-reservation/" + res.id)}
                className="bg-blue-400 hover:bg-blue-500 text-white"
              >
                View
              </Button>
            ),
          }))
        : [],
    );

    if (!Array.isArray(data)) setIsLoading(true);

    try {
      const result = await api.get("/dryers", {
        params: {
          limit: limit,
          offset: currentPage * limit - limit,
          status: filter.status,
          location: filter.location,
          is_operation: filter.is_operation,
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
            dryer_name: res.dryer_name,
            location: res.location,
            status: res.available_capacity > 0 ? "available" : "occupied",
            is_operation: res.is_operation
              ? "Yes"
              : `No - ${res.operation_reason ?? "Maintenance"}`,
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            action: (
              <Button
                onClick={() => navigate("/home/create-reservation/" + res.id)}
                className="bg-blue-400 hover:bg-blue-500 text-white"
              >
                View
              </Button>
            ),
          })),
        );
        localStorage.setItem(
          "availability_data",
          JSON.stringify(result.data.data),
        );
      }
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    navigate,
    limit,
    currentPage,
    filter.status,
    filter.location,
    filter.is_operation,
    filter.date_from,
    filter.date_to,
    search,
  ]);

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
        const response = await api.get("/dryers", {
          params: {
            status: filter.status,
            location: filter.location,
            is_operation: filter.is_operation,
            date_from: filter.date_from,
            date_to: filter.date_to,
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
    filter.is_operation,
    filter.date_from,
    filter.date_to,
    search,
  ]);

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
        <div className="w-full flex justify-center gap-5">
          <Search setSearch={setSearch} setModal={setModal} />
          <Report 
            column={[
              { label: "#", ratio: 0.05 },
              { label: "Registered Dryer", ratio: 0.2 },
              { label: "Location (Sablayan)", ratio: 0.22 },
              { label: "Date Created", ratio: 0.15 },
              { label: "Operation Status", ratio: 0.15 },
              { label: "Reservation Status", ratio: 0.23 },
            ]} 
            data={report} 
            report_title="LIST OF DRYERS"
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
