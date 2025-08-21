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
import Sample from "./views/Sample";
import CreateReservation from "./views/CreateReservation";

const baseName =
  import.meta.env.MODE === "development" ? "/" : "/Solar-drying-system";
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
              element: <Reservations />,
            },
            {
              path: "availability",
              element: <Availability />,
            },
            {
              path: "accounts",
              element: <Accounts />,
            },
            {
              path: "reports",
              element: <Reports />,
            },
            {
              path: "create-reservation",
              element: <CreateReservation />,
            },
            {
              path: "reservation-history",
              element: <Sample />,
            },
            {
              path: "booking-information",
              element: <Sample />,
            },
            {
              path: "about",
              element: <Sample />,
            },
            {
              path: "update-dryer-status",
              element: <Sample />,
            },
            {
              path: "booking-requests",
              element: <Sample />,
            },
            {
              path: "dryer-information",
              element: <Sample />,
            },
            {
              path: "settings",
              element: <Sample />,
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <Notfound />,
    },
  ],
  { basename: baseName }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
