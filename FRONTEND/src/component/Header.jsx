import { NavLink, useLocation } from "react-router-dom";
import Burger from "./Burger";
import { FaUserCircle } from "react-icons/fa";

function Header({ button, setButton, setAccountModal }) {
  const location = useLocation();
  const Home = location.pathname === "/home";
  return (
    <>
      <div className="min-h-[56px] h-[56px] px-5 bg-[rgba(0,100,0,255)] flex gap-3 items-center font-bold">
        <div className="flex-1 flex items-center justify-between">
          {!Home && <Burger button={button} setButton={setButton} />}
          <span
            onClick={() => setAccountModal(true)}
            className="ms-auto bg-[rgba(255,255,255,0.2)] p-5 transition-all duration-300 hover:bg-[rgba(255,255,255,0.3)]"
          >
            <div className="w-5 text-white flex items-center justify-center relative">
              <FaUserCircle />
            </div>
          </span>
        </div>
      </div>
    </>
  );
}

export default Header;
