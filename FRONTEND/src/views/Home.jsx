import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import Loading from "../component/Loading";
import { GiBookmarklet } from "react-icons/gi";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { MdOutlinePendingActions } from "react-icons/md";

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.clear();
        navigate("/sign-in");
        return;
      }

      try {
        await api.get("/users");
      } catch (err) {
        console.error("Auth failed:", err.response?.data);
        localStorage.clear();
        navigate("/sign-in");
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchData = useCallback(async () => {
    const data = JSON.parse(localStorage.getItem("home_data"));

    data && Object.keys(data).length > 0 ? setCards((prev) =>  ({
      ...prev,
      reservation: data.reservation ?? 0,
      pending: data.pending ?? 0,
      dryers: data.dryers ?? 0
    })) : setLoading(true)

    try {
      let result;
      let cache = {};
        
      if (localStorage.getItem("role") === 'owner') {
        result = await api.get(`/reservations/owner`,
          { params: { ownerId: localStorage.getItem("id") }, }
        )

        setCards((prev) =>  ({
          ...prev,
          reservation: result.data.length
        }))
        cache.reservation = result.data.length;

        setCards((prev) =>  ({
          ...prev,
          pending: result.data.filter(
            (item) => item.status === "pending"
          ).length
        }))
        cache.pending = result.data.filter(
          (item) => item.status === "pending"
        ).length;

        result = await api.get("/dryers/owned",
          { user: { id: localStorage.getItem("id"), }, }
        )

        setCards((prev) =>  ({
          ...prev,
          dryers: result.data.length
        }))
        cache.dryers = result.data.length;
      } else if (localStorage.getItem("role") === 'farmer') {
        result = await api.get(`/reservations/home?farmer_id=${localStorage.getItem("id")}`)

        setCards((prev) =>  ({
          ...prev,
          reservation: result.data.length
        }))
        cache.reservation = result.data.length;

        setCards((prev) =>  ({
          ...prev,
          pending: result.data.filter(
            (item) => item.status === "pending"
          ).length
        }))
        cache.pending = result.data.filter(
          (item) => item.status === "pending"
        ).length;

        setCards((prev) =>  ({
          ...prev,
          completed: result.data.filter(
            (item) => item.status === "completed"
          ).length
        }))
        cache.completed = result.data.filter(
          (item) => item.status === "completed"
        ).length;
      }

      if (!cache) return;

      const isDifferent =
        JSON.stringify(data) !==
        JSON.stringify(cache ? cache : []);

      if (isDifferent) {
        localStorage.setItem("home_data", JSON.stringify(cache));
      }
    } catch (err) {
      console.error('Let the developers know: ',err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <>
      {loading && <Loading />}
      <div className="w-full h-[calc(100dvh-160px)] p-4">
        {localStorage.getItem("role") === 'owner' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div
              className={`bg-gradient-to-r bg-green-500 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/booking-requests")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl"><GiBookmarklet className="w-full h-full" /></span>
                <span className="text-lg font-semibold">Reservations</span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">{cards.reservation ?? '...'}</div>
            </div>

            <div
              className={`bg-gradient-to-r bg-green-500 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/booking-requests")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl"><MdOutlinePendingActions className="w-full h-full" /></span>
                <span className="text-lg font-semibold">Pending Reservations</span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">{cards.pending ?? '...'}</div>
            </div>

            <div
              className={`bg-gradient-to-r bg-green-500 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/dryer-information")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl"><HiClipboardDocumentList className="w-full h-full" /></span>
                <span className="text-lg font-semibold">Dryers Owned</span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">{cards.dryers ?? '...'}</div>
            </div>
          </div>
        ) : localStorage.getItem("role") === 'farmer' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div
              className={`bg-gradient-to-r bg-green-500 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/create-reservation")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl"><GiBookmarklet className="w-full h-full" /></span>
                <span className="text-lg font-semibold">Reservations</span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">{cards.reservation ?? '...'}</div>
            </div>

            <div
              className={`bg-gradient-to-r bg-green-500 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/create-reservation")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl"><MdOutlinePendingActions className="w-full h-full" /></span>
                <span className="text-lg font-semibold">Pending Reservations</span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">{cards.pending ?? '...'}</div>
            </div>

            <div
              className={`bg-gradient-to-r bg-green-500 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/create-reservation")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl"><HiClipboardDocumentList className="w-full h-full" /></span>
                <span className="text-lg font-semibold">Completed Reservations</span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">{cards.completed ?? '...'}</div>
            </div>
          </div>
        ) : null}

        {/* <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
          {Links.map(
            (data) =>
              data.role === localStorage.getItem("role") &&
              data.list.map(
                (route, index) =>
                  index > 0 && (
                    <NavLink
                      to={route.to}
                      key={index}
                      className={`
                        flex gap-3 items-center p-3
                        rounded-md bg-[rgba(138,183,45,1)]
                        md:flex-col md:w-[48%] md:p-6 lg:w-[23%]
                        text-white shadow-md transition-all duration-300
                        hover:bg-[rgba(120,160,40,1)] hover:shadow-xl hover:scale-[1.02]
                      `}
                    >
                      <div
                        className="
                          flex items-center justify-center
                          bg-[rgba(110,146,36,1)] 
                          w-16 h-16 md:w-20 md:h-20 rounded-md
                          text-white text-3xl
                          transition-transform duration-300
                          group-hover:rotate-3
                        "
                      >
                        {route.icon}
                      </div>

                      <div
                        className="
                          flex-grow flex flex-col justify-center md:flex-grow-0 md:text-center
                        "
                      >
                        <span className="font-bold text-lg uppercase tracking-wide">
                          {route.title}
                        </span>
                        <span className="text-xs opacity-90">
                          {route.description}
                        </span>
                      </div>
                    </NavLink>
                  )
              )
          )}
        </div> */}

      </div>
    </>
  );
}

export default Home;
