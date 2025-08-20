import { useRef } from "react";
import { CiSearch, CiFilter } from "react-icons/ci";

function Search() {
  const inputRef = useRef(null);

  return (
    <div
      className="bg-gray-200 rounded-full w-full border border-5 border-gray-300 py-2 px-5 flex items-center gap-3
    md:w-1/2 lg:w-1/3 md:mx-auto"
    >
      <div
        onClick={() => inputRef.current?.focus()}
        className="rounded-full p-1 cursor-pointer"
      >
        <CiSearch />
      </div>
      <input
        ref={inputRef}
        type="search"
        className="bg-transparent outline-0 w-full"
        placeholder="Search..."
      />
      <div className="rounded-full p-1 cursor-pointer">
        <CiFilter />
      </div>
    </div>
  );
}

export default Search;
