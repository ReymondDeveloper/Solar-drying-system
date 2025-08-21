import Button from "./Button";
import { RiCloseLargeLine } from "react-icons/ri";

function AddModal({ setAddModal, setData, adds }) {
  const handleSubmit = (e) => {
    // setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const Myalert = `
      First Name: ${data.first_name}\n
      Last Name: ${data.last_name}\n
      Password: ${data.password}\n
      Role: ${data.role}\n
      Email: ${data.email}`;
    alert(Myalert);
    setData((prevData) => [...prevData, data]);
    // setLoading(false);
    setAddModal(false);
  };
  return (
    <>
      <div
        onClick={() => setModal(false)}
        className="absolute z-1 top-0 left-0 flex items-center justify-center h-[calc(100dvh-56px)] w-full bg-[rgba(0,0,0,0.75)] backdrop-blur-[6px]"
      >
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="w-[320px] min-h-1/2 bg-gray-300 gap-5 rounded-lg p-5 flex flex-col justify-between items-start"
        >
          <div className="w-full flex justify-between items-center">
            <h1 className="font-bold text-2xl text-[rgba(0,100,0,255)]">Add</h1>
            <div
              onClick={() => setModal(false)}
              className="p-3 cursor-pointer rounded-full hover:bg-[rgba(0,0,0,0.2)] transition-all duration-300"
            >
              <RiCloseLargeLine />
            </div>
          </div>
          <div className="w-full flex flex-col gap-3">
            {adds.map((add, index) => (
              <div key={index} className="w-full flex flex-col gap-1">
                <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                  {add.label}
                </label>
                {add.type === "select" ? (
                  <div className="bg-gray-200 w-full rounded-md p-2">
                    <select
                      name={add.name}
                      className="outline-0 w-full text-[rgba(0,100,0,255)]"
                    >
                      {add.option.map((option, index) => (
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
                ) : (
                  <input
                    className="bg-gray-200 w-full rounded-md p-2 outline-0"
                    type={add.type}
                    placeholder={add.placeholder}
                    required={add.required}
                    spellCheck="false"
                    name={add.name}
                    minLength={add.min}
                    maxLength={add.max}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-full flex gap-3 justify-end items-center">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="rounded-md hover:bg-[rgba(0,0,0,0.2)] py-2 px-4 transition-all duration-300"
            >
              Cancel
            </button>
            <Button type={"submit"}>Submit</Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default AddModal;
