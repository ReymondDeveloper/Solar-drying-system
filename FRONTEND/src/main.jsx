import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./AppLayout";
import "./index.css";
import Notfound from "./views/Notfound";
import Index from "./views/Index";
import Registration from "./views/Registration";
import SignIn from "./views/SignIn";
import Home from "./views/Home";
import Reservations from "./views/Reservations";
import HomeLayout from "./HomeLayout";
import Availability from "./views/Availability";
import Reports from "./views/Reports";
import Accounts from "./views/Accounts";
import CreateReservation from "./views/CreateReservation";
import Authentication from "./component/Authentication";
import ReservationHistory from "./views/ReservationHistory";
import BookingRequests from "./views/BookingRequests";
import Settings from "./views/Settings";
import DryerInformation from "./views/DryerInformation";
import Dryer from "./views/Dryer";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <Notfound />,
      children: [
        {
          index: true,
          element: <Index />,
        },
        {
          path: "registration",
          element: <Registration />,
        },
        {
          path: "sign-in",
          element: <SignIn />,
        },
        {
          path: "home",
          element: <HomeLayout />,
          children: [
            {
              index: true,
              element: <Home />,
            },
            {
              path: "reservations",
              element: (
                <Authentication role={"admin"}>
                  <Reservations />
                </Authentication>
              ),
            },
            {
              path: "availability",
              element: (
                <Authentication role={"admin"}>
                  <Availability />
                </Authentication>
              ),
            },
            {
              path: "accounts",
              element: (
                <Authentication role={"admin"}>
                  <Accounts />
                </Authentication>
              ),
            },
            {
              path: "reports",
              element: (
                <Authentication role={"admin"}>
                  <Reports />
                </Authentication>
              ),
            },
            {
              path: "settings",
              element: <Settings />,
            },
            {
              path: "create-reservation",
              element: (
                <Authentication role={"farmer"}>
                  <CreateReservation />
                </Authentication>
              ),
            },
            {
              path: "create-reservation/:id",
              element: <Dryer />,
            },
            {
              path: "reservation-history",
              element: (
                <Authentication role={"farmer"}>
                  <ReservationHistory />
                </Authentication>
              ),
            },
            {
              path: "booking-requests",
              element: (
                <Authentication role={"owner"}>
                  <BookingRequests />
                </Authentication>
              ),
            },
            {
              path: "dryer-information",
              element: (
                <Authentication role={"owner"}>
                  <DryerInformation />
                </Authentication>
              ),
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <Notfound />,
    },
  ]
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
