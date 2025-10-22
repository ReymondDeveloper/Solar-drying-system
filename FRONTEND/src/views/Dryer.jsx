import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../component/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiFillStar } from "react-icons/ai";
import { CgArrowUp, CgArrowDown } from "react-icons/cg";
import Button from "../component/Button";
import Modal from "../component/Modal";
import api from "../api/api.js";
import axios from "axios";

export function DynamicMap({ location }) {
  let Location =
    String(location).includes("Sablayan") ||
    String(location).includes("Occidental Mindoro")
      ? location
      : location + ", Sablayan, Occidental Mindoro";
  const encodedLocation = encodeURIComponent(Location);
  const mapSrc = `https://maps.google.com/maps?q=${encodedLocation}&output=embed`;

  return (
    <div className="w-full h-64">
      <span className="text-lg font-semibold">Location: </span>
      <b>{Location}</b>
      <iframe
        src={mapSrc}
        className="border-0 w-full h-full mt-2"
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}

export default function Dryer() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAdd, setModalAdd] = useState(false);
  const navigate = useNavigate();
  const farmerId = localStorage.getItem("id");

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("dryer_data");
    const data = JSON.parse(local);
    setData(data ? data : []);

    if (!data) setLoading(true);

    try {
      const result = await api.get(`${import.meta.env.VITE_API}/dryers/${id}`);

      if (!result.data) throw new Error("Invalid data from API");
      const isDifferent =
        JSON.stringify(data) !== JSON.stringify(result.data ? result.data : []);
      if (isDifferent) {
        setData(result.data);
        localStorage.setItem("dryer_data", JSON.stringify(result.data));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setTimeout(() => {
        navigate("/home/dryer-information");
      }, 2000);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const ratings = [
    {
      user: "User0001",
      rating: 5,
      comment:
        "As someone who values quality, I wholeheartedly recommend this.",
    },
    {
      user: "User0002",
      rating: 4,
      comment: "Using their tools, we streamlined our operations.",
    },
  ];

  const fieldsAdd = [
    {
      label: "Crop Type",
      type: "text",
      placeholder: "ex. Rice",
      required: true,
      name: "crop_type",
      colspan: 1,
    },
    {
      label: "Quantity (Cavans)",
      type: "number",
      min: 1,
      placeholder: "ex. 50",
      required: true,
      name: "quantity",
      colspan: 1,
    },
    {
      label: "Payment Type",
      type: "select",
      name: "payment",
      options: [{ value: "gcash" }, { value: "cash" }],
      colspan: 2,
    },
  ];

  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    const { crop_type, quantity, payment } = formData;

    try {
      setLoading(true);
      const res = await api.post(`${import.meta.env.VITE_API}/reservations`, {
        farmer_id: farmerId,
        dryer_id: id,
        crop_type: crop_type,
        quantity: quantity,
        payment: payment,
        owner_id: JSON.parse(localStorage.getItem("dryer_data")).created_by_id,
      });
      toast.success(res.data.message);

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: JSON.parse(localStorage.getItem("dryer_data")).created_by_id,
        context:
          `A farmer successfully reserved your dryer located on "${
            JSON.parse(localStorage.getItem("dryer_data")).location
          }" at ` + new Date().toLocaleString(),
        url: "/home/booking-requests",
      });

      setModalAdd(false);
      setTimeout(() => {
        navigate("/home/reservation-history");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const farmersGrouped = data.farmers
    ? Object.values(
        data.farmers.reduce((acc, curr) => {
          if (!acc[curr.farmer_id])
            acc[curr.farmer_id] = { ...curr, reservations: [] };
          acc[curr.farmer_id].reservations.push({
            crop_type: curr.crop_type,
            quantity: curr.quantity,
            status: curr.status,
            reservation_date: curr.reservation_date,
          });
          return acc;
        }, {})
      )
    : [];

  return (
    <>
      {loading && <Loading />}
      <ToastContainer position="top-center" autoClose={3000} />
      {modalAdd && (
        <Modal
          setModal={setModalAdd}
          handleSubmit={handleAddFormSubmit}
          fields={fieldsAdd}
          title={"Reservation"}
          button_name={"Reserve"}
        />
      )}

      <div className={`w-full h-[calc(100dvh-170px)]`}>
        <div className="w-full h-[300px] flex justify-center items-center bg-gray-200 relative rounded-lg shadow-md">
          {data.image_url ? (
            <img
              src={data.image_url}
              className="object-cover w-full h-full rounded-lg"
              onError={() => setData((prev) => ({ ...prev, image_url: "" }))}
            />
          ) : (
            <div className="flex justify-center items-center w-full h-full bg-gray-300 rounded-lg">
              <b className="text-gray-600">No Image Available</b>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex items-center text-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Dryer Details</h2>
          </div>
          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">Dryer:</span>
            <span className=" text-gray-900">{data.dryer_name}</span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">Maximum Capacity:</span>
            <span className=" text-gray-900">{data.maximum_capacity}</span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">
              Available Capacity:
            </span>
            <span className="text-gray-900">{data.available_capacity}</span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">Rate:</span>
            <span className="text-gray-900">PHP {data.rate}</span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">Created:</span>
            <span className="text-gray-900">
              {new Date(data.created_at).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">Owner:</span>
            <span className="text-gray-900">{data.owner}</span>
          </div>

          {data.available_capacity > 0 &&
            data.owner !== localStorage.getItem("full_name") && (
              <Button
                className="w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 mt-4"
                onClick={() => setModalAdd(true)}
              >
                Reserve
              </Button>
            )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-xl font-semibold">Farmers Who Reserved</h3>
          <div>
            {farmersGrouped.length > 0 ? (
              <ul className="space-y-4">
                {farmersGrouped.map((farmer, index) => (
                  <li key={index} className="border-b border-gray-300 pb-4">
                    <div className="mb-2">
                      <span className="font-bold text-lg text-gray-800">
                        {farmer.farmer_name}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {farmer.reservations.map((res, i) => (
                        <div
                          key={i}
                          className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all"
                        >
                          <div className="flex-1 min-w-[120px]">
                            <span className="text-gray-700 font-medium">
                              Crop Type:
                            </span>{" "}
                            <span className="text-gray-900">
                              {res.crop_type}
                            </span>
                          </div>
                          <div className="flex-1 min-w-[100px]">
                            <span className="text-gray-700 font-medium">
                              Quantity:
                            </span>{" "}
                            <span className="text-gray-900">
                              {res.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-[100px]">
                            <span className="text-gray-700 font-medium">
                              Status:
                            </span>{" "}
                            <span className="text-gray-900">{res.status}</span>
                          </div>

                          <div className="flex-1 min-w-[180px]">
                            <span className="text-gray-700 font-medium">
                              Reserved On:
                            </span>{" "}
                            <span className="text-gray-900">
                              {new Date(res.reservation_date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No farmers associated with this dryer.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex items-center text-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Location</h2>
          </div>
          <DynamicMap location={data.location} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4 ">
          <div className="flex items-center text-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Ratings</h2>
          </div>
          <div className="space-y-4">
            {ratings.length > 0 ? (
              ratings.map((rating, index) => (
                <div key={index} className="flex gap-3 border-b pb-3 mb-3">
                  <div className="flex flex-col">
                    <b className="text-lg">{rating.user}</b>
                    <p className="text-gray-500">{rating.comment}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(rating.rating)].map((_, i) => (
                      <AiFillStar key={i} className="text-yellow-500" />
                    ))}
                    {[...Array(5 - rating.rating)].map((_, i) => (
                      <AiFillStar key={i + 5} className="text-gray-300" />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No ratings yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
