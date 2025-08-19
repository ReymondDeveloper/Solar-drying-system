import { useNavigate } from "react-router-dom";
import "./Notfound.css";
import Button from "../component/Button";
import { FaArrowLeft } from "react-icons/fa6";

function Notfound() {
  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
    const navigationType =
      window.performance?.getEntriesByType("navigation")[0]?.type;

    if (navigationType === "navigate") {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center text-center !px-2">
      <div
        className="error text-[#5a5c69] text-[7rem] relative line-height-[1] w-[12.5rem] mx-auto!"
        data-text="404"
      >
        404
      </div>
      <p className="text-[1.25rem] font-bold line-height-[1.5] text-gray-800 mb-5!">
        Page Not Found
      </p>
      <p className="text-gray-500">
        It looks like you found a glitch in the matrix...
      </p>
      <Button onClick={handleBack} className={`flex items-center gap-2`}>
        <FaArrowLeft /> Go Back
      </Button>
    </div>
  );
}

export default Notfound;
