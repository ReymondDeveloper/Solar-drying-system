import Button from '../component/Button'
import { NavLink } from "react-router-dom";
function Home() {
    return(
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="bg-green-900 text-white p-5 pb-4">
                <h1 className="text-5xl md:text-center abril-fatface">
                Solar-Drying Reservation System
                </h1>
                <div className="flex gap-3 justify-end my-3">
                    <NavLink to="/registration" >
                        <Button>Register</Button>
                    </NavLink>
                    <NavLink to="/sign-in" >
                        <Button>Sign In</Button>
                    </NavLink>
                </div>
                <div className="relative">
                <span className="content-[''] absolute w-[100dvw] -left-5 bg-green-500 h-[2px]"></span>
                </div>
            </div>

            <img
                className="object-cover w-full h-full flex-grow rotate-y-180"
                src="/landing_page.avif"
            />
        </div>
    )
}

export default Home