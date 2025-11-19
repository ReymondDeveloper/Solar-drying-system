import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Button from "../component/Button";
import Loading from "../component/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/api";

function Accounts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const [filter, setFilter] = useState({ role: "all" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const tableHeadings = [
    "First Name",
    "Middle Name",
    "Last Name",
    "Address",
    "Email",
    "Role",
  ];

  const tableDataCell = [
    "first_name",
    "middle_name",
    "last_name",
    "address",
    "email",
    "role",
  ];

  const fieldsFilter = [
    {
      label: "Role",
      type: "select",
      name: "role",
      options: [
        { value: "all", phrase: "all" },
        { value: "admin", phrase: "admin" },
        { value: "owner", phrase: "owner" },
        { value: "farmer", phrase: "farmer" },
      ],
      defaultValue: filter.role,
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

  const fieldsAdd = [
    {
      label: "First Name",
      type: "text",
      name: "first_name",
      required: true,
      colspan: 1,
    },
    {
      label: "Middle Name",
      type: "text",
      name: "middle_name",
      required: false,
      colspan: 1,
    },
    {
      label: "Last Name",
      type: "text",
      name: "last_name",
      required: true,
      colspan: 1,
    },
    {
      label: "Email address",
      type: "email",
      name: "email",
      required: true,
      colspan: 1,
    },
    {
      label: "Address",
      type: "text",
      name: "address",
      required: true,
      colspan: 2,
    },
    {
      label: "Role",
      type: "select",
      name: "role",
      options: [{ value: "owner" }, { value: "farmer" }, { value: "admin" }],
      colspan: 2,
    },
    {
      label: "Password",
      type: "password",
      name: "password",
      minLength: 8,
      maxLength: 16,
      required: true,
      colspan: 2,
    },
  ];

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const {
      first_name,
      middle_name,
      last_name,
      address,
      email,
      role,
      password,
    } = Object.fromEntries(formData.entries());
    try {
      const res = await api.post(`${import.meta.env.VITE_API}/users/register`, {
        first_name,
        middle_name,
        last_name,
        address,
        email,
        password,
        role,
      });
      toast.success(res.data.message);

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: localStorage.getItem("id"),
        context:
          `You've successfully created an account for ${res.data.email} at ` +
          new Date().toLocaleString(),
      });

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: res.data.id,
        context:
          `Administrator successfully created your account at ` +
          new Date().toLocaleString(),
      });

      setTimeout(() => {
        setModalAdd(false);
        fetchData();
      }, 2000);
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("accounts_data");
    const data = JSON.parse(local);
    setData(
      Array.isArray(data)
        ? data?.map((res) => ({
            id: res.id,
            first_name: res.first_name,
            middle_name: res.middle_name,
            last_name: res.last_name,
            address: res.address,
            email: res.email,
            role: res.role,
          }))
        : []
    );

    if (!Array.isArray(data)) setIsLoading(true);

    try {
      const result = await api.get("/users", {
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
          result.data.data?.map((res) => ({
            id: res.id,
            first_name: res.first_name,
            middle_name: res.middle_name,
            last_name: res.last_name,
            address: res.address,
            email: res.email,
            role: res.role,
          }))
        );
        localStorage.setItem("accounts_data", JSON.stringify(result.data.data));
      }
    } catch (error) {
      console.error(error);
      setIsError(true);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit, currentPage]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const FilteredData = data.filter((info) => {
    const filterByRole =
      filter.role && filter.role !== "all"
        ? info.role.toLowerCase() === filter.role.toLowerCase()
        : true;

    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "status" && key !== "location" && key !== "action")
          .some(([, value]) =>
            String(value).toLowerCase().includes(search.toLowerCase())
          )
      : true;

    return filterByRole && filterBySearch;
  });

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
      <ToastContainer position="top-center" autoClose={3000} />
      {modalFilter && (
        <Modal
          setModal={setModalFilter}
          handleSubmit={handleSubmitFilter}
          fields={fieldsFilter}
          title={"Filters"}
          button_name={"Apply Role"}
        />
      )}
      {modalAdd && (
        <Modal
          setModal={setModalAdd}
          handleSubmit={handleSubmitAdd}
          fields={fieldsAdd}
          title={"Create Account"}
          button_name={"Register"}
        />
      )}
      <div
        className={`w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5 ${
          modalFilter || modalAdd ? "overflow-hidden" : "overflow-auto"
        }`}
      >
        <Search setSearch={setSearch} setModal={setModalFilter} />
        <div className="w-full text-right mt-5">
          <Button
            onClick={() => setModalAdd(true)}
            className={"bg-green-600 hover:bg-green-700 text-white"}
          >
            Create Account
          </Button>
        </div>
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
                      No Accounts Found.
                    </div>

                    <div className="lg:hidden rounded-md flex flex-col">
                      <div className="bg-[rgb(138,183,45)] p-2 flex justify-end rounded-t-md">
                        <div className="w-6 h-6 flex justify-center items-center text-[rgb(138,183,45)] font-bold rounded-full bg-white">
                          0
                        </div>
                      </div>
                      <div className="p-3 bg-[rgba(255,255,255,0.9)] backdrop-filter-[6px] border border-[rgb(138,183,45)] rounded-b-md text-center font-bold">
                        No Accounts Found.
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

export default Accounts;
