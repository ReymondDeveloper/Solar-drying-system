import Button from "./Button";
import { IoSettingsSharp } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";

function AccountModal({ setAccountModal }) {
  const navigate = useNavigate();

  const handleLogOut = (e) => {
    e.preventDefault();
    navigate("/");
    localStorage.removeItem("role");
  };
  return (
    <>
      <div
        onClick={() => setAccountModal(false)}
        className="absolute z-1 top-0 left-0 flex items-start justify-end h-[calc(100dvh-56px)] w-full pt-[56px] pe-5"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[320px] max-h-1/2 bg-gray-300 rounded-b-md rounded-tl-md p-5 flex flex-col gap-5 justify-between items-start"
        >
          <div className="bg-gray-200 rounded-md p-5 w-full">
            <span className="font-bold">
              Role:{" "}
              {localStorage.getItem("role").toUpperCase().substring(0, 1) +
                localStorage.getItem("role").substring(1)}
            </span>
            <div className="content-[''] bg-gray-300 h-[2px] my-2"></div>
            <NavLink
              to={"/home/settings"}
              className="bg-gray-300 p-2 font-bold rounded-md w-full hover:bg-gray-400 flex gap-1 items-center justify-center"
            >
              <IoSettingsSharp />
              Settings
            </NavLink>
          </div>
          <Button onClick={handleLogOut} className={"w-full bg-green-600 hover:bg-green-700 text-white"}>
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}

export default AccountModal;
