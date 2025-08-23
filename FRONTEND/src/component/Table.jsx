function Table({ data, tableHeadings, tableDataCell, startIndex }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr>
            <th className="max-[1023px]:hidden text-white bg-[rgb(138,183,45)]">
              #
            </th>
            {tableHeadings.map((el, index) => {
              return (
                <th
                  className="max-[1023px]:hidden text-white capitalize p-5 whitespace-nowrap bg-[rgb(138,183,45)] text-center"
                  key={index}
                >
                  {el}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="lg:[&>*:nth-of-type(odd)]:bg-gray-300 lg:[&>*:nth-of-type(even)]:bg-gray-200">
          {data.map((el, index) => {
            return (
              <tr
                key={index}
                role="row"
                className="max-[1023px]:hidden text-base font-bold [&>*]:p-2 lrg:[&>*]:p-5"
              >
                <td className="text-gray-400 text-center text-sm font-bold hover:underline hover:decoration-red-500">
                  {startIndex + index + 1}
                </td>

                {tableDataCell.map((dataCell, index) => {
                  return (
                    <td
                      key={index}
                      data-cell={`${tableHeadings[index]}: `}
                      className={`text-sm whitespace-nowrap hover:underline hover:decoration-red-500 capitalize ${
                        dataCell === "status" || dataCell === "action"
                          ? "text-center"
                          : "text-start"
                      }`}
                    >
                      {dataCell === "status" ? (
                        el.status?.toLowerCase().includes("available") ? (
                          <div className="w-5 h-5 rounded-full inline-block bg-blue-500" />
                        ) : el.status?.toLowerCase().includes("occupied") ? (
                          <div className="w-5 h-5 rounded-full inline-block bg-red-500" />
                        ) : (
                          el[dataCell]
                        )
                      ) : (
                        el[dataCell]
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="max-[1023px]:flex max-[1023px]:flex-col max-[1023px]:gap-3 lg:hidden">
        {data.map((el, index) => {
          return (
            <div key={index} className="w-full rounded-md flex flex-col">
              <div className="bg-[rgb(138,183,45)] p-2 flex justify-end rounded-t-md">
                <div className="w-6 h-6 flex justify-center items-center text-[rgb(138,183,45)] font-bold rounded-full bg-white">
                  {startIndex + index + 1}
                </div>
              </div>

              <div className="p-3 bg-[rgba(255,255,255,0.9)] backdrop-filter-[6px] border border-[rgb(138,183,45)] rounded-b-md relative">
                {tableDataCell.map((dataCell, index) => {
                  return (
                    <div
                      key={index}
                      data-cell={`${tableHeadings[index]}: `}
                      className={`whitespace-nowrap hover:underline hover:decoration-red-500 capitalize
                            ${
                              index === tableDataCell.length - 1
                                ? "absolute bottom-0 right-0 m-3 text-end lg:text-center lg:flex lg:justify-center"
                                : "text-start"
                            }
                            ${index === 0 ? "text-md font-bold" : "text-sm"}
                          `}
                    >
                      {dataCell === "status" ? (
                        el.status?.toLowerCase().includes("available") ? (
                          <div className="flex gap-2 items-center mt-2">
                            <div className="w-5 h-5 rounded-full inline-block bg-blue-500" />
                            <span>Available</span>
                          </div>
                        ) : el.status?.toLowerCase().includes("occupied") ? (
                          <div className="flex gap-2 items-center mt-2">
                            <div className="w-5 h-5 rounded-full inline-block bg-red-500" />
                            <span>Occupied</span>
                          </div>
                        ) : (
                          el[dataCell]
                        )
                      ) : (
                        el[dataCell]
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Table;
