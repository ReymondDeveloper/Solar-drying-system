import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import Button from "../component/Button";
import api from "../api/api.js";

function CreateReservation() {
  const role = localStorage.getItem("role");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [filter, setFilter] = useState({ status: "all", location: "all" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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

  const tableHeadings =
    role === "farmer"
      ? [
          "Rehistradong Patuyuan",
          "Lokasyon (Sablayan)",
          "Kabuuang Kapasidad",
          "Magagamit na Kapasidad",
          "Petsa ng Pagkakagawa",
          "Katayuan",
          "Aksyon",
        ]
      : [
          "Registered Dryer",
          "Location (Sablayan)",
          "Maximum Capacity",
          "Available Capacity",
          "Date Created",
          "Status",
          "Action",
        ];

  const tableDataCell = [
    "dryer_name",
    "location",
    "maximum_capacity",
    "available_capacity",
    "created_at",
    "status",
    "action",
  ];

  const fieldsFilter = [
    {
      label: "Status",
      type: "select",
      name: "status",
      options: [
        { value: "all", phrase: "Lahat" },
        { value: "available", phrase: "Magagamit" },
        { value: "occupied", phrase: "Nakareserba" },
      ],
      defaultValue: filter.status,
      colspan: 2,
    },
    {
      label: "Location (Sablayan)",
      type: "select",
      name: "location",
      options: [
        { value: "all", phrase: "Lahat" },
        ...addresses.map((a) => ({ value: a.name, phrase: a.name })),
      ],
      defaultValue: filter.location,
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

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("create_reservation_data");
    const data = JSON.parse(local);
    setData(
      Array.isArray(data)
        ? data?.map((res) => ({
            id: res.id,
            dryer_name: res.dryer_name,
            location: res.location,
            maximum_capacity: res.maximum_capacity,
            available_capacity: res.available_capacity,
            status: res.available_capacity > 0 ? "available" : "occupied",
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
        : []
    );

    if (!Array.isArray(data)) setIsLoading(true);

    try {
      const result = await api.get("/dryers", {
        params: {
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
          result.data.data
          ?.filter((res) => res.is_operation)
          .map((res) => ({
            id: res.id,
            dryer_name: res.dryer_name,
            location: res.location,
            maximum_capacity: res.maximum_capacity,
            available_capacity: res.available_capacity,
            status: res.available_capacity > 0 ? "available" : "occupied",
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
        );
        localStorage.setItem(
          "create_reservation_data",
          JSON.stringify(result.data.data)
        );
      }
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, limit, currentPage]);

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

    const filterByLocation =
      filter.location && filter.location !== "all"
      ? info.location
        .toLowerCase()
        .includes(String(filter.location).toLowerCase())
      : true;

    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "status" && key !== "location" && key !== "action")
          .some(([, value]) =>
            String(value).toLowerCase().includes(search.toLowerCase())
          )
      : true;

    return filterByStatus && filterBySearch && filterByLocation;
  });

  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * limit;

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
      <div
        className={`w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5 ${
          modalFilter ? "overflow-hidden" : "overflow-auto"
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

export default CreateReservation;
