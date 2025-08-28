import { useState } from "react";

function Reports() {
  const cards = [
    { label: "Registered User", value: 100, bg: "from-green-400 to-green-500" },
    { label: "Verified Solar Dryer Owner", value: 50, bg: "from-blue-400 to-blue-500" },
    { label: "Registered Farmer", value: 25, bg: "from-red-400 to-red-500" },
  ];

  const users = [
    { id: 1, name: "John Doe", status: "Registered" },
    { id: 2, name: "Jane Smith", status: "Verified" },
    { id: 3, name: "Michael Brown", status: "Registered" },
    { id: 4, name: "Emily Davis", status: "Verified" },
    { id: 5, name: "Daniel Wilson", status: "Registered" },
    { id: 6, name: "Farmer Juan", status: "Farmer" },
    { id: 7, name: "Maria Cruz", status: "Farmer" },
  ];

  const [filter, setFilter] = useState("All");

  const filteredUsers =
    filter === "All" ? users : users.filter((user) => user.status === filter);

  const tableHeadings = ["#", "Name", "Status"];

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100 flex flex-col">
      <div className="w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">Reports Dashboard</h2>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 w-full">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-r ${card.bg} text-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:scale-[1.03] transition`}
            >
              <div className="text-lg font-semibold">{card.label}</div>
              <div className="mt-4 text-4xl font-bold text-center drop-shadow-sm">
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">User Reservations</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-gray-700"
            >
              <option value="All">All</option>
              <option value="Registered">Registered</option>
              <option value="Verified">Verified</option>
              <option value="Farmer">Farmer</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm text-sm">
              <thead className="bg-[rgb(138,183,45)] text-white">
                <tr>
                  {tableHeadings.map((heading, idx) => (
                    <th key={idx} className="py-3 px-4 text-left font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-100 transition"
                    >
                      <td className="py-3 px-4">{user.id}</td>
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium
                            ${
                              user.status === "Verified"
                                ? "bg-green-200 text-green-800"
                                : user.status === "Farmer"
                                ? "bg-red-200 text-red-800"
                                : "bg-blue-200 text-blue-800"
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={tableHeadings.length}
                      className="py-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
