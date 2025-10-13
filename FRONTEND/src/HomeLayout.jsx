import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./component/Header";
import Navigation from "./component/Navigation";
import { useLocation } from "react-router-dom";
import AccountModal from "./component/AccountModal";

function HomeLayout() {
  const location = useLocation();
  const [button, setButton] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const Home = location.pathname === "/home";

  return (
    <div className="h-screen w-screen flex overflow-hidden relative">
      {!Home && <Navigation button={button} setButton={setButton} />}
      {accountModal && <AccountModal setAccountModal={setAccountModal} />}
      <div className="flex-1 overflow-auto">
        <div className="h-full flex flex-col">
          <Header
            button={button}
            setButton={setButton}
            setAccountModal={setAccountModal}
          />
          <div
            className="
              flex-grow flex flex-col gap-3 relative p-3 overflow-auto
              md:flex-row md:flex-grow-0 md:flex-wrap
            "
          >
            <img
              className="
                absolute -z-1 object-contain opacity-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 select-none
                md:top-[56px] md:-translate-y-0
              "
              src="logo.png"
            />

            <div className="bg-[rgba(0,0,0,0.1)] backdrop-blur-[6px] rounded-lg p-5 w-full text-md text-[rgba(0,100,0,255)] abril-fatface">
              {String(location.pathname).substring(1).toUpperCase()}
            </div>

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeLayout;
