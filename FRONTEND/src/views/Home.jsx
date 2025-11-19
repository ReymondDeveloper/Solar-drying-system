import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import Loading from "../component/Loading";
import { GiBookmarklet } from "react-icons/gi";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { MdOutlinePendingActions } from "react-icons/md";
import {
  LineChart,
  PieChart,
  Pie,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

function ReportChart({ data, title }) {
  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3 w-full text-center text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl p-5">
      <h3 className="text-lg font-bold mb-4 text-start">{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#b1c890ff" />
            <XAxis dataKey="date" stroke="#000000ff" tick={{ fontSize: 11 }} />
            <YAxis stroke="#000000ff" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f9fafbd8",
                borderRadius: "0.5rem",
                color: "#374151",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            {data[0]?.reservations !== undefined && (
              <Line
                type="monotone"
                dataKey="reservations"
                stroke="#3bf64eff"
                strokeWidth={2}
                activeDot={{ r: 6, stroke: "#00000075", strokeWidth: 2 }}
              />
            )}

            {data[0]?.accounts !== undefined && (
              <Line
                type="monotone"
                dataKey="accounts"
                stroke="#f63b3bff"
                strokeWidth={2}
                activeDot={{ r: 6, stroke: "#00000075", strokeWidth: 2 }}
              />
            )}

            {data[0]?.dryers !== undefined && (
              <Line
                type="monotone"
                dataKey="dryers"
                stroke="#4e3bf6ff"
                strokeWidth={2}
                activeDot={{ r: 6, stroke: "#00000075", strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <span>
          {localStorage.getItem("role") === "farmer"
            ? "Walang reserbasyon na natagpuan."
            : "No reservations were found."}
        </span>
      )}
    </div>
  );
}

function ReportPie({ data = [], title }) {
  const COLORS = ["#FF6384", "#36A2EB"];
  const [pieFilter, setPieFilter] = useState("all");
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const safeData = Array.isArray(data) ? data : [];

  const filteredData =
    pieFilter === "all"
      ? safeData
      : [safeData[Number(pieFilter)]].filter(Boolean);

  const MIN_SLICE_VALUE = 0.0001;

  const pieChartData =
    filteredData.length > 0
      ? filteredData
          .map(({ rice, corn }) => [
            { name: "Rice", value: rice === 0 ? MIN_SLICE_VALUE : rice },
            { name: "Corn", value: corn === 0 ? MIN_SLICE_VALUE : corn },
          ])
          .flat()
      : [
          { name: "Rice", value: MIN_SLICE_VALUE },
          { name: "Corn", value: MIN_SLICE_VALUE },
        ];

  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3 w-full text-center text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl p-5">
      <h3 className="text-lg font-bold mb-4 text-start">{title}</h3>

      <div className="w-full max-w-xs mb-3">
        <select
          value={pieFilter}
          onChange={(e) => setPieFilter(e.target.value)}
          className="w-full p-2 border border-green-300 rounded-lg bg-white text-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
        >
          <option value="all">All Months</option>
          {MONTHS.map((m, index) => (
            <option key={index} value={index}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {pieChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              label={({ name, value }) => {
                return `${name}: ${value === MIN_SLICE_VALUE ? 0 : value}`;
              }}
            >
              {pieChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <span>
          {localStorage.getItem("role") === "farmer"
            ? "Walang reserbasyon na natagpuan."
            : "No reservations were found."}
        </span>
      )}
    </div>
  );
}

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

  const getFilteredPieData = () => {
    if (!cards || !cards.monthly_reservation) return [];
    if (pieFilter === "all") {
      return [
        { name: "Mais", value: cards.corn || 0 },
        { name: "Palay", value: cards.rice || 0 },
      ];
    }

    const selectedMonth = parseInt(pieFilter);
    const monthData = cards.monthly_reservation.filter((item) => {
      const date = new Date(item.date);
      return date.getMonth() === selectedMonth;
    });

    const monthCorn = monthData.reduce(
      (sum, i) => sum + (i.reservations || 0),
      0
    );

    return [
      { name: "Mais", value: monthCorn },
      { name: "Palay", value: cards.rice || 0 },
    ];
  };

  const fetchData = useCallback(async () => {
    const data = JSON.parse(localStorage.getItem("home_data"));

    data && Object.keys(data).length > 0
      ? setCards((prev) => ({
          ...prev,
          reservation: data.reservation ?? 0,
          pending: data.pending ?? 0,
          dryers: data.dryers ?? 0,
          completed: data.completed ?? 0,
          corn: data.corn ?? 0,
          rice: data.rice ?? 0,
          monthly_reservation: data.monthly_reservation ?? 0,
          yearly_reservation: data.yearly_reservation ?? 0,
        }))
      : setLoading(true);

    function calculate(data, key, type) {
      const result = data?.data || [];
      const now = new Date();
      const targetYear = now.getFullYear();
      const targetMonth = now.getMonth();
      const counts = {};

      result.forEach((item) => {
        const date = new Date(item.created_at);
        const itemYear = date.getFullYear();
        const itemMonth = date.getMonth();
        let condition;

        if (type === "yearly") {
          condition = itemYear === targetYear;
        } else {
          condition = itemYear === targetYear && itemMonth === targetMonth;
        }

        if (condition) {
          const dateKey = date.toISOString().split("T")[0];
          counts[dateKey] = (counts[dateKey] || 0) + 1;
        }
      });

      return Object.entries(counts)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, count]) => ({ date, [key]: count }));
    }

    const mergeByDate = (data1, data2, data3) => {
      const allDates = new Set([
        ...data1.map((item) => item.date),
        ...data2.map((item) => item.date),
        ...data3.map((item) => item.date),
      ]);

      return Array.from(allDates)
        .sort()
        .map((date) => {
          const item1 = data1.find((item) => item.date === date);
          const item2 = data2.find((item) => item.date === date);
          const item3 = data3.find((item) => item.date === date);

          return {
            date,
            reservations: item1?.reservations || 0,
            accounts: item2?.accounts || 0,
            dryers: item3?.dryers || 0,
          };
        });
    };

    function pieChart(data) {
      const cropMap = { rice: "rice", mais: "corn" };

      const monthsOrder = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const monthlyTotals = {};
      monthsOrder.forEach((month) => {
        monthlyTotals[month] = { rice: 0, corn: 0 };
      });

      data.forEach(({ quantity, crop_type, created_at }) => {
        const date = new Date(created_at);
        const month = date.toLocaleString("default", { month: "long" });
        const crop = cropMap[crop_type.toLowerCase()];
        if (crop && monthlyTotals[month]) {
          monthlyTotals[month][crop] += quantity;
        }
      });

      const result = monthsOrder.map((month) => ({
        month,
        rice: monthlyTotals[month].rice,
        corn: monthlyTotals[month].corn,
      }));

      return result;
    }

    try {
      let result;
      let cache = {};

      if (localStorage.getItem("role") === "owner") {
        result = (
          await api.get(`/reservations/owner`, {
            params: { ownerId: localStorage.getItem("id") },
          })
        ).data;

        setCards((prev) => ({
          ...prev,
          reservation: result.data.length,
        }));
        cache.reservation = result.data.length;

        setCards((prev) => ({
          ...prev,
          pending: result.data.filter((item) => item.status === "pending")
            .length,
        }));
        cache.pending = result.data.filter(
          (item) => item.status === "pending"
        ).length;

        setCards((prev) => ({
          ...prev,
          corn: result.data
            .filter(
              (item) =>
                item.crop_type_id.crop_type_name.toLowerCase() === "mais" ||
                item.crop_type_id.crop_type_name.toLowerCase() === "corn"
            )
            .reduce(
              (total, item) => total + (item.crop_type_id?.quantity || 0),
              0
            ),
        }));
        cache.corn = result.data
          .filter(
            (item) =>
              item.crop_type_id.crop_type_name.toLowerCase() === "mais" ||
              item.crop_type_id.crop_type_name.toLowerCase() === "corn"
          )
          .reduce(
            (total, item) => total + (item.crop_type_id?.quantity || 0),
            0
          );

        setCards((prev) => ({
          ...prev,
          rice: result.data
            .filter(
              (item) =>
                item.crop_type_id.crop_type_name.toLowerCase() === "rice" ||
                item.crop_type_id.crop_type_name.toLowerCase() === "palay"
            )
            .reduce(
              (total, item) => total + (item.crop_type_id?.quantity || 0),
              0
            ),
        }));
        cache.rice = result.data
          .filter(
            (item) =>
              item.crop_type_id.crop_type_name.toLowerCase() === "rice" ||
              item.crop_type_id.crop_type_name.toLowerCase() === "palay"
          )
          .reduce(
            (total, item) => total + (item.crop_type_id?.quantity || 0),
            0
          );

        setCards((prev) => ({
          ...prev,
          monthly_reservation: calculate(result, "reservations"),
          yearly_reservation: calculate(result, "reservations", "yearly"),
        }));

        setCards((prev) => ({
          ...prev,
          monthly_reservation: calculate(result, "reservations"),
          yearly_reservation: calculate(result, "reservations", "yearly"),
        }));

        cache.monthly_reservation = calculate(result, "reservations");
        cache.yearly_reservation = calculate(result, "reservations", "yearly");

        result = (
          await api.get("/dryers/owned", {
            params: { id: localStorage.getItem("id") },
          })
        ).data;

        setCards((prev) => ({
          ...prev,
          dryers: result.data.length,
        }));
        cache.dryers = result.data.length;
      } else if (localStorage.getItem("role") === "farmer") {
        result = (
          await api.get(
            `/reservations/home?farmer_id=${localStorage.getItem("id")}`
          )
        ).data;

        setCards((prev) => ({
          ...prev,
          reservation: result.data.length,
        }));
        cache.reservation = result.data.length;

        setCards((prev) => ({
          ...prev,
          pending: result.data.filter((item) => item.status === "pending")
            .length,
        }));
        cache.pending = result.data.filter(
          (item) => item.status === "pending"
        ).length;

        setCards((prev) => ({
          ...prev,
          completed: result.data.filter((item) => item.status === "completed")
            .length,
        }));
        cache.completed = result.data.filter(
          (item) => item.status === "completed"
        ).length;

        setCards((prev) => ({
          ...prev,
          corn: result.data
            .filter(
              (item) =>
                item.crop_type_id.crop_type_name.toLowerCase() === "mais" ||
                item.crop_type_id.crop_type_name.toLowerCase() === "corn"
            )
            .reduce(
              (total, item) => total + (item.crop_type_id?.quantity || 0),
              0
            ),
        }));
        cache.corn = result.data
          .filter(
            (item) =>
              item.crop_type_id.crop_type_name.toLowerCase() === "mais" ||
              item.crop_type_id.crop_type_name.toLowerCase() === "corn"
          )
          .reduce(
            (total, item) => total + (item.crop_type_id?.quantity || 0),
            0
          );

        setCards((prev) => ({
          ...prev,
          rice: result.data
            .filter(
              (item) =>
                item.crop_type_id.crop_type_name.toLowerCase() === "rice" ||
                item.crop_type_id.crop_type_name.toLowerCase() === "palay"
            )
            .reduce(
              (total, item) => total + (item.crop_type_id?.quantity || 0),
              0
            ),
        }));
        cache.rice = result.data
          .filter(
            (item) =>
              item.crop_type_id.crop_type_name.toLowerCase() === "rice" ||
              item.crop_type_id.crop_type_name.toLowerCase() === "palay"
          )
          .reduce(
            (total, item) => total + (item.crop_type_id?.quantity || 0),
            0
          );

        setCards((prev) => ({
          ...prev,
          monthly_reservation: calculate(result, "reservations"),
          yearly_reservation: calculate(result, "reservations", "yearly"),
        }));

        cache.monthly_reservation = calculate(result, "reservations");
        cache.yearly_reservation = calculate(result, "reservations", "yearly");
      } else {
        const [reservationsResult, accountsResult, dryersResult] =
          await Promise.all([
            api.get("/reservations"),
            api.get("/users"),
            api.get("/dryers"),
          ]);

        setCards((prev) => ({
          ...prev,
          pie: pieChart(reservationsResult.data.data),
        }));
        cache.pie = pieChart(reservationsResult.data.data);

        setCards((prev) => ({
          ...prev,
          monthly_reservation: mergeByDate(
            calculate(reservationsResult.data, "reservations"),
            calculate(accountsResult.data, "accounts"),
            calculate(dryersResult.data, "dryers")
          ),
          yearly_reservation: mergeByDate(
            calculate(reservationsResult.data, "reservations", "yearly"),
            calculate(accountsResult.data, "accounts", "yearly"),
            calculate(dryersResult.data, "dryers", "yearly")
          ),
        }));

        cache.monthly_reservation = mergeByDate(
          calculate(reservationsResult.data, "reservations"),
          calculate(accountsResult.data, "accounts"),
          calculate(dryersResult.data, "dryers")
        );

        cache.yearly_reservation = mergeByDate(
          calculate(reservationsResult.data, "reservations", "yearly"),
          calculate(accountsResult.data, "accounts", "yearly"),
          calculate(dryersResult.data, "dryers", "yearly")
        );
      }

      if (!cache) return;

      const isDifferent =
        JSON.stringify(data) !== JSON.stringify(cache ? cache : []);

      if (isDifferent) {
        localStorage.setItem("home_data", JSON.stringify(cache));
      }
    } catch (err) {
      console.error("Let the developers know: ", err);
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
      <div className="w-full h-[calc(100dvh-160px)] rounded-lg lg:p-5 lg:bg-[rgba(0,0,0,0.1)] lg:backdrop-blur-[6px] overflow-y-auto overflow-x-hidden">
        {localStorage.getItem("role") === "owner" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className={`text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/booking-requests")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">
                  <GiBookmarklet className="w-full h-full" />
                </span>
                <span className="text-lg font-semibold">Reservations</span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">
                {cards.reservation ?? "..."}
              </div>
            </div>

            <div
              className={`text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/booking-requests")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">
                  <MdOutlinePendingActions className="w-full h-full" />
                </span>
                <span className="text-lg font-semibold">
                  Pending Reservations
                </span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">
                {cards.pending ?? "..."}
              </div>
            </div>

            <div
              className={`text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/dryer-information")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">
                  <HiClipboardDocumentList className="w-full h-full" />
                </span>
                <span className="text-lg font-semibold">Dryers Owned</span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">
                {cards.dryers ?? "..."}
              </div>
            </div>

            <ReportChart
              data={cards.monthly_reservation}
              title="Monthly Report"
            />

            <ReportChart
              data={cards.yearly_reservation}
              title="Yearly Report"
            />

            <ReportPie
              data={
                cards.corn !== undefined && cards.rice !== undefined
                  ? [
                      { name: "Mais", value: cards.corn },
                      { name: "Palay", value: cards.rice },
                    ]
                  : []
              }
              title="Reserved Crop Types (Cavans)"
            />
          </div>
        ) : localStorage.getItem("role") === "farmer" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              className={`text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/create-reservation")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">
                  <GiBookmarklet className="w-full h-full" />
                </span>
                <span className="text-lg font-semibold">Mga Reserbasyon</span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">
                {cards.reservation ?? "..."}
              </div>
            </div>

            <div
              className={`text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/create-reservation")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">
                  <MdOutlinePendingActions className="w-full h-full" />
                </span>
                <span className="text-lg font-semibold">
                  Mga Kasalukuyang Reserbasyon
                </span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">
                {cards.pending ?? "..."}
              </div>
            </div>

            <div
              className={`text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
              onClick={() => navigate("/home/create-reservation")}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">
                  <HiClipboardDocumentList className="w-full h-full" />
                </span>
                <span className="text-lg font-semibold">
                  Mga Natapos na Reserbasyon
                </span>
              </div>
              <div className="mt-5 text-5xl font-bold text-center">
                {cards.completed ?? "..."}
              </div>
            </div>

            <ReportChart
              data={cards.monthly_reservation}
              title="Buwanang Ulat"
            />

            <ReportChart data={cards.yearly_reservation} title="Taonang Ulat" />

            <ReportPie
              data={
                cards.corn !== undefined && cards.rice !== undefined
                  ? [
                      { name: "Mais", value: cards.corn },
                      { name: "Palay", value: cards.rice },
                    ]
                  : []
              }
              title="Kaban Ng Mga Naka Reserbang Pananim"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReportChart
              data={cards.monthly_reservation}
              title="Monthly Report"
            />

            <ReportChart
              data={cards.yearly_reservation}
              title="Yearly Report"
            />

            <ReportPie data={cards.pie} title="Reserved Crop Types (Cavans)" />
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
