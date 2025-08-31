function Table({ data, tableHeadings, tableDataCell, startIndex }) {
  const columnCount = tableHeadings.length;
  const columnWidth = `${100 / columnCount}%`;

  return (
    <div className="max-w-full overflow-x-auto">  
      <table className="w-full border-collapse rounded-xl shadow-sm overflow-hidden" role="table">
        <thead>
          <tr>
            <th className="max-[1023px]:hidden bg-[rgb(138,183,45)] text-white text-sm font-semibold py-3 px-4 text-center">
              #
            </th>
            {tableHeadings.map((el, index) => (
              <th
                key={index}
                style={{ width: columnWidth }}
                className="max-[1023px]:hidden bg-[rgb(138,183,45)] text-white text-sm font-semibold py-3 px-4 text-center"
              >
                {el}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="lg:[&>*:nth-of-type(odd)]:bg-gray-50 lg:[&>*:nth-of-type(even)]:bg-white">
          {data.map((el, index) => (
            <tr
              key={index}
              role="row"
              className="max-[1023px]:hidden border-b last:border-none hover:bg-gray-100 transition"
            >
              <td className="text-gray-500 text-center text-sm font-medium py-3 px-4">
                {startIndex + index + 1}
              </td>

              {tableDataCell.map((dataCell, i) => (
                <td
                  key={i}
                  style={{ width: columnWidth }}
                  className={`text-sm py-3 px-4 whitespace-nowrap 
                    ${dataCell === "status" || dataCell === "action" ? "text-center" : "text-center"}
                    ${dataCell === "email" ? "lowercase" : "capitalize"}
                  `}
                >
                  {dataCell === "status" ? (
                    el.status?.toLowerCase().includes("available") ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                        <span className="hidden md:inline text-blue-600 font-medium">Available</span>
                      </span>
                    ) : el.status?.toLowerCase().includes("occupied") ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500" />
                        <span className="hidden md:inline text-red-600 font-medium">Occupied</span>
                      </span>
                    ) : (
                      el[dataCell]
                    )
                  ) : dataCell === "location" || dataCell === "address" ? (
                    el[dataCell]?.length > 24
                      ? el[dataCell].slice(0, 24) + "..."
                      : el[dataCell]
                  ) : (
                    el[dataCell]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="max-[1023px]:flex max-[1023px]:flex-col gap-4 lg:hidden mt-4">
        {data.map((el, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="bg-[rgb(138,183,45)] p-3 flex justify-between items-center">
              <span className="text-white text-sm font-medium">
                {tableHeadings[0]}: {el[tableDataCell[0]]}
              </span>
              <div className="w-6 h-6 flex justify-center items-center text-[rgb(138,183,45)] font-bold rounded-full bg-white">
                {startIndex + index + 1}
              </div>
            </div>

            <div className="p-4 space-y-2">
              {tableDataCell.map((dataCell, i) => (
                <div
                  key={i}
                  className={`text-sm ${
                    dataCell === "status" ? "font-semibold" : ""
                  }`}
                >
                  <span className="font-medium text-gray-500">
                    {tableHeadings[i]}:
                  </span>{" "}
                  {dataCell === "status" ? (
                    el.status?.toLowerCase().includes("available") ? (
                      <span className="inline-flex items-center gap-2 text-blue-600">
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                        Available
                      </span>
                    ) : el.status?.toLowerCase().includes("occupied") ? (
                      <span className="inline-flex items-center gap-2 text-red-600">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500" />
                        Occupied
                      </span>
                    ) : (
                      el[dataCell]
                    )
                  ) : dataCell === "location" || dataCell === "address" ? (
                    el[dataCell]?.length > 11
                      ? el[dataCell].slice(0, 11) + "..."
                      : el[dataCell]
                  ) : (
                    el[dataCell]
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Table;
