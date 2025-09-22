import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search"; 
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import Button from "../component/Button";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

function DryerInformation() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalView, setModalView] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDryer, setSelectedDryer] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); 
  const base = import.meta.env.VITE_API;

  const api = axios.create({
    baseURL: base,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const tableHeadings = [
    "Dryer Name",
    "Location (Sablayan)",
    "Capacity (Cavans)",
    "Available Capacity (Cavans)",
    "Rate",
    "Action",
  ];

  const tableDataCell = [
    "dryer_name",
    "location",
    "capacity",
    "available_capacity",
    "rate",
    "action",
  ];

  const locationOptions = [
    { value: "location 1", phrase: "Location 1" },
    { value: "location 2", phrase: "Location 2" },
    { value: "location 3", phrase: "Location 3" },
    { value: "location 4", phrase: "Location 4" },
    { value: "location 5", phrase: "Location 5" },
  ];

  const fieldsAdd = [
    { label: "Dryer Name", type: "text", name: "dryer_name", required: true },
    {
      label: "Location (Sablayan)",
      type: "select",
      name: "location",
      required: true,
      options: locationOptions,
    },
    { label: "Capacity (Cavans)", type: "number", name: "capacity", required: true },
    { label: "Rate (PHP)", type: "number", name: "rate", required: true },
    { label: "Dryer Image", type: "file", name: "image_url" }, 
  ];

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const createdById = localStorage.getItem("id");
      const formData = new FormData(e.target);
      let dryerData = Object.fromEntries(formData.entries());
  
      const file = formData.get("image_url");
      if (file && file.size > 0) {
        const uploadForm = new FormData();
        uploadForm.append("file", file);
  
        const uploadRes = await api.post("/upload", uploadForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        dryerData.image_url = uploadRes.data.url;  
      }
  
      const res = await api.post("/dryers", {
        ...dryerData,
        created_by_id: createdById,
      });
  
      toast.success(res.data.message);
      fetchData();
      setModalAdd(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create dryer");
    } finally {
      setLoading(false);
    }
  };

  function handleView(dryer) {
    setSelectedDryer(dryer);
    setModalView(true);
  }

  function handleEdit(dryer) {
    setSelectedDryer(dryer);
    setModalEdit(true);
  }
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData(e.target);
    let updatedData = Object.fromEntries(formData.entries());
  
    try {
      const imageFile = formData.get("image_url");
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
  
        const uploadRes = await api.post("/upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        updatedData.image_url = uploadRes.data.url;  
      } else {
        updatedData.image_url = selectedDryer.image_url;  
      }
  
      const res = await api.put(`/dryers/${selectedDryer.id}`, updatedData);
  
      toast.success(res.data.message);
      fetchData();
      setModalEdit(false);
      setSelectedDryer(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update dryer");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    const offset = (currentPage - 1) * limit;

    try {
      const res = await api.get("/dryers", {
        params: { offset, limit },
      });

      const dryers = res.data.Results || res.data;

      const formatted = dryers.map((dryer) => ({
        ...dryer,
        available_capacity: dryer.available_capacity ?? dryer.capacity,
        action: (
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => handleEdit(dryer)}
              className="bg-blue-400 hover:bg-blue-500 text-white"
            >
              Edit
            </Button>
            <Button
              onClick={() => handleView(dryer)}
              className="bg-blue-400 hover:bg-blue-500 text-white"
            >
              View
            </Button>
          </div>
        ),
      }));

      setData(formatted);
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit, currentPage, base]); 

  const fieldsEdit = [
    { 
      label: "Dryer Name", 
      type: "text", 
      name: "dryer_name", 
      required: true, 
      defaultValue: selectedDryer?.dryer_name 
    },
    { 
      label: "Location (Sablayan)", 
      type: "select", 
      name: "location", 
      required: true, 
      options: locationOptions, 
      defaultValue: selectedDryer?.location 
    },
    { 
      label: "Capacity (Cavans)", 
      type: "number", 
      name: "capacity", 
      required: true, 
      defaultValue: selectedDryer?.capacity 
    },
    { 
      label: "Rate (PHP)", 
      type: "number", 
      name: "rate", 
      required: true, 
      defaultValue: selectedDryer?.rate 
    },
    { 
      label: "Dryer Image", 
      type: "file", 
      name: "image_url" 
    },
  ];

  const datasView = selectedDryer
  ? [
      { label: "Dryer Name", value: selectedDryer.dryer_name },
      { label: "Location", value: selectedDryer.location },
      { label: "Capacity", value: selectedDryer.capacity },
      { label: "Available Capacity", value: selectedDryer.available_capacity },
      { label: "Rate (PHP)", value: selectedDryer.rate },
      { label: "Image", image_url: selectedDryer.image_url }, 
    ]
  : [];

  
  const FilteredData = data.filter((info) => {
    const filterByFilters =
      !filter.location ||
      filter.location === "all" ||
      info.location
        .toLowerCase()
        .includes(String(filter.location).toLowerCase());

    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "action" && key !== "location")
          .some(([, value]) =>
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
      {loading && <Loading />}
      <ToastContainer position="top-center" autoClose={3000} />
      {modalFilter && (
        <Modal
          setModal={setModalFilter}
          handleSubmit={handleSubmitFilter}
          fields={fieldsFilter}
          title={"Filters"}
          button_name={"Apply Status"}
        />
      )}
      {modalAdd && (
        <Modal
          setModal={setModalAdd}
          handleSubmit={handleSubmitAdd}
          fields={fieldsAdd}
          title={"Dryer Creation"}
          button_name={"Create"}
        />
      )}
      {modalEdit && (
        <Modal
          setModal={setModalEdit}
          handleSubmit={handleSubmitEdit}
          fields={fieldsEdit}
          title={"Dryer Information"}
          button_name={"Update"}
        />
      )}
      {modalView && (
        <Modal
          setModal={setModalView}
          datas={datasView}
          title={"Dryer Details"}
          button_name={"Done"}
        />
      )}
      <div
        className={`w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5 ${
          modalFilter || modalView ? "overflow-hidden" : "overflow-auto"
        }`}
      >
        <Search setSearch={setSearch} setModal={setModalFilter} />
        <div className="w-full text-right mt-5">
          <Button
            onClick={() => setModalAdd(true)}
            className={"bg-green-600 hover:bg-green-700 text-white"}
          >
            Create Dryer
          </Button>
        </div>
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

export default DryerInformation;
