import Button from "./Button";
import { IoSettingsSharp } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";

function AccountModal({ setAccountModal }) {
  const navigate = useNavigate();

  const handleLogOut = (e) => {
    e.preventDefault();
    navigate("/");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
  };
  return (
    <>
      <div
        onClick={() => setAccountModal(false)}
        className="absolute z-1 top-0 left-0 flex items-start justify-end h-[calc(100dvh-56px)] w-full pt-[56px] pe-5"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[320px] bg-[rgba(0,0,0,0.1)] backdrop-blur-[6px] rounded-b-md rounded-tl-md p-5"
        >
          <div className="bg-gray-300 p-5 rounded-md flex flex-col gap-5 justify-between items-start">
            <div className="bg-gray-200 rounded-md p-5 w-full">
              <span className="font-bold capitalize">
                Account Name: {localStorage.getItem("full_name")}
                <br />
                Role: {localStorage.getItem("role")}
              </span>
              <div className="content-[''] bg-gray-300 h-[2px] my-2"></div>
              <NavLink
                to={"/home/settings"}
                onClick={() => setAccountModal(false)}
                className="bg-gray-300 p-2 font-bold rounded-md w-full hover:bg-gray-400 flex gap-1 items-center justify-center"
              >
                <IoSettingsSharp />
                Settings
              </NavLink>
            </div>
            <Button
              onClick={handleLogOut}
              className={"w-full bg-green-600 hover:bg-green-700 text-white"}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountModal;
