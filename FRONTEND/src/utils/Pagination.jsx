import Button from "../component/Button";

const Pagination = ({ limit, setLimit, setCurrentPage, currentPageSafe, currentPage, totalPages }) => {
  return (
    <>
      <div className="flex-col justify-end items-center !p-5 md:hidden">
        <div className="flex items-center gap-3 !mb-1">
          <label>
            <b className="text-sm">Rows Per Page:</b>
          </label>

          <Button className={'bg-green-600 hover:bg-green-700 text-white text-white'}>
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
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          <Button className={'bg-green-600 hover:bg-green-700 text-white text-white'}>
            <b className="text-sm">
              {currentPage} / {totalPages}
            </b>
          </Button>
          <div className="flex w-full items-center gap-1">
            <Button
              className={`w-1/4 bg-green-600 hover:bg-green-700 text-white text-white}`}
              onClick={() => setCurrentPage(1)}
              disabled={currentPageSafe === 1}
            >
              {'<<'}
            </Button>

            <Button
              className={`w-1/4 bg-green-600 hover:bg-green-700 text-white text-white}`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPageSafe === 1}
            >
              {'<'}
            </Button>

            <Button
              className={`w-1/4 bg-green-600 hover:bg-green-700 text-white text-white}`}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPageSafe === totalPages}
            >
              {'>'}
            </Button>

            <Button
              className={`w-1/4 bg-green-600 hover:bg-green-700 text-white text-white}`}
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPageSafe === totalPages}
            >
              {'>>'}
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full hidden md:flex justify-end items-center gap-3">
        <label>
          <b className="text-sm">Rows Per Page:</b>
        </label>

        <Button className={'bg-green-600 hover:bg-green-700 text-white text-white'}>
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
        </Button>

        <Button
          className={'md:w-1/10 lg:w-1/20 bg-green-600 hover:bg-green-700 text-white text-white'}
          onClick={() => setCurrentPage(1)}
          disabled={currentPageSafe === 1}
        >
          {'<<'}
        </Button>

        <Button
          className={'md:w-1/10 lg:w-1/20 bg-green-600 hover:bg-green-700 text-white text-white'}
          onClick={() =>
            setCurrentPage((prev) => Math.max(prev - 1, 1))
          }
          disabled={currentPageSafe === 1}
        >
          {'<'}
        </Button>

        <Button className={'md:w-1/10 bg-green-600 hover:bg-green-700 text-white text-white'}>
          <b className="text-sm">
            {currentPage} / {totalPages}
          </b>
        </Button>

        <Button
          className={'md:w-1/10 lg:w-1/20 bg-green-600 hover:bg-green-700 text-white text-white'}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPageSafe === totalPages}
        >
          {'>'}
        </Button>

        <Button
          className={'md:w-1/10 lg:w-1/20 bg-green-600 hover:bg-green-700 text-white text-white'}
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPageSafe === totalPages}
        >
          {'>>'}
        </Button>
      </div>
    </>
  );
};

export default Pagination;


