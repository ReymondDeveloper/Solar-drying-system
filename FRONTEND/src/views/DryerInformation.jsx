import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import Button from "../component/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/api";
import axios from "axios";

function DryerInformation() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const [filter, setFilter] = useState({ location: "all" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDryer, setSelectedDryer] = useState(null);
  const { addresses } = useAddresses();
  const navigate = useNavigate();
  const [isOperational, setIsOperational] = useState(true);
  const tableHeadings = [
    "Dryer Name",
    "Location (Sablayan)",
    "Capacity (Cavan)",
    "Available Capacity (Cavan)",
    "Rate",
    "Operation Status",
    "Date Created",
    "Action",
  ];

  const tableDataCell = [
    "dryer_name",
    "location",
    "maximum_capacity",
    "available_capacity",
    "rate",
    "is_operation",
    "created_at",
    "action",
  ];

  const fieldsFilter = [
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
    { label: "Dryer Name", type: "text", name: "dryer_name", required: true },
    {
      label: "Location (Sablayan)",
      type: "select",
      name: "location",
      required: true,
      options: addresses.map((a) => ({ value: a.name, phrase: a.name })),
    },
    {
      label: "Maximum Capacity (Cavan)",
      type: "number",
      name: "maximum_capacity",
      required: true,
    },
    { label: "Rate (PHP)", type: "number", name: "rate", required: true },
    { label: "Dryer Image", type: "file", name: "image_url" },
    { label: "QR Code", type: "file", name: "qr_code" },
    { label: "Business Permit", type: "file", name: "business_permit" },
  ];

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      let dryerData = Object.fromEntries(formData.entries());

      const res = await api.post("/dryers", {
        dryer_name: dryerData.dryer_name,
        location: dryerData.location,
        maximum_capacity: dryerData.maximum_capacity,
        rate: dryerData.rate,
        image_url: dryerData.img_image_url,
        created_by_id: localStorage.getItem("id"),
        qr_code: dryerData.img_qr_code,
        business_permit: dryerData.pdf_business_permit,
      });

      toast.success(res.data.message);

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: "4c3f4aae-54e9-40a3-b14f-39638c4894a5",
        context:
          `A owner successfully created a new dryer located on "${
            dryerData.location
          }" at ` + new Date().toLocaleString(),
        url: "/home/availability",
      });

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: localStorage.getItem("id"),
        context:
          `You've successfully created a new dryer located on "${
            dryerData.location
          }" at ` + new Date().toLocaleString(),
        url: "/home/dryer-information",
      });

      fetchData();
      setModalAdd(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create dryer");
    } finally {
      setLoading(false);
    }
  };

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
      const res = await api.put(`/dryers/${selectedDryer.id}`, {
        dryer_name: updatedData.dryer_name,
        location: updatedData.location,
        maximum_capacity: updatedData.maximum_capacity,
        rate: updatedData.rate,
        image_url: updatedData.img_image_url,
        qr_code: updatedData.img_qr_code,
        is_operation: updatedData.is_operation === "true",
        operation_reason:
          updatedData.is_operation === "false"
            ? updatedData.operation_reason
            : null,
        business_permit: updatedData.pdf_business_permit,
      });

      toast.success(res.data.message);

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: "4c3f4aae-54e9-40a3-b14f-39638c4894a5",
        context:
          `A owner successfully updated dryer details of a dryer located on "${
            updatedData.location
          }" at ` + new Date().toLocaleString(),
        url: "/home/availability",
      });

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: localStorage.getItem("id"),
        context:
          `You've successfully update dryer details of a dryer located on "${
            updatedData.location
          }" at ` + new Date().toLocaleString(),
        url: "/home/dryer-information",
      });

      fetchData();
      setModalEdit(false);
      setSelectedDryer(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update dryer");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("dryer_information_data");
    const data = JSON.parse(local);
    setData(
      Array.isArray(data)
        ? data?.map((res) => ({
            ...res,
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            isverified: res.isverified ? "Verified" : "Not Verified",
            is_operation: res.is_operation ? "Operational" : "Not Operational",
            action: (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => (
                    handleEdit(res),
                    setIsOperational(res.is_operation)
                  )}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => navigate("/home/create-reservation/" + res.id)}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  View
                </Button>
              </div>
            ),
          }))
        : [],
    );

    if (!Array.isArray(data)) setIsLoading(true);

    try {
      const result = await api.get("/dryers/owned", {
        params: {
          id: localStorage.getItem("id"),
          limit: limit,
          offset: currentPage * limit - limit,
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
            ...res,
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            is_operation: res.is_operation ? "Operational" : "Not Operational",
            action: (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => handleEdit(res)}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => navigate("/home/create-reservation/" + res.id)}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  View
                </Button>
              </div>
            ),
          })),
        );
        localStorage.setItem(
          "dryer_information_data",
          JSON.stringify(result.data.data),
        );
      }
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, limit, currentPage, filter.location, search]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const fieldsEdit = [
    {
      label: "Dryer Name",
      type: "text",
      name: "dryer_name",
      required: true,
      defaultValue: selectedDryer?.dryer_name,
    },
    {
      label: "Location (Sablayan)",
      type: "select",
      name: "location",
      required: true,
      options: addresses.map((a) => ({ value: a.name, phrase: a.name })),
      defaultValue: selectedDryer?.location,
    },
    {
      label: "Capacity (Cavan)",
      type: "number",
      name: "maximum_capacity",
      required: true,
      defaultValue: selectedDryer?.maximum_capacity,
    },
    {
      label: "Rate (PHP)",
      type: "number",
      name: "rate",
      required: true,
      defaultValue: selectedDryer?.rate,
    },
    {
      label: "Operation Status",
      type: "select",
      name: "is_operation",
      required: true,
      defaultValue: selectedDryer?.is_operation ? "true" : "false",
      options: [
        { value: "true", phrase: "Operational" },
        { value: "false", phrase: "Not Operational" },
      ],
      onChange: (e) => setIsOperational(e.target.value === "true"),
    },
    !isOperational && {
      label: "Reason for Not Operational",
      type: "text",
      name: "operation_reason",
      required: true,
      defaultValue: selectedDryer?.operation_reason || "",
      placeholder: "Provide reason why dryer is not operational",
    },
    {
      label: "QR Code",
      type: "file",
      name: "qr_code",
      defaultValue: selectedDryer?.qr_code,
    },
    {
      label: "Dryer Image",
      type: "file",
      name: "image_url",
      defaultValue: selectedDryer?.image_url,
    },
    {
      label: "Business Permit",
      type: "file",
      name: "business_permit",
      defaultValue: selectedDryer?.business_permit,
    },
  ].filter(Boolean);

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

      <div
        className={`w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5 ${
          modalFilter ? "overflow-hidden" : "overflow-auto"
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
                  data={data}
                  startIndex={startIndex}
                  tableHeadings={tableHeadings}
                  tableDataCell={tableDataCell}
                />
                {data?.length === 0 && (
                  <>
                    <div className="hidden lg:flex justify-center items-center font-bold py-5">
                      No records to display at the moment.
                    </div>

                    <div className="lg:hidden rounded-md flex flex-col">
                      <div className="bg-[rgb(138,183,45)] p-2 flex justify-end rounded-t-md">
                        <div className="w-6 h-6 flex justify-center items-center text-[rgb(138,183,45)] font-bold rounded-full bg-white">
                          0
                        </div>
                      </div>
                      <div className="p-3 bg-[rgba(255,255,255,0.9)] backdrop-filter-[6px] border border-[rgb(138,183,45)] rounded-b-md text-center font-bold">
                        No records to display at the moment.
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
