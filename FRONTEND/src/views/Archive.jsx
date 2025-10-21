import { useState, useEffect, useCallback } from "react";
import Pagination from "../utils/Pagination";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Search from "../component/Search";   
import api from "../api/api";

function Archive() {
  const [archiveData, setArchiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");  

  const fetchArchiveData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.get("/reservations/archive", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setArchiveData(result.data);
    } catch (error) {
      console.error("Error fetching archived reservations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchiveData();
  }, [fetchArchiveData]);

  const totalPages = Math.max(1, Math.ceil(archiveData.length / limit));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * limit;

  const filteredData = archiveData.filter((item) => {
    return Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5">
      <Search setSearch={setSearch} />

      <div className="w-full lg:bg-gray-300 rounded-lg lg:p-5 my-5">
        <div className="overflow-auto max-h-[400px]">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <Table
                data={filteredData.slice(startIndex, startIndex + limit)}  
                startIndex={startIndex}
                tableHeadings={[
                  "Farmer",
                  "Booked Dryer",
                  "Location",
                  "Crop Type",
                  "Quantity",
                  "Payment",
                  "Date",
                  "Status",
                  "Action",
                ]}
                tableDataCell={[
                  "farmer_name",
                  "dryer_name",
                  "location",
                  "crop_type",
                  "quantity",
                  "payment",
                  "date",
                  "status",
                  "action",
                ]}
              />
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
  );
}

export default Archive;
