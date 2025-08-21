import Button from "./Button";
import { RiCloseLargeLine } from "react-icons/ri";

function Modal({ setModal, setStatus, filters }) {
  return (
    <>
      <div
        onClick={() => setModal(false)}
        className="absolute z-1 top-0 left-0 flex items-center justify-center h-[calc(100dvh-56px)] w-full bg-[rgba(0,0,0,0.75)] backdrop-blur-[6px]"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[320px] min-h-1/2 bg-gray-300 rounded-lg p-5 flex flex-col justify-between items-start"
        >
          <div className="w-full flex justify-between items-center">
            <h1 className="font-bold text-2xl text-[rgba(0,100,0,255)]">
              Filters
            </h1>
            <div
              onClick={() => setModal(false)}
              className="p-3 cursor-pointer rounded-full hover:bg-[rgba(0,0,0,0.2)] transition-all duration-300"
            >
              <RiCloseLargeLine />
            </div>
          </div>
          <div className="w-full flex flex-col gap-3">
            {filters.map((filter, index) => (
              <div key={index} className="w-full flex flex-col gap-1">
                <label
                  htmlFor={filter.id}
                  className="text-[rgba(0,100,0,255)] font-bold text-md"
                >
                  {filter.label}
                </label>
                <div className="bg-gray-200 w-full rounded-md p-2">
                  <select
                    id={filter.id}
                    className="outline-0 w-full text-[rgba(0,100,0,255)]"
                  >
                    {filter.option.map((option, index) => (
                      <option
                        key={index}
                        className="bg-gray-200"
                        value={option.value}
                      >
                        {option.phrase}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full flex gap-3 justify-end items-center">
            <button
              onClick={() => setModal(false)}
              className="rounded-md hover:bg-[rgba(0,0,0,0.2)] py-2 px-4 transition-all duration-300"
            >
              Cancel
            </button>
            <Button
              onClick={() => {
                alert(`Status: ${document.getElementById("status").value}`);
                setStatus(document.getElementById("status").value);
                setModal(false);
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Modal;
