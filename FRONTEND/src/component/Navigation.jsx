import { NavLink } from "react-router-dom";
import { GiBookmarklet } from "react-icons/gi";
import {
  FaMapMarkedAlt,
  FaFileMedicalAlt,
  FaGlobe,
  FaEdit,
} from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { HiClipboardDocumentList } from "react-icons/hi2";

function Navigation({ button, setButton }) {
  const links = [
    {
      role: "admin",
      navigation: [
        {
          to: "/home",
          title: "Dashboard",
          icon: <GiBookmarklet className="w-full h-full" />,
        },
        {
          to: "/home/reservations",
          title: "Reservations",
          icon: <FaMapMarkedAlt className="w-full h-full" />,
        },
        {
          to: "/home/availability",
          title: "Availability",
          icon: <IoPeopleSharp className="w-full h-full" />,
        },
        {
          to: "/home/accounts",
          title: "Accounts",
          icon: <HiClipboardDocumentList className="w-full h-full" />,
        },
        {
          to: "/home/reports",
          title: "Reports",
          icon: <FaFileMedicalAlt className="w-full h-full" />,
        },
      ],
    },
    {
      role: "farmer",
      navigation: [
        {
          to: "/home",
          title: "Dashboard",
          icon: <GiBookmarklet className="w-full h-full" />,
        },
        {
          to: "/home/create-reservation",
          title: "Create Reservation",
          icon: <FaMapMarkedAlt className="w-full h-full" />,
        },
        {
          to: "/home/reservation-history",
          title: "Reservation History",
          icon: <IoPeopleSharp className="w-full h-full" />,
        },
        {
          to: "/home/booking-information",
          title: "Booking Information",
          icon: <HiClipboardDocumentList className="w-full h-full" />,
        },
        {
          to: "/home/about",
          title: "About",
          icon: <FaGlobe className="w-full h-full" />,
        },
      ],
    },
    {
      role: "owner",
      navigation: [
        {
          to: "/home",
          title: "Dashboard",
          icon: <GiBookmarklet className="w-full h-full" />,
        },
        {
          to: "/home/update-dryer-status",
          title: "Update Dryer Status",
          icon: <FaEdit className="w-full h-full" />,
        },
        {
          to: "/home/booking-requests",
          title: "Booking Requests",
          icon: <GiBookmarklet className="w-full h-full" />,
        },
        {
          to: "/home/dryer-information",
          title: "Dryer Information",
          icon: <HiClipboardDocumentList className="w-full h-full" />,
        },
      ],
    },
  ];
  return (
    <>
      <div
        className={`
          z-5 top-[56px] h-[100%] flex flex-col items-center gap-[2px] text-gray-500 font-bold w-[320px] bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)] absolute top-0 transition-all duration-500
          md:bg-none md:bg-[rgba(255,255,255,0.1)] md:relative md:left-0 ${
            button ? "left-0" : "-left-[100%]"
          }`}
      >
        <div className="text-white w-full p-3 flex items-center justify-center">
          <b className="text-5xl md:text-center abril-fatface">
            Solar-Drying Reservation System
          </b>
        </div>
        1
        {links.map(
          (link) =>
            link.role === localStorage.getItem("role") &&
            link.navigation.map((nav, index) => (
              <>
                <NavLink
                  key={index}
                  onClick={() => setButton(false)}
                  to={nav.to}
                  className="bg-[rgba(255,255,255,0.2)] w-full flex !ps-5 !py-3 transition-all duration-300 hover:bg-[rgba(255,255,255,0.3)]"
                >
                  <div className="w-5 me-3 text-white">{nav.icon}</div>
                  <h1 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {nav.title}
                  </h1>
                </NavLink>
              </>
            ))
        )}
      </div>
    </>
  );
}

export default Navigation;
