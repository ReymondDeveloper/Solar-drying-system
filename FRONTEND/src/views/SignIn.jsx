import { useNavigate } from "react-router-dom";
import { FaCaretRight, FaArrowLeft } from "react-icons/fa6";
import { useState } from "react";
import Button from "../component/Button";
import Loading from "../component/Loading";

function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleBackToHome = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/registration");
  };

  const formField = [
    {
      label: "Role",
      type: "select",
      name: "role",
      option: [
        { value: "admin", phrase: "Admin" },
        { value: "farmer", phrase: "Farmer" },
        { value: "owner", phrase: "Solar-Dryer Owner" },
      ],
    },
  ];

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const Myalert = `Role: ${data.role}`;
    alert(Myalert);
    localStorage.setItem("role", data.role);
    setLoading(false);
    navigate("/home");
  };
  return (
    <>
      {loading && <Loading />}
      <div className="h-full bg-gray-200 flex flex-col gap-1">
        <div className="relative p-2 bg-white">
          <b
            onClick={handleBackToHome}
            className="hover:text-green-500 transition-all duration-300 cursor-pointer flex items-center gap-1"
          >
            <FaArrowLeft /> Signing In
          </b>
          <span className="content-[''] absolute left-0 bottom-0 bg-[rgba(0,100,0,255)] w-full h-[3px]"></span>
        </div>

        <span className="p-3 my-1 bg-white text-sm text-gray-800">
          Don`t have an account yet?{" "}
          <span
            onClick={handleRegister}
            className="hover:text-green-500 transition-all duration-300 cursor-pointer select-none underline"
          >
            Click here to register.
          </span>
        </span>

        <form
          onSubmit={handleSubmit}
          className="flex-grow flex flex-col justify-center gap-4 bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)] p-5"
        >
          <div
            className="
                        flex flex-col gap-4 md:w-[50%] md:mx-auto
                    "
          >
            {formField.map((data, index) => (
              <div className="flex items-center gap-3" key={index}>
                <div className="flex justify-center items-center gap-2 bg-[rgba(0,0,0,0.5)] w-15 rounded-full px-1">
                  <div className="flex justify-center font-bold text-[#00cc00]">
                    <h1>0{index + 1}</h1>
                  </div>
                  <FaCaretRight className="text-[#00cc00]" />
                </div>

                <div
                  className="
                                    flex flex-col gap-1 text-white w-full
                                    md:mx-auto
                                "
                >
                  <label className="font-bold">{data.label}</label>
                  <select
                    className="outline-0 bg-[rgba(0,80,0,255)] p-2"
                    name={data.name}
                  >
                    {data.option?.map((el, idx) => (
                      <option key={idx} value={el.value}>
                        {el.phrase}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center gap-2 bg-[rgba(0,0,0,0.5)] w-15 rounded-full px-1">
                <div className="flex justify-center font-bold text-[#00cc00]">
                  <h1>02</h1>
                </div>
                <FaCaretRight className="text-[#00cc00]" />
              </div>

              <Button
                type={`submit`}
                className={`w-full md:mx-auto border border-green-500`}
              >
                Next
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default SignIn;
