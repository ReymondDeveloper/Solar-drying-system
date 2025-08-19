import { Outlet } from "react-router-dom";
import Header from "./component/Header";
import Navigation from "./component/Navigation";

function HomeLayout() {
  return (
    <div className="h-screen w-screen flex overflow-hidden relative">
      <div className="flex-1 overflow-auto">
        <div className="h-full flex flex-col">
          <Header />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default HomeLayout;
