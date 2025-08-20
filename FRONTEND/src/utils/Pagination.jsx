
const Pagination = ({ limit, setLimit, setCurrentPage, currentPageSafe, currentPage, totalPages }) => {
  const style = 'rounded-md border border-gray-300 !px-2 !py-1 text-white font-semibold bg-green-600 hover:bg-green-700 transform-all duration-300';
  return (
    <>
      <div className="flex-col justify-end items-center !p-5 md:hidden">
        <div className="flex items-center gap-3 !mb-1">
          <label>
            <b className="text-sm">Rows Per Page:</b>
          </label>

          <div className={style}>
            <b className="text-sm">
              <select
                className="outline-0"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="5" className="text-black bg-gray-200 font-bold">
                  5
                </option>
                <option value="10" className="text-black bg-gray-100 font-bold">
                  10
                </option>
                <option value="15" className="text-black bg-gray-200 font-bold">
                  15
                </option>
                <option value="20" className="text-black bg-gray-100 font-bold">
                  20
                </option>
              </select>
            </b>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button className={style}>
            <b className="text-sm">
              {currentPage} / {totalPages}
            </b>
          </button>
          <div className="flex w-full items-center gap-1">
            <button
              className={`w-1/4 ${style}`}
              onClick={() => setCurrentPage(1)}
              disabled={currentPageSafe === 1}
            >
              {'<<'}
            </button>

            <button
              className={`w-1/4 ${style}`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPageSafe === 1}
            >
              {'<'}
            </button>

            <button
              className={`w-1/4 ${style}`}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPageSafe === totalPages}
            >
              {'>'}
            </button>

            <button
              className={`w-1/4 ${style}`}
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPageSafe === totalPages}
            >
              {'>>'}
            </button>
          </div>
        </div>
      </div>
      <div className="w-full hidden md:flex justify-end items-center gap-3">
        <label>
          <b className="text-sm">Rows Per Page:</b>
        </label>

        <div className={style}>
          <b className="text-sm">
            <select
              className="outline-0"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5" className="text-black bg-gray-200 font-bold">
                5
              </option>
              <option value="10" className="text-black bg-gray-100 font-bold">
                10
              </option>
              <option value="15" className="text-black bg-gray-200 font-bold">
                15
              </option>
              <option value="20" className="text-black bg-gray-100 font-bold">
                20
              </option>
            </select>
          </b>
        </div>

        <button
          className={`md:w-1/10 lg:w-1/20 ${style}`}
          onClick={() => setCurrentPage(1)}
          disabled={currentPageSafe === 1}
        >
          {'<<'}
        </button>

        <button
          className={`md:w-1/10 lg:w-1/20 ${style}`}
          onClick={() =>
            setCurrentPage((prev) => Math.max(prev - 1, 1))
          }
          disabled={currentPageSafe === 1}
        >
          {'<'}
        </button>

        <button className={`md:w-1/10 ${style}`}>
          <b className="text-sm">
            {currentPage} / {totalPages}
          </b>
        </button>

        <button
          className={`md:w-1/10 lg:w-1/20 ${style}`}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPageSafe === totalPages}
        >
          {'>'}
        </button>

        <button
          className={`md:w-1/10 lg:w-1/20 ${style}`}
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPageSafe === totalPages}
        >
          {'>>'}
        </button>
      </div>
    </>
  );
};

export default Pagination;


