import { useState, useEffect } from "react";
import axios from "axios";
import TableSkeleton from "../component/TableSkeleton";
import Table from "../component/Table";
import Pagination from "../utils/Pagination";
import Search from "../component/Search";
import Modal from "../component/Modal";
import Loading from "../component/Loading";
import Button from "../component/Button";

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

  const fieldsFilter = [
    {
      label: "Location (Sablayan)",
      type: "select",
      name: "location",
      option: [
        { value: "all", phrase: "All" },
        { value: "location 1", phrase: "Location 1" },
        { value: "location 2", phrase: "Location 2" },
        { value: "location 3", phrase: "Location 3" },
        { value: "location 4", phrase: "Location 4" },
        { value: "location 5", phrase: "Location 5" },
      ],
    },
  ];

  const handleSubmitFilter = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const Myalert = `
      Location: ${data.location}`;
    alert(Myalert);
    setFilter(data);
    setLoading(false);
    setModalFilter(false);
  };

  const fieldsAdd = [
    {
      label: "Dryer Name",
      type: "text",
      placeholder: "ex. Dryer Name",
      required: true,
      name: "dryer_name",
    },
    {
      label: "Location (Sablayan)",
      type: "text",
      placeholder: "ex. Location",
      required: true,
      name: "location",
    },
    {
      label: "Capacity (Cavans)",
      type: "number",
      placeholder: "ex. 100",
      required: true,
      name: "capacity",
    },
    {
      label: "Rate (PHP)",
      type: "number",
      placeholder: "ex. 100.00",
      required: true,
      name: "rate",
    },
  ];

  const handleSubmitAdd = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const Myalert = `
      Dryer Name: ${data.dryer_name}\n
      Location: ${data.location}\n
      Capacity: ${data.capacity}\n
      Rate: ${data.rate}`;
    alert(Myalert);
    setData((prevData) => [...prevData, data]);
    setLoading(false);
    setModalAdd(false);
  };

  const fieldsEdit = [
    {
      label: "Dryer Name",
      type: "text",
      placeholder: "ex. Dryer Name",
      required: true,
      name: "dryer_name",
      defaultValue: "My Dryer 1",
    },
    {
      label: "Location (Sablayan)",
      type: "text",
      placeholder: "ex. Location",
      required: true,
      name: "location",
      defaultValue: "Location 1",
    },
    {
      label: "Capacity (Cavans)",
      type: "number",
      placeholder: "ex. 100",
      required: true,
      name: "capacity",
      defaultValue: "100",
    },
    {
      label: "Rate (PHP)",
      type: "number",
      placeholder: "ex. 100.00",
      required: true,
      name: "rate",
      defaultValue: "100.10",
      step: "0.01",
    },
  ];

  const handleSubmitEdit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const Myalert = `
      Dryer Name: ${data.dryer_name}\n
      Location: ${data.location}\n
      Capacity: ${data.capacity}\n
      Rate: ${data.rate}`;
    alert(Myalert);
    setLoading(false);
    setModalEdit(false);
  };

  function handleEdit(i) {
    alert(`id: ${i + 1}`);
    setModalEdit(true);
  }

  const datasView = [
    {
      dryer_name: "My Dryer 1",
      location: "Location 1",
      capacity: "100",
      available_capacity: "100",
      rate: "PHP 100.10",
    },
  ];

  const handleSubmitView = (e) => {
    setLoading(true);
    e.preventDefault();
    setLoading(false);
    setModalView(false);
  };

  function handleView(i) {
    alert(`id: ${i + 1}`);
    setModalView(true);
  }

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
            ? Results.map((data, index) => {
                return {
                  dryer_name: data.dryer_name,
                  location: data.location,
                  status: data.status,
                  action: (
                    <Button
                      onClick={() => handleView(i)}
                      className={"bg-blue-400 hover:bg-blue-500 text-white"}
                    >
                      View
                    </Button>
                  ),
                };
              })
            : []
        );
        throw new Error("Simulated error for testing purposes.");
      } catch (error) {
        console.log(error);
        // setIsError(true);
        function FakeFallbackData() {
          return Array.from({ length: 6 }, (_, i) => ({
            dryer_name: `My Dryer ${i + 1}`,
            location: `My Location ${i + 1}`,
            capacity: "100",
            available_capacity: "100",
            rate: `PHP ${100 + i * 10}.${(i + 1) * 10}`,
            action: (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => handleEdit(i)}
                  className={"bg-blue-400 hover:bg-blue-500 text-white"}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleView(i)}
                  className={"bg-blue-400 hover:bg-blue-500 text-white"}
                >
                  View
                </Button>
              </div>
            ),
          }));
        }
        setData(FakeFallbackData());
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [limit, currentPage]);

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
          handleSubmit={handleSubmitView}
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

                    <div className="rounded-md flex flex-col">
                      <div className="bg-[rgb(138,183,45)] p-2 flex justify-end rounded-t-md">
                        <div className="w-6 h-6 flex justify-center items-center text-[rgb(138,183,45)] font-bold rounded-full bg-white">
                          0
                        </div>
                      </div>
                      <div className="lg:hidden p-3 bg-[rgba(255,255,255,0.9)] backdrop-filter-[6px] border border-[rgb(138,183,45)] rounded-b-md text-center font-bold">
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
