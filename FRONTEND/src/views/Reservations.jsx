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
  let Params;
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState("all");
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

  const Endpoint = "";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      const offset = (currentPage - 1) * limit;
      try {
        const res = await axios.get(Endpoint, {
          params: {
            ...Params,
            offset,
            limit,
          },
        });

        const { Reservations } = res.data;
        setData(
          Array.isArray(Reservations)
            ? Reservations.map((data) => {
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
        throw new Error("Simulated error for testing purposes");
      } catch (error) {
        // console.log(error);
        // setIsError(true);

        setData([
          {
            account_name: "A",
            dryer_name: "B",
            date: "C",
            status: "D",
            action: <Button onClick={() => alert(1)}>Print</Button>,
          },
          {
            account_name: "1",
            dryer_name: "2",
            date: "3",
            status: "4",
            action: <Button onClick={() => alert(2)}>Print</Button>,
          },
          {
            account_name: "A",
            dryer_name: "B",
            date: "C",
            status: "D",
            action: <Button onClick={() => alert(3)}>Print</Button>,
          },
          {
            account_name: "1",
            dryer_name: "2",
            date: "3",
            status: "4",
            action: <Button onClick={() => alert(4)}>Print</Button>,
          },
          {
            account_name: "A",
            dryer_name: "B",
            date: "C",
            status: "D",
            action: <Button onClick={() => alert(5)}>Print</Button>,
          },
          {
            account_name: "1",
            dryer_name: "2",
            date: "3",
            status: "4",
            action: <Button onClick={() => alert(6)}>Print</Button>,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [Params, limit, currentPage]);

  const totalPages = Math.max(1, Math.ceil(data.length / limit));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * limit;

  if (isError) return <p>Error while fetching the data</p>;

  return (
    <>
      {modal && (
        <Modal setModal={setModal} status={status} setStatus={setStatus} />
      )}
      <div className="w-full h-[calc(100%-56px)] bg-[rgba(0,0,0,0.1)] backdrop-blur-[6px] rounded-lg p-5">
        <Search setModal={setModal} />
        <div className="w-full bg-gray-300 rounded-lg p-5 my-5">
          <div className="overflow-auto max-h-[400px]">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <>
                <Table
                  data={data.slice(startIndex, startIndex + limit)}
                  startIndex={startIndex}
                  tableHeadings={tableHeadings}
                  tableDataCell={tableDataCell}
                />
                {data?.length === 0 ? (
                  <div className="flex justify-center items-center">
                    No Reservations Found
                  </div>
                ) : (
                  ""
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
