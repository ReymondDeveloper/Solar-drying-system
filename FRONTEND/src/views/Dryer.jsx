import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../component/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiFillStar } from "react-icons/ai";
import Button from "../component/Button";
import Modal from "../component/Modal";
import api from "../api/api.js";
import axios from "axios";

function DynamicMap({ location }) {
  let Location =
    String(location).includes("Sablayan") ||
    String(location).includes("Occidental Mindoro")
      ? location
      : location + ", Sablayan, Occidental Mindoro";
  const encodedLocation = encodeURIComponent(Location);
  const mapSrc = `https://maps.google.com/maps?q=${encodedLocation}&output=embed`;

  return (
    <div className="w-full h-64">
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
  const [filledStars, setFilledStars] = useState(new Array(5).fill(false));

  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("dryer_data");
    const data = JSON.parse(local);
    setData(data ? data : []);

    if (!data) setLoading(true);

    try {
      const result = await api.get(`/dryers/${id}`);
      const dryerData = result.data;
      if (!dryerData) throw new Error("Invalid data from API");

      const ratings = await api.get(`/ratings/${id}`);

      function uniqueRatings(ratings, currentUser) {
        if (!ratings?.data?.length) return [];

        const userRatings = ratings.data
          .filter((rating) => rating.farmer_id?.id === currentUser)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const currentUserRating = userRatings[0] || null;

        const otherRatings = ratings.data.filter(
          (rating) => rating.farmer_id?.id !== currentUser
        );

        const seen = new Set();
        const uniqueOtherRatings = otherRatings.filter((rating) => {
          const farmerId = rating.farmer_id?.id;
          if (farmerId && seen.has(farmerId)) return false;
          if (farmerId) seen.add(farmerId);
          return true;
        });

        return currentUserRating
          ? [currentUserRating, ...uniqueOtherRatings]
          : uniqueOtherRatings;
      }

      dryerData.ratings = uniqueRatings(ratings, localStorage.getItem("id"));

      const isDifferent =
        JSON.stringify(data) !== JSON.stringify(dryerData ? dryerData : []);

      if (isDifferent) {
        setData(dryerData);
        localStorage.setItem("dryer_data", JSON.stringify(dryerData));
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

  const fieldsAdd = [
    {
      label: "Date Range",
      type: "date",
      required: true,
      min: new Date(),
      colspan: 2,
    },
    {
      label: "Crop Type",
      type: "select",
      required: true,
      name: "crop_type",
      options: [{ value: "corn", phrase: "Corn" }, { value: "rice", phrase: "Rice" }],
      colspan: 1,
    },
    {
      label: "Quantity (Cavan)",
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
      options: [
        { value: "cash", phrase: "Cash" },
        { value: "gcash", phrase: "Gcash" }
      ],
      colspan: 2,
    },
  ];

  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    const { crop_type, quantity, payment, date_from, date_to } = formData;

    try {
      setLoading(true);
      const res = await api.post("/reservations", {
        farmer_id: farmerId,
        dryer_id: id,
        crop_type,
        quantity,
        payment,
        date_from,
        date_to,
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

  const handleStarClick = (index) => {
    const newFilledStars = [...filledStars];
    const isCurrentlyFilled = newFilledStars[index];

    if (isCurrentlyFilled) {
      for (let i = index; i < 5; i++) {
        newFilledStars[i] = false;
      }
    } else {
      for (let i = 0; i <= index; i++) {
        newFilledStars[i] = true;
      }
    }
    setFilledStars(newFilledStars);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    const { rating_textarea } = formData;

    if (filledStars.filter(Boolean).length <= 0) {
      toast.info("This rating is invalid.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/ratings", {
        dryer_id: id,
        rating: filledStars.filter(Boolean).length,
        comment: rating_textarea,
        farmer_id: farmerId,
      });
      toast.success(res.data.message);

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: JSON.parse(localStorage.getItem("dryer_data")).created_by_id,
        context:
          `A farmer successfully rate your dryer located on "${
            JSON.parse(localStorage.getItem("dryer_data")).location
          }" at ` + new Date().toLocaleString(),
        url: `/home/create-reservation/${id}`,
      });

      setFilledStars(new Array(5).fill(false));
      e.target.reset();
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

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
            <span className="font-medium text-gray-700">Dryer Name:</span>
            <span className=" text-gray-900">{data.dryer_name}</span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">Maximum Capacity (Cavan):</span>
            <span className=" text-gray-900">{data.maximum_capacity}</span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">
              Available Capacity (Cavan):
            </span>
            <span className="text-gray-900">{data.available_capacity}</span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">Rate:</span>
            <span className="text-gray-900">PHP {data.rate}</span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">Date Created:</span>
            <span className="text-gray-900">
              {new Date(data.created_at).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-wrap justify-between items-center bg-white p-3 rounded-md shadow-sm hover:bg-gray-100 transition-all">
            <span className="font-medium text-gray-700">Owner:</span>
            <span className="text-gray-900">{data.owner}</span>
          </div>

          {localStorage.getItem("role") !== "farmer" && (
            <div className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-sm   hover:bg-gray-100 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">
                  Operation Status:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    data.is_operation
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {data.is_operation ? (
                    "Operational"
                  ) : (
                    "Not Operational"
                  )}
                </span>
              </div>

              {!data.is_operation && data.operation_reason && (
                <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-3 rounded-md">
                  <span className="font-medium text-red-700">Reason:</span>{" "}
                  <span className="text-red-600">{data.operation_reason}</span>
                </div>
              )}
            </div>
          )}

          { data.available_capacity > 0 && data.created_by-id !== localStorage.getItem("id") && localStorage.getItem("role") === "farmer" && (
            <Button
              className="w-full bg-green-500 text-white py-3 rounded-full hover:bg-green-600 mt-4"
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

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4 mt-5 md:mt-0">
          <div className="flex items-center text-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Ratings</h2>
          </div>
          {data.available_capacity > 0 && localStorage.getItem("role") === "farmer" && data.created_by-id !== localStorage.getItem("id") && (
              <form
                className="flex flex-col gap-1"
                onSubmit={handleRatingSubmit}
              >
                <div className="w-full flex justify-center items-center gap-1 pb-2">
                  {filledStars.map((isFilled, index) => (
                    <AiFillStar
                      key={index}
                      className={`text-2xl cursor-pointer transition-colors ${
                        isFilled
                          ? "text-yellow-500"
                          : "text-gray-300 hover:text-yellow-500"
                      }`}
                      onClick={() => handleStarClick(index)}
                      role="button"
                    />
                  ))}
                </div>
                <div className="flex flex-col md:flex-row gap-1 md:h-12">
                  <textarea
                    name="rating_textarea"
                    placeholder="Descrive your experience. (optional)"
                    className="bg-[rgba(255,255,255,0.9)] border rounded flex-grow p-2 text-black resize-none"
                  ></textarea>
                  <Button
                    type={"submit"}
                    className="w-full md:w-1/4 bg-green-500 text-white py-3 rounded-full hover:bg-green-600"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            )}
          <div className="space-y-4">
            {data.ratings && data.ratings.length > 0 ? (
              data.ratings.map((rating, index) => (
                <div key={index} className="flex gap-3 border-b pb-3 mb-3">
                  <div className="flex flex-col">
                    <b className="text-lg">
                      {rating.farmer_id.name}
                      <span className="ms-5 text-xs font-normal text-gray-500">
                        ON {new Date(rating.created_at).toLocaleString()}
                      </span>
                    </b>
                    <p className="ms-5 text-green-500">{rating.comment}</p>
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
              <p className="text-gray-500 text-center">No ratings yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
