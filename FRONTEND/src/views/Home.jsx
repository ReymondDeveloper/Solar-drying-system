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
    <div className="col-span-1 sm:col-span-2 lg:col-span-4 w-full text-center text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl p-5">
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
        <span>No reservations were found.</span>
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
      ? [
          {
            rice: safeData.reduce((sum, item) => sum + (item?.rice || 0), 0),
            corn: safeData.reduce((sum, item) => sum + (item?.corn || 0), 0),
          },
        ]
      : [safeData[Number(pieFilter)]].filter(Boolean);

  const pieChartData =
    filteredData.length > 0
      ? filteredData
          .map(({ rice, corn }) => [
            { name: "Rice", value: rice },
            { name: "Corn", value: corn },
          ])
          .flat()
      : [
          { name: "Rice", value: 0 },
          { name: "Corn", value: 0 },
        ];

  return (
    <div className="w-full text-center text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl p-5">
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
      {pieChartData.length > 0 &&
      ((pieChartData[0].value !== 0 && pieChartData[1].value !== 0) ||
        !pieChartData.every((item) => item.value === 0)) ? (
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
                return `${name}: ${value}`;
              }}
            >
              {pieChartData.map((_, index) => (
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
        <span>No reservations were found.</span>
      )}
    </div>
  );
}

