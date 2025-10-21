import { GiBookmarklet } from "react-icons/gi";
import { FaMapMarkedAlt, FaFileMedicalAlt } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { BiSolidDashboard } from "react-icons/bi";
import { BsFillArchiveFill } from 'react-icons/bs'
const Links = [
  {
    role: "admin",
    list: [
      {
        to: "/home",
        title: "home",
        icon: <BiSolidDashboard className="w-full h-full" />,
      },
      {
        icon: <GiBookmarklet className="w-full h-full" />,
        title: "reservations",
        description: "Approve and modify reservations.",
        to: "/home/reservations",
      },
      {
        icon: <FaMapMarkedAlt className="w-full h-full" />,
        title: "availability",
        description: "Manage dryer availability.",
        to: "/home/availability",
      },
      {
        icon: <IoPeopleSharp className="w-full h-full" />,
        title: "accounts",
        description: "Manage users` account.",
        to: "/home/accounts",
      },
      {
        icon: <FaFileMedicalAlt className="w-full h-full" />,
        title: "reports",
        description: "Generate reports.",
        to: "/home/reports",
      },
      {
        icon: <BsFillArchiveFill className="w-full h-full" />,  
        title: "archive",
        description: "View archived reservations.",
        to: "/home/archive",  
      },
    ],
  },
  {
    role: "farmer",
    list: [
      {
        to: "/home",
        title: "home",
        icon: <BiSolidDashboard className="w-full h-full" />,
      },
      {
        icon: <FaMapMarkedAlt className="w-full h-full" />,
        title: "create reservation",
        description: "Search for available dryers in the area.",
        to: "/home/create-reservation",
      },
      {
        icon: <GiBookmarklet className="w-full h-full" />,
        title: "reservation history",
        description: "View all activities.",
        to: "/home/reservation-history",
      },
    ],
  },
  {
    role: "owner",
    list: [
      {
        to: "/home",
        title: "home",
        icon: <BiSolidDashboard className="w-full h-full" />,
      },
      {
        icon: <GiBookmarklet className="w-full h-full" />,
        title: "booking request",
        description: "Manage booking requests from farmers.",
        to: "/home/booking-requests",
      },
      {
        icon: <HiClipboardDocumentList className="w-full h-full" />,
        title: "dryer information",
        description: "View details about your dryers.",
        to: "/home/dryer-information",
      },
    ],
  },
];

export default Links;
