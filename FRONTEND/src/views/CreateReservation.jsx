import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import Button from "../component/Button";

function CreateReservation() {
  const farmerId = localStorage.getItem("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalFilter, setModalFilter] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDryerId, setSelectedDryerId] = useState(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const navigate = useNavigate();

  const tableHeadings = [
    "Registered Dryer",
    "Location (Sablayan)",
    "Status",
    "Action",
  ];

  const tableDataCell = ["dryer_name", "location", "status", "action"];

  const fieldsFilter = [
    {
      label: "Status",
      type: "select",
      name: "status",
      options: [
        { value: "all", phrase: "All" },
        { value: "available", phrase: "Available" },
        { value: "occupied", phrase: "Occupied" },
      ],
    },
  ];

  const handleSubmitFilter = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    setFilter(data.status);
    setLoading(false);
    setModalFilter(false);
  };

  const fieldsAdd = [
    {
      label: "Crop Type",
      type: "text",
      placeholder: "ex. Rice",
      required: true,
      name: "crop_type",
    },
    {
      label: "Quantity (Cavans)",
      type: "number",
      min: 1,
      placeholder: "ex. 50",
      required: true,
      name: "quantity",
    },
    {
      label: "Payment Type",
      type: "select",
      name: "payment",
      options: [{ value: "gcash" }, { value: "cash" }],
    },
  ];

  const handleSubmitAdd = async (dryerId, ownerId, formData) => {
    if (!farmerId) return alert("You must be logged in!");

    const { crop_type, quantity, payment } = formData;

    if (!crop_type || !quantity || quantity <= 0) {
      return alert("Invalid crop type or quantity.");
    }

    try {
      setLoading(true);

      const check = await axios.get(
        `${import.meta.env.VITE_API}/reservations`,
        { params: { farmer_id: farmerId, dryer_id: dryerId } }
      );

      if (check.data.exists) {
        alert("You have already reserved this dryer.");
        return;
      }

      const res = await axios.post(`${import.meta.env.VITE_API}/reservations`, {
        farmer_id: farmerId,
        dryer_id: dryerId,
        owner_id: ownerId,
        status: "pending",
        crop_type: formData.crop_type,
        quantity: formData.quantity,
        payment: formData.payment,
      });

      alert("Reservation created successfully!");
      console.log(res.data);
      setModalAdd(false);
    } catch (error) {
      console.error(
        "Reservation error:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Failed to create reservation.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFormSubmit = (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    handleSubmitAdd(selectedDryerId, selectedOwnerId, formData);
  };

  function handleView(dryer) {
    navigate("/home/create-reservation/" + dryer);
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const res = await axios.get(`${import.meta.env.VITE_API}/dryers`, {
          params: {
            offset: (currentPage - 1) * limit,
            limit,
          },
        });

        if (!Array.isArray(res.data)) throw new Error("Invalid data from API");

        setData(
          res.data.map((dryer) => ({
            id: dryer.id,
            owner_id: dryer.owner_id,
            dryer_name: dryer.dryer_name,
            location: dryer.location,
            status:
              dryer.status && dryer.status.trim() !== ""
                ? dryer.status
                : "available",
            action: (
              <Button
                onClick={() => handleView(dryer.id)}
                className="bg-blue-400 hover:bg-blue-500 text-white"
              >
                View
              </Button>
            ),
          }))
        );
      } catch (error) {
        console.error(error);
        setIsError(true);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, limit]);

  const FilteredData = data.filter((info) => {
    const filterByFilters =
      filter && filter !== "all"
        ? info.status.toLowerCase().includes(filter.toLowerCase())
        : true;

    const filterBySearch = search
      ? Object.entries(info)
          .filter(([key]) => key !== "status" && key !== "action")
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
          handleSubmit={handleAddFormSubmit}
          fields={fieldsAdd}
          title={"Reservation"}
          button_name={"Reserve"}
        />
      )}
      <div
        className={`w-full h-[calc(100dvh-160px)] lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] rounded-lg lg:p-5 ${
          modalFilter || modalAdd ? "overflow-hidden" : "overflow-auto"
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

export default CreateReservation;
