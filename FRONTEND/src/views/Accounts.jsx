import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Button from "../component/Button";
import Loading from "../component/Loading";
import { toast } from "react-toastify";

function Accounts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const [search, setSearch] = useState("");
  const storedUser = localStorage.getItem("currentUser");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
  const tableHeadings = ["First Name", "Middle Initial", "Last Name", "Email", "Role"];
  const tableDataCell = ["first_name", "middle_name", "last_name", "email", "role"];

  const fieldsAdd = [
    { label: "First Name", type: "text", placeholder: "ex. First Name", required: true, name: "first_name" },
    { label: "Middle Name", type: "text", placeholder: "ex. Middle Name", name: "middle_name" },
    { label: "Last Name", type: "text", placeholder: "ex. Last Name", required: true, name: "last_name" },
    { label: "Role", type: "select", name: "role", option: [
        { value: "farmer", phrase: "Farmer" },
        { value: "owner", phrase: "Owner" },
      ] },
    { label: "Email", type: "email", placeholder: "Enter a valid email address", required: true, name: "email" },
    { label: "Password", type: "password", placeholder: "Enter password", required: true, minLength: 8, maxLength: 16, name: "password" },
  ];

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/api/users");
        const mappedData = res.data.map(user => {
          let role = "N/A";
          if (user.is_admin) role = "Admin";
          else if (user.is_owner) role = "Owner";
          else if (user.is_farmer) role = "Farmer";
    
          return {
            ...user,
            role
          };
        });
        setData(mappedData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    try {
      const res = await axios.post("http://localhost:3000/api/users/register", {
        first_name: formValues.first_name,
        middle_name: formValues.middle_name || "",
        last_name: formValues.last_name,
        email: formValues.email,
        password: formValues.password,
        is_admin: false,
        is_farmer: formValues.role === "farmer",
        is_owner: formValues.role === "owner",
      });

      const newUser = {
        ...res.data.userSafe,
        role: res.data.userSafe.is_admin
          ? "Admin"
          : res.data.userSafe.is_owner
          ? "Owner"
          : res.data.userSafe.is_farmer
          ? "Farmer"
          : "N/A"
      };
      setData((prev) => [...prev, newUser]);
      toast.success(res.data.message || "Account created successfully!");
      setModalAdd(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(user =>
    search ? Object.values(user).some(value => String(value).toLowerCase().includes(search.toLowerCase())) : true
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * limit;

  const displayedData = filteredData.slice(startIndex, startIndex + limit);

  return (
    <>
      {loading && <Loading />}

      {modalAdd && currentUser && currentUser.role === "admin" && (
        <Modal
          setModal={setModalAdd}
          handleSubmit={handleSubmitAdd}
          fields={fieldsAdd}
          title={"Create Account"}
          button_name={"Register"}
        />
      )}


      <Search setSearch={setSearch} />

      {currentUser && currentUser.role === "admin" && (
        <div className="w-full text-right mt-5">
          <Button
            onClick={() => setModalAdd(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Create Account
          </Button>
        </div>
      )}


      <div className="w-full lg:bg-gray-300 rounded-lg lg:p-5 my-5">
        <div className="overflow-auto max-h-[400px]">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <Table
                data={displayedData}
                startIndex={startIndex}
                tableHeadings={tableHeadings}
                tableDataCell={tableDataCell}
              />
              {displayedData.length === 0 && (
                <div className="text-center font-bold py-5">No Accounts Found.</div>
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
    </>
  );
}

export default Accounts;
