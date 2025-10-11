import { NavLink } from "react-router-dom";
import Links from "../utils/Links";

function Navigation({ button, setButton }) {
  
  return (
    <>
      <div
        className={`
          z-5 top-[56px] h-screen flex flex-col items-center gap-[2px] text-gray-500 font-bold w-screen max-w-[320px] bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)] absolute transition-all duration-500
          md:bg-none md:top-0 md:bg-[rgba(0,100,0,255)] md:relative md:left-0 ${
            button ? "left-0" : "-left-[100%] md:w-auto"
          }`}
      >
        <div
          className={`text-white w-full p-3 flex items-center justify-center transition-all duration-300 ${
            button ? "" : "md:hidden"
          }`}
        >
          <b className="text-5xl abril-fatface">
            Solar-Drying Reservation System
          </b>
        </div>

        {!button && (
          <div className="bg-[rgba(255,255,255,0.2)] w-full flex !ps-5 !py-3">
            <div
              className={`w-5 me-5 text-white flex items-center justify-center ${
                !button && "h-[30px]"
              }`}
            >
              <img src="/logo.png" />
            </div>
          </div>
        )}

        {Links.map(
          (link) =>
            link.role === localStorage.getItem("role") &&
            link.list.map((route, index) => (
              <NavLink
                key={index}
                onClick={() => setButton(false)}
                to={route.to}
                className="bg-[rgba(255,255,255,0.2)] w-full flex !ps-5 !py-3 transition-all duration-300 hover:bg-[rgba(255,255,255,0.3)]"
              >
                <div className={`w-5 me-5 text-white ${!button && "h-[30px]"}`}>
                  {route.icon}
                </div>
                <h1
                  className={`bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent transition-all duration-300 capitalize ${
                    button ? "md:w-auto" : "md:w-0"
                  }`}
                >
                  {button && route.title}
                </h1>
              </NavLink>
            ))
        )}
      </div>
    </>
  );
}

export default Navigation;
