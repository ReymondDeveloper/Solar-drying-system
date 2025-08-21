function Table({ data, tableHeadings, tableDataCell, startIndex }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr>
            <th className="max-[991px]:hidden text-white bg-[rgb(138,183,45)]">
              #
            </th>
            {tableHeadings.map((el, index) => {
              return (
                <th
                  className={`text-white capitalize max-[991px]:hidden p-5 whitespace-nowrap bg-[rgb(138,183,45)] ${
                    index === tableHeadings.length - 1
                      ? "text-center"
                      : "text-start"
                  }`}
                  key={index}
                >
                  {el}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="[&>*:nth-of-type(odd)]:bg-gray-300 [&>*:nth-of-type(even)]:bg-gray-200">
          {data.map((el, index) => {
            return (
              <tr
                key={index}
                role="row"
                className="
                                text-base
								font-bold

                                max-[991px]:[&>*]:before:content-[attr(data-cell)]
                                max-[991px]:[&>*]:before:text-gray-500
                                max-[991px]:[&>*]:before:text-lg
                                max-[991px]:[&>*]:before:capitalize
                                max-[991px]:[&>*]:before:font-normal
                                
                                max-[991px]:[&>*]:grid
                                max-[575px]:[&>*]:gap-[.5em]
                                smTwo:[&>*]:grid-cols-[50%_auto]

                                max-[991px]:[&>*:first-child]:pt-7
                                max-[991px]:[&>*:last-child]:pb-7
                                [&>*]:p-2 lrg:[&>*]:p-5"
              >
                <td className="text-gray-400 text-center text-sm font-bold hover:underline hover:decoration-red-500">
                  {startIndex + index + 1}
                </td>

                {tableDataCell.map((dataCell, index) => {
                  return (
                    <td
                      key={index}
                      data-cell={`${tableHeadings[index]}: `}
                      className={`text-sm whitespace-nowrap hover:underline hover:decoration-red-500 ${
                        index === tableDataCell.length - 1
                          ? "text-start lg:text-center lg:flex lg:justify-center"
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
    </div>
  );
}

export default Table;
