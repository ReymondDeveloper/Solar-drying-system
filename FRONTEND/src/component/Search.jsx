import { useRef } from "react";
import { CiSearch, CiFilter } from "react-icons/ci";

function Search({ setSearch, setModal }) {
  const inputRef = useRef(null);

  const handleSearchIcon = () => {
    const input = inputRef.current;
    if (!input) return;
    if (input.value.trim() === "") {
      input.focus();
    } else {
      setSearch(input.value);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setSearch(e.target.value);
    }, 500);
  };

  return (
    <div
      className="bg-gray-200 rounded-full w-full border-5 border-gray-300 p-1 flex items-center gap-3
    md:w-1/2 lg:w-1/3 md:mx-auto"
    >
      <div
        onClick={handleSearchIcon}
        className="rounded-full p-3 cursor-pointer hover:bg-[rgba(0,0,0,0.1)] transition-all duration-300"
      >
        <CiSearch />
      </div>
      <input
        ref={inputRef}
        type="search"
        className="bg-transparent outline-0 w-full"
        placeholder="Search..."
        onChange={(e) => handleSearch(e)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setSearch(e.target.value);
          }
        }}
      />
      <button
        onClick={() => setModal((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 border border-gray-300 rounded-full hover:bg-gray-300 transition-all duration-200"
      >
        <CiFilter />
        <span>Filter</span>
      </button>
    </div>
  );
}

export default Search;
