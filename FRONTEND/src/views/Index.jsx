import Button from '../component/Button'
import { NavLink } from "react-router-dom";
import pckg from '../../package.json';

function Index() {
    const baseIMG = import.meta.env.MODE === "development" ? "/" : "/Solar-drying-system/";
    const currentVersion = pckg.version;
    return(
        <>
            <div className="h-full flex flex-col">
                <div className="bg-green-900 text-white p-5 pb-4">
                    <h1 className="text-5xl md:text-center abril-fatface">
                    Solar-Drying Reservation System
                    </h1>
                    <div className="flex gap-3 justify-end my-3">
                        <NavLink to="/registration" >
                            <Button className={'bg-green-600 hover:bg-green-700'}>Register</Button>
                        </NavLink>
                        <NavLink to="/sign-in" >
                            <Button className={'bg-green-600 hover:bg-green-700'}>Sign In</Button>
                        </NavLink>
                    </div>
                    <div className="relative">
                    <span className="content-[''] absolute w-[100dvw] -left-5 bg-green-500 h-[2px]"></span>
                    </div>
                </div>

                <img
                    className="object-cover w-full h-full flex-grow rotate-y-180"
                    src={`${baseIMG}landing_page.avif`}
                />
            </div>

            <div
                className="fixed bottom-0 right-0 m-5 rounded-lg p-[1em] bg-[rgba(0,0,0,.2)] backdrop-blur-[6px] pointer-events-none">
                <p className="text-xs text-white">{`Frontend version: ${currentVersion}`}</p>
            </div>
        </>
    )
}

export default Index