import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Button from "../component/Button";
import Loading from "../component/Loading";

function Reservations() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");  
  const ownerId = localStorage.getItem("id");
  const tableHeadings =
    role === "admin"
     ? ["Owner", "Email", "Dryers", "Location", "Date Created"]
      : ["Booked Dryer", "Location", "Date", "Status", "Action"];  
      const tableDataCell =
      role === "admin"
      ? ["owner_name", "owner_email", "dryer_name", "location", "created_at"]
      : ["dryer_name", "location", "date", "status", "action"];
  
    const fields = [
      {
        label: "Status",
        type: "select",
        name: "status",
        options: [
          { value: "all" },
          { value: "pending" },
          { value: "approved" },
          { value: "denied" },
        ],
      },
    ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    setFilter(formData.status);
    setModal(false);
  };

  const Endpoint = `${import.meta.env.VITE_API}/reservations`;

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      let res;
  
      if (role === "admin") {
        res = await axios.get(`${import.meta.env.VITE_API}/reservations/owners`, {
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
  
      } else {
        res = await axios.get(
          `${import.meta.env.VITE_API}/reservations/owner/${ownerId}`,
          {
            params: { offset: (currentPage - 1) * limit, limit },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
  
        const results = res.data;
        const formattedData = results.map((reservation) => ({
          dryer_name: reservation.dryer_name,
          location: reservation.location || "N/A",
          date: reservation.created_at
            ? new Date(reservation.created_at).toLocaleString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "",
          status: reservation.status,
          action: (
            <Button
              onClick={() => alert(`Reservation ID: ${reservation.id}`)}
              className="bg-blue-400 hover:bg-blue-500 text-white"
            >
              Print
            </Button>
          ),
        }));
  
        setData(formattedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [currentPage, limit]);

  const FilteredData = data.filter((info) => {
    const filterByStatus =
      filter !== "all"
        ? info.status.toLowerCase() === filter.toLowerCase()
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
      {modal && role !== "admin" && (  
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
