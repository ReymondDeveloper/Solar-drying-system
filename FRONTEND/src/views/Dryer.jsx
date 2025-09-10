import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../component/Loading";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiFillStar } from "react-icons/ai";
import { CgArrowUp, CgArrowDown } from "react-icons/cg";
export function DynamicMap({ location }) {
  let Location =
    String(location).includes("Sablayan") ||
    String(location).includes("Occidental Mindoro")
      ? ""
      : location + ", Sablayan, Occidental Mindoro";
  const encodedLocation = encodeURIComponent(Location);
  const mapSrc = `https://maps.google.com/maps?q=${encodedLocation}&output=embed`;

  return (
    <div>
      <span>Location: </span>
      <b>{Location}</b>
      <iframe
        src={mapSrc}
        className="border-0 w-full h-full"
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
  const [modal, setModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await axios.get(`${import.meta.env.VITE_API}/dryers/${id}`);

        setData(res.data);

        console.log(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching data");
        setTimeout(() => {
          navigate("/home/create-reservation");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <>
      {loading && <Loading />}
      <ToastContainer position="top-center" autoClose={3000} />
      <div
        className={`w-full h-[calc(100dvh-170px)] ${
          modal ? "overflow-hidden" : "overflow-auto"
        }`}
      >
        {data.image_url ? (
          <div className="w-full h-[300px] flex items-center justify-center bg-gray-200 relative">
            <img
              src={data.image_url}
              className="object-contain h-full"
              onError={() => setData((prev) => ({ ...prev, image_url: "" }))}
            />
          </div>
        ) : (
          <>
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-200 relative">
              <div className="absolute z-1 w-100 h-0.5 bg-gray-100 rotate-45" />
              <div className="absolute z-1 w-100 h-0.5 bg-gray-100 -rotate-45" />
              <b className="z-2 text-sm font-bold">NO IMAGE AVAILABLE</b>
            </div>
          </>
        )}
        <div className="bg-gray-100 p-5 text-sm capitalize">
          <div>
            <span>Dryer: </span>
            <b>{data.dryer_name}</b>
          </div>
          <div>
            <span>Maximum Capacity: </span>
            <b>{data.capacity}</b>
          </div>
          <div>
            <span>Available Capacity: </span>
            <b>{data.available_capacity}</b>
          </div>
          <div>
            <span>Created: </span>
            <b>{new Date(data.created_at).toLocaleString()}</b>
          </div>
          <div>
            <span>Rate: </span>
            <b>PHP{data.rate}</b>
          </div>
          <DynamicMap location={data.location} />
          <div className="flex gap-5">
            <div className="flex gap-1 items-center">
              <span>Ratings: </span>
              <b>{data.ratings ?? "5.0"}</b>
              {parseFloat(data.ratings ?? "5.0") % 1 >= 0.5 ||
              parseFloat(data.ratings ?? "5.0") % 1 === 0.0 ? (
                <CgArrowUp />
              ) : (
                <CgArrowDown />
              )}
            </div>
            <div className="flex grow items-center gap-5">
              {Array.from(
                { length: Math.round(parseFloat(data.ratings ?? "5.0")) },
                (_, i) => i
              ).map((_, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-center"
                >
                  <AiFillStar className="absolute text-[15px]" />
                  <AiFillStar className="absolute text-[12px] text-yellow-500" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <b>Testimonials</b>
            <div className="flex flex-col gap-2">
              <div className="bg-gray-200 rounded p-5 flex flex-col">
                <div>User0001</div>
                <i className="font-bold">
                  "As someone who values quality, I wholeheartedly recommend
                  this."
                </i>
              </div>

              <div className="bg-gray-200 rounded p-5 flex flex-col">
                <div>User0002</div>
                <i className="font-bold">
                  "Using their tools, we streamlined our operations."
                </i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
