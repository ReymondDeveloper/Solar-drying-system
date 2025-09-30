import { useState, useEffect, useCallback } from "react";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import api from "../api/api";

function Reservations() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const tableHeadings = ["Owner", "Email", "Dryers", "Location", "Date Created"];  
  const tableDataCell = ["owner_name", "owner_email", "dryer_name", "location", "created_at"];
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
      options: [{ value: 'all', phrase: 'All' }, ...addresses.map((a) => ({ value: a.name, phrase: a.name }))],
      colspan: 2,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = Object.fromEntries(new FormData(e.target).entries());
      setFilter(data.location);
      setModal(false);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`${import.meta.env.VITE_API}/reservations/owners`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      const results = res.data;
      const formattedData = results.flatMap((owner) =>
        owner.dryers.map((dryer) => ({
          owner_name: owner.name,
          owner_email: owner.email,
          dryer_name: dryer.name,
          location: dryer.location,
          created_at: dryer.created_at
            ? new Date(dryer.created_at).toLocaleString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
        }))
      );
  
      setData(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const FilteredData = data.filter((info) => {
    const filterByStatus =
      filter !== "all"
        ? info.location.toLowerCase() === filter.toLowerCase()
        : true;
    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "location")
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
      {modal && (  
        <Modal
          setModal={setModal}
          handleSubmit={handleSubmit}
          fields={fields}
          title="Filters"
          button_name="Apply Status"
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
                {FilteredData.length === 0 && (
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