function ReportPieDryerType({ data = [], title }) {
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
      ? [
          {
            PRIVATE: safeData.reduce(
              (sum, item) => sum + (item?.PRIVATE || 0),
              0
            ),
            PUBLIC: safeData.reduce(
              (sum, item) => sum + (item?.PUBLIC || 0),
              0
            ),
          },
        ]
      : [safeData[Number(pieFilter)]].filter(Boolean);

  const pieChartData =
    filteredData.length > 0
      ? filteredData
          .map(({ PRIVATE, PUBLIC }) => [
            { name: "PRIVATE", value: PRIVATE },
            { name: "PUBLIC", value: PUBLIC },
          ])
          .flat()
      : [
          { name: "PRIVATE", value: 0 },
          { name: "PUBLIC", value: 0 },
        ];

  return (
    <div className="w-full text-center text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl p-5">
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
      {pieChartData.length > 0 &&
      ((pieChartData[0].value !== 0 && pieChartData[1].value !== 0) ||
        !pieChartData.every((item) => item.value === 0)) ? (
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
                return `${name}: ${value}`;
              }}
            >
              {pieChartData.map((_, index) => (
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
        <span>No reservations were found.</span>
      )}
    </div>
  );
}

function ReportCard({ onClick, icon, title, logic }) {
  return (
    <div
      className={`text-green-500 bg-gradient-to-b from-white to-green-100 rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-[1.03] transition cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-lg text-end font-semibold">{title}</span>
      </div>
      <div className="mt-5 text-5xl font-bold text-center">
        {logic ?? "..."}
      </div>
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

  const fetchData = useCallback(async () => {
    const data = JSON.parse(localStorage.getItem("home_data"));

    data && Object.keys(data).length > 0
      ? setCards((prev) => ({
          ...prev,
          reservation: data.reservation ?? 0,
          pending: data.pending ?? 0,
          approved: data.approved ?? 0,
          dryers: data.dryers ?? 0,
          completed: data.completed ?? 0,
          pie: data.pie ?? 0,
          pie_dryer_type: data.pie_dryer_type ?? 0,
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
      const cropMap = {
        rice: "rice",
        corn: "corn",
      };

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

      if (!data || data.length === 0) {
        return monthsOrder.map((month) => ({
          month,
          rice: 0,
          corn: 0,
        }));
      }

      const firstItem = data[0];

      if (firstItem.quantity !== undefined) {
        data.forEach((item) => {
          if (item.status === "approved" || item.status === "completed") {
            const date = new Date(item.created_at);
            const month = date.toLocaleString("default", { month: "long" });
            const crop = cropMap[item.crop_type.toLowerCase()];
            if (crop && monthlyTotals[month]) {
              monthlyTotals[month][crop] += item.quantity;
            }
          }
        });
      } else if (firstItem.crop_type_id !== undefined) {
        data.forEach((item) => {
          if (item.status === "approved" || item.status === "completed") {
            const date = new Date(item.crop_type_id.created_at);
            const month = date.toLocaleString("default", { month: "long" });
            const crop = cropMap[item.crop_type_id.crop_type_name.toLowerCase()];
            if (crop && monthlyTotals[month]) {
              monthlyTotals[month][crop] += item.crop_type_id.quantity;
            }
          }
        });
      }

      const result = monthsOrder.map((month) => ({
        month,
        rice: monthlyTotals[month].rice,
        corn: monthlyTotals[month].corn,
      }));

      return result;
    }

    function pieChartDryerType(data) {
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

      const monthlyCounts = {};
      monthsOrder.forEach((month) => {
        monthlyCounts[month] = { PUBLIC: 0, PRIVATE: 0 };
      });

      if (!data || data.length === 0) {
        return monthsOrder.map((month) => ({
          month,
          PUBLIC: 0,
          PRIVATE: 0,
        }));
      }

      data.forEach((item) => {
        if (item.status === "approved" || item.status === "completed") {
          const date = new Date(item.created_at);
          const month = date.toLocaleString("default", { month: "long" });

          const type = item.dryer_id?.business_type;
          if (!monthlyCounts[month] || (type !== "PUBLIC" && type !== "PRIVATE"))
            return;

          monthlyCounts[month][type] += 1;
        }
      });

      return monthsOrder.map((month) => ({
        month,
        PUBLIC: monthlyCounts[month].PUBLIC,
        PRIVATE: monthlyCounts[month].PRIVATE,
      }));
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
          approved: result.data.filter((item) => item.status === "approved")
            .length,
        }));
        cache.approved = result.data.filter(
          (item) => item.status === "approved"
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
          pie: pieChart(result.data),
        }));
        cache.pie = pieChart(result.data);

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
          approved: result.data.filter((item) => item.status === "approved")
            .length,
        }));
        cache.approved = result.data.filter(
          (item) => item.status === "approved"
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
          pie: pieChart(result.data),
        }));
        cache.pie = pieChart(result.data);

        setCards((prev) => ({
          ...prev,
          pie_dryer_type: pieChartDryerType(result.data),
        }));
        cache.pie_dryer_type = pieChartDryerType(result.data);

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
          pie_dryer_type: pieChartDryerType(reservationsResult.data.data),
        }));
        cache.pie_dryer_type = pieChartDryerType(reservationsResult.data.data);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportCard
              onClick={() => navigate("/home/booking-requests?pending=true")}
              icon={<GiBookmarklet className="w-full h-full" />}
              title={"Requests"}
              logic={cards.pending}
            />

            <ReportCard
              onClick={() => navigate("/home/booking-requests?approved=true")}
              icon={<MdOutlinePendingActions className="w-full h-full" />}
              title={"Approved Requests"}
              logic={cards.approved}
            />

            <ReportCard
              onClick={() => navigate("/home/booking-requests?completed=true")}
              icon={<MdOutlinePendingActions className="w-full h-full" />}
              title={"Completed Requests"}
              logic={cards.completed}
            />

            <ReportCard
              onClick={() => navigate("/home/dryer-information")}
              icon={<HiClipboardDocumentList className="w-full h-full" />}
              title={"Dryers Owned"}
              logic={cards.dryers}
            />

            <ReportChart
              data={cards.monthly_reservation}
              title="Monthly Report"
            />

            <ReportChart
              data={cards.yearly_reservation}
              title="Yearly Report"
            />

            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col md:flex-row gap-5">
              <ReportPie data={cards.pie} title="Reserved Crop Types (Cavan)" />
            </div>
          </div>
        ) : localStorage.getItem("role") === "farmer" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportCard
              onClick={() => navigate("/home/reservation-history")}
              icon={<GiBookmarklet className="w-full h-full" />}
              title={"Reservations"}
              logic={cards.reservation}
            />

            <ReportCard
              onClick={() => navigate("/home/reservation-history?pending=true")}
              icon={<MdOutlinePendingActions className="w-full h-full" />}
              title={"Pending Reservations"}
              logic={cards.pending}
            />

            <ReportCard
              onClick={() =>
                navigate("/home/reservation-history?approved=true")
              }
              icon={<MdOutlinePendingActions className="w-full h-full" />}
              title={"Approved Reservations"}
              logic={cards.approved}
            />

            <ReportCard
              onClick={() =>
                navigate("/home/reservation-history?completed=true")
              }
              icon={<HiClipboardDocumentList className="w-full h-full" />}
              title={"Completed Reservations"}
              logic={cards.completed}
            />

            <ReportChart
              data={cards.monthly_reservation}
              title="Monthly Report"
            />

            <ReportChart
              data={cards.yearly_reservation}
              title="Yearly Report"
            />

            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col md:flex-row gap-5">
              <ReportPie data={cards.pie} title="Reserved Crop Types (Cavan)" />

              <ReportPieDryerType
                data={cards.pie_dryer_type}
                title="Reserved Dryer Types"
              />
            </div>
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

            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col md:flex-row gap-5">
              <ReportPie data={cards.pie} title="Reserved Crop Types (Cavan)" />

              <ReportPieDryerType
                data={cards.pie_dryer_type}
                title="Reserved Dryer Types"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
