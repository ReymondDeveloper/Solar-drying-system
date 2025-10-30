import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import Loading from "../component/Loading";
import { GiBookmarklet } from "react-icons/gi";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { MdOutlinePendingActions } from "react-icons/md";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      dryers: data.dryers ?? 0,
      monthly_reservation: data.monthly_reservation ?? 0,
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
      } else {
        function calculate(data, key) {
          const result = data?.data || [];
          const now = new Date();
          const targetYear = now.getFullYear();
          const targetMonth = now.getMonth();
          const counts = {};

          result.forEach(item => {
            const date = new Date(item.created_at);
            const itemYear = date.getFullYear();
            const itemMonth = date.getMonth();

            if (itemYear === targetYear && itemMonth === targetMonth) {
              const dateKey = date.toISOString().split('T')[0];
              counts[dateKey] = (counts[dateKey] || 0) + 1;
            }
          });

          return Object.entries(counts)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, count]) => ({ date, [key]: count }));
        }

        const [reservationsResult, accountsResult, dryersResult] = await Promise.all([
          api.get('/reservations'),
          api.get('/users'),
          api.get('/dryers'),
        ]);

        const mergeByDate = (data1, data2, data3) => {
          const allDates = new Set([
            ...data1.map(item => item.date),
            ...data2.map(item => item.date),
            ...data3.map(item => item.date),
          ]);

          return Array.from(allDates).sort().map(date => {
            const item1 = data1.find(item => item.date === date);
            const item2 = data2.find(item => item.date === date);
            const item3 = data3.find(item => item.date === date);
            
            return {
              date,
              reservations: item1?.reservations || 0,
              accounts: item2?.accounts || 0,
              dryers: item3?.dryers || 0,
            };
          });
        };

        setCards((prev) =>  ({
          ...prev,
          monthly_reservation: mergeByDate(calculate(reservationsResult, 'reservations'), calculate(accountsResult, 'accounts'), calculate(dryersResult, 'dryers'))
        }))

        cache.monthly_reservation = mergeByDate(calculate(reservationsResult, 'reservations'), calculate(accountsResult, 'accounts'), calculate(dryersResult, 'dryers'));
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
      <div className="w-full h-[calc(100dvh-160px)] rounded-lg lg:p-5 lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] overflow-hidden">
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
        ) : (
          <div className="w-full text-center bg-white rounded-md lg:p-5 my-5">
            <h3 className="text-lg font-bold mb-4 text-start">Monthly Report</h3>
            { cards.monthly_reservation && cards.monthly_reservation.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cards.monthly_reservation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#b1c890ff" />
                  <XAxis dataKey="date" stroke="#000000ff" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#000000ff" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f9fafbd8',
                      borderRadius: '0.5rem',
                      color: '#374151',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="reservations" 
                    stroke="#3bf64eff" 
                    strokeWidth={2}
                    activeDot={{ r: 6, stroke: '#00000075', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="dryers" 
                    stroke="#3e3bf6ff" 
                    strokeWidth={2}
                    activeDot={{ r: 6, stroke: '#00000075', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accounts" 
                    stroke="#f65a3bff" 
                    strokeWidth={2}
                    activeDot={{ r: 6, stroke: '#00000075', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <span>No reservations were found.</span>
            )}
            
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
