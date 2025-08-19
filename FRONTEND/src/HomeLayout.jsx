import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./component/Header";
import Navigation from "./component/Navigation";

function HomeLayout() {
  const [button, setButton] = useState(false);
  return (
    <div className="h-screen w-screen flex overflow-hidden relative">
      <Navigation button={button} setButton={setButton} />
      <div className="flex-1 overflow-auto">
        <div className="h-full flex flex-col">
          <Header button={button} setButton={setButton} />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default HomeLayout;
