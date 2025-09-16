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
    <div className="w-full h-[calc(100dvh-160px)]">
      <div className="flex flex-col md:flex-row gap-3">
        {Links.map(
          (data) =>
            data.role === localStorage.getItem("role") &&
            data.list.map(
              (route, index) =>
                index > 0 && (
                  <NavLink
                    to={route.to}
                    className={`
										flex gap-2 rounded-sm bg-[rgba(138,183,45,255)]
										md:flex-col md:w-1/2 md:p-5
                    lg:w-1/4
                  `}
                    key={index}
                  >
                    <div
                      className="
											bg-[rgba(110,146,36,255)] w-15 h-20 p-3 text-white
											md:w-20
										"
                    >
                      {route.icon}
                    </div>
                    <div
                      className="
											flex-grow flex flex-col justify-center text-white
											md:flex-grow-0
										"
                    >
                      <span className="font-bold text-lg uppercase">
                        {route.title}
                      </span>
                      <span className="text-xs">{route.description}</span>
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
