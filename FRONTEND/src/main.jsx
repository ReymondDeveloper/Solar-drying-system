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
              element: <Availability />,
            },
            {
              path: "reservation-history",
              element: <Availability />,
            },
            {
              path: "booking-information",
              element: <Availability />,
            },
            {
              path: "about",
              element: <Availability />,
            },
            {
              path: "update-dryer-status",
              element: <Availability />,
            },
            {
              path: "booking-requests",
              element: <Availability />,
            },
            {
              path: "dryer-information",
              element: <Availability />,
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
