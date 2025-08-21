import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import FilterModal from "../component/FilterModal";
import AddModal from "../component/AddModal";
import Button from "../component/Button";

function Accounts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modal, setModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const tableHeadings = [
    "First Name",
    "Middle Initial",
    "Last Name",
    "Email",
    "Role",
  ];

  const tableDataCell = [
    "first_name",
    "middle_initial",
    "last_name",
    "email",
    "role",
  ];

  function FakeFallbackData() {
    return Array.from({ length: 4 }, (_, i) => ({
      first_name: i % 2 === 0 ? "A" : "1",
      middle_initial: i % 2 === 0 ? "B" : "2",
      last_name: i % 2 === 0 ? "C" : "3",
      email: i % 2 === 0 ? "D" : "4",
      role: i % 2 === 0 ? "Owner" : "Farmer",
    }));
  }

  const filters = [
    {
      label: "Role",
      id: "filter",
      option: [
        { value: "all", phrase: "All" },
        { value: "owner", phrase: "Owner" },
        { value: "farmer", phrase: "Farmer" },
      ],
    },
  ];

  const adds = [
    {
      label: "First Name",
      type: "text",
      placeholder: "ex. First Name",
      required: true,
      name: "first_name",
    },
    {
      label: "Last Name",
      type: "text",
      placeholder: "ex. Last Name",
      required: true,
      name: "last_name",
    },
    {
      label: "Password",
      type: "password",
      min: 6,
      max: 16,
      placeholder: "Enter 8-16 characters",
      required: true,
      name: "password",
    },
    {
      label: "Role",
      type: "select",
      name: "role",
      option: [
        { value: "farmer", phrase: "Farmer" },
        { value: "owner", phrase: "Solar-Dryer Owner" },
      ],
    },
    {
      label: "Email",
      type: "email",
      placeholder: "Enter a valid email address",
      required: true,
      name: "email",
    },
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
            offset,
            limit,
          },
        });

        const { Results } = res.data;
        setData(
          Array.isArray(Results)
            ? Results.map((data) => {
                return {
                  first_name: data.first_name,
                  middle_initial: data.middle_initial,
                  last_name: data.last_name,
                  email: data.email,
                  role: data.role,
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
    const filterByFilters =
      filter && filter !== "all"
        ? info.role.toLowerCase().includes(filter.toLowerCase())
        : true;

    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "role")
          .some(([_, value]) =>
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
      {modal && (
        <FilterModal
          setModal={setModal}
          setFilter={setFilter}
          filters={filters}
        />
      )}
      {addModal && (
        <AddModal setAddModal={setAddModal} setData={setData} adds={adds} />
      )}
      <div className="w-full h-[calc(100%-56px)] bg-[rgba(0,0,0,0.1)] backdrop-blur-[6px] rounded-lg p-5">
        <Search setSearch={setSearch} setModal={setModal} />
        <div className="w-full text-right mt-5">
          <Button onClick={() => setAddModal(true)}>Add Account</Button>
        </div>
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
                    No Accounts Found.
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

export default Accounts;
