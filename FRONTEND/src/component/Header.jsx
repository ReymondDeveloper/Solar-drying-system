import { useNavigate, NavLink, useLocation } from "react-router-dom";
import Burger from "./Burger";

function Header({ button, setButton }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogOut = (e) => {
    e.preventDefault();
    localStorage.removeItem("role");
    navigate("/sign-in");
  };

  const Home = location.pathname === "/home";
  return (
    <>
      <div className="h-[56px] px-5 bg-[rgba(0,100,0,255)] flex gap-3 items-center font-bold">
        {!Home && <Burger button={button} setButton={setButton} />}
        <div className="flex-1 flex items-center justify-between">
          <NavLink to="/home" className="text-2xl text-[#00cc00] abril-fatface">
            {localStorage.getItem("role").toUpperCase()}
          </NavLink>
          <span
            className="text-sm text-white hover:text-[#00cc00] trasition-all duration-300 cursor-pointer select-none"
            onClick={handleLogOut}
          >
            Log Out
          </span>
        </div>
      </div>
    </>
  );
}

export default Header;
