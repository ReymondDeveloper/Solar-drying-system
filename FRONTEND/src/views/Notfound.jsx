import { useNavigate, useNavigationType } from "react-router-dom";
import "./Notfound.css";
import Button from "../component/Button";
import { FaArrowLeft } from "react-icons/fa6";

function Notfound() {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const code = localStorage.getItem("code");
  const code_name = localStorage.getItem("code_name");
  const handleBack = (e) => {
    e.preventDefault();
    if (window.history.length > 1 && navigationType === "PUSH" && code !== "401") {
      navigate(-1);
    } else {
      const redirect = localStorage.getItem("redirect");
      localStorage.clear();
      localStorage.setItem("redirect", redirect);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center text-center !px-2">
      <div
        className="error text-[#5a5c69] text-[7rem] relative line-height-[1] w-[12.5rem] mx-auto!"
        data-text="404"
      >
        {code ? code : "404"}
      </div>
      <p className="text-[1.25rem] font-bold line-height-[1.5] text-gray-800 mb-5!">
        {code_name ? code_name : "Page Not Found"}
      </p>
      <p className="text-gray-500">
        It looks like you found a glitch in the matrix...
      </p>
      <Button
        onClick={handleBack}
        className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white`}
      >
        <FaArrowLeft /> Go Back
      </Button>
    </div>
  );
}

export default Notfound;
