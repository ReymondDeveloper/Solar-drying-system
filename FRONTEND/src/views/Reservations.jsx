import { useState, useEffect, useCallback } from "react";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import api from "../api/api";
import Button from "../component/Button";
import Report from "../component/Report"

function Reservations() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState({ status: "all", location: "all" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalView, setModalView] = useState(false);
  const [datasView, setDatasView] = useState([]);
  const [report, setReport] = useState([]);
  
  const tableHeadings = [
    "Registered Dryer",
    "Location (Sablayan)",
    "Date Created",
    "Status",
    "Duration",
    "Action",
  ];

  const tableDataCell = [
    "dryer_name",
    "location",
    "created_at",
    "status",
    "duration",
    "action",
  ];
  const { addresses } = useAddresses();

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

  const fields = [
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

  const handleView = useCallback((data) => {
    setDatasView(() => data);
    setModalView(true);
  }, []);

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("reservation_data");
    const data = JSON.parse(local);
    setData(
      Array.isArray(data)
        ? data?.map((res) => ({
            dryer_name: res.dryer_id.dryer_name,
            location: res.dryer_id.location,
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            status: res.status || "pending",
            duration: `${res.date_from || "N/A"} - ${res.date_to || "N/A"}`,
            action: (
              <Button
                onClick={() => handleView(res)}
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
      const result = await api.get("/reservations", {
        params: {
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
            dryer_name: res.dryer_id.dryer_name,
            location: res.dryer_id.location,
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            status: res.status || "pending",
            duration: `${res.date_from || "N/A"} - ${res.date_to || "N/A"}`,
            action: (
              <Button
                onClick={() => handleView(res)}
                className="bg-blue-400 hover:bg-blue-500 text-white"
              >
                View
              </Button>
            ),
          })),
        );
        localStorage.setItem(
          "reservation_data",
          JSON.stringify(result.data.data),
        );
      }
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [handleView, limit, currentPage, filter.status, filter.location, search]);

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
        const response = await api.get("/reservations", {
          params: {
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
  }, [filter.status, filter.location, search]);

  return (
    <>
      {loading && <Loading />}
      {modal && (
        <Modal
          setModal={setModal}
          handleSubmit={handleSubmit}
          fields={fields}
          title="Filters"
          button_name="Apply Status"
        />
      )}
      {modalView && (
        <Modal
          setModal={setModalView}
          datas={datasView}
          title="Reservation Details"
          button_name="Done"
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
              { label: "Status", ratio: 0.15 },
              { label: "Duration", ratio: 0.23 },
            ]}
            data={report} 
            report_title="LIST OF RESERVATIONS"
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
                {data.length === 0 && (
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
