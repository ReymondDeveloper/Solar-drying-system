import { useNavigate } from 'react-router-dom'
import { GiBookmarklet } from "react-icons/gi";
import { FaMapMarkedAlt, FaFileMedicalAlt, FaGlobe, FaEdit } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { HiClipboardDocumentList } from "react-icons/hi2";

function Home() {
    const navigate = useNavigate();
    const baseIMG = import.meta.env.MODE === "development" ? "/" : "/Solar-drying-system/";

    const handleLogOut = (e) => {
        e.preventDefault();
        localStorage.removeItem('role');
        navigate('/sign-in');
    }

    const modules = [
        {role: 'admin',
            list: [
                {icon: <GiBookmarklet className='w-full h-full' />, title: 'RESERVATIONS', description: 'Approve and modify reservations.'},
                {icon: <FaMapMarkedAlt className='w-full h-full' />, title: 'AVAILABILITY', description: 'Manage dryer availability.'},
                {icon: <IoPeopleSharp className='w-full h-full' />, title: 'ACCOUNTS', description: 'Manage users` account.'},
                {icon: <FaFileMedicalAlt className='w-full h-full' />, title: 'REPORTS', description: 'Generate reports.'},
            ]
        },
        {role: 'farmer',
            list: [
                {icon: <FaMapMarkedAlt className='w-full h-full' />, title: 'CREATE RESERVATION', description: 'Search for available dryers in the area.'},
                {icon: <GiBookmarklet className='w-full h-full' />, title: 'RESERVATION HISTORY', description: 'View all activities.'},
                {icon: <HiClipboardDocumentList className='w-full h-full' />, title: 'BOOKING INFORMATION', description: 'View details about your bookings.'},
                {icon: <FaGlobe className='w-full h-full' />, title: 'ABOUT', description: 'Learn more about us.'},
            ]
        },
        {role: 'owner',
            list: [
                {icon: <FaEdit className='w-full h-full' />, title: 'UPDATE DRYER STATUS', description: 'Search for available dryers in the area.'},
                {icon: <GiBookmarklet className='w-full h-full' />, title: 'BOOKING REQUESTS', description: 'View all activities.'},
                {icon: <HiClipboardDocumentList className='w-full h-full' />, title: 'DRYER INFORMATION', description: 'View details about your bookings.'},
            ]
        },
    ]

    return(
        <div className="h-full flex flex-col">
            <div className="h-[56px] px-10 bg-[rgba(0,100,0,255)] flex justify-between items-center font-bold">
                <span className="text-2xl text-[#00cc00] abril-fatface">{localStorage.getItem('role').toUpperCase()}</span>
                <span className="text-sm text-white hover:text-[#00cc00] trasition-all duration-300 cursor-pointer select-none" onClick={handleLogOut}>Log Out</span>
            </div>
            <div className="
                flex-grow flex flex-col gap-3 relative p-3
                md:flex-row md:flex-grow-0 md:flex-wrap
            ">
                <img
                    className="absolute -z-1 object-contain opacity-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2
                    md:top-[56px] md:-translate-y-0"
                    src={`${baseIMG}logo.png`}
                />
                {modules.map((data) => (
                    data.role === localStorage.getItem('role') ? (
                        data.list.map((li, index) => (
                            <div className='
                                flex gap-2 rounded-sm bg-[rgba(138,183,45,255)]
                                md:flex-col md:w-[calc(33.33%-10px)] md:p-5
                                lg:w-[calc(25%-10px)]'
                            key={index}>
                                <div className='bg-[rgba(110,146,36,255)] w-15 h-20 p-3
                                    md:w-20
                                '>
                                    {li.icon}
                                </div>
                                <div className='flex-grow flex flex-col justify-center text-white
                                    md:flex-grow-0
                                '>
                                    <span className='font-bold text-lg'>{li.title}</span>
                                    <span className='text-xs'>{li.description}</span>
                                </div>
                            </div>
                        ))
                    ) : null
                ))}
            </div>
        </div>
    )
}

export default Home