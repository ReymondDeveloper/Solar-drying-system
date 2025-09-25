import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Links from "../utils/Links";
import api from "../api/api.js";

function Home() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }
      try {
        await api.get("/users");
        setAuthorized(true);
      } catch (err) {
        console.error("Auth failed:", err.response?.data);
        localStorage.clear();
        navigate("/sign-in");
      }
    };

    checkAuth();
  }, [navigate]);
  if (!authorized) return null;

  return (
    <div className="w-full h-[calc(100dvh-160px)] p-4">
      <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
        {Links.map(
          (data) =>
            data.role === localStorage.getItem("role") &&
            data.list.map(
              (route, index) =>
                index > 0 && (
                  <NavLink
                    to={route.to}
                    key={index}
                    className={`
                      flex gap-3 items-center p-3
                      rounded-md bg-[rgba(138,183,45,1)]
                      md:flex-col md:w-[48%] md:p-6 lg:w-[23%]
                      text-white shadow-md transition-all duration-300
                      hover:bg-[rgba(120,160,40,1)] hover:shadow-xl hover:scale-[1.02]
                    `}
                  >
                    <div
                      className="
                        flex items-center justify-center
                        bg-[rgba(110,146,36,1)] 
                        w-16 h-16 md:w-20 md:h-20 rounded-md
                        text-white text-3xl
                        transition-transform duration-300
                        group-hover:rotate-3
                      "
                    >
                      {route.icon}
                    </div>

                    <div
                      className="
                        flex-grow flex flex-col justify-center md:flex-grow-0 md:text-center
                      "
                    >
                      <span className="font-bold text-lg uppercase tracking-wide">
                        {route.title}
                      </span>
                      <span className="text-xs opacity-90">
                        {route.description}
                      </span>
                    </div>
                  </NavLink>
                )
            )
        )}
      </div>
    </div>
  );
}

export default Home;