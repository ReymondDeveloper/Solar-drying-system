import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from "./App.jsx";
import "./index.css";
import Notfound from './views/Notfound.jsx'
import Home from './views/Home.jsx'
import Registration from './views/Registration.jsx'

const baseName = import.meta.env.MODE === "development" ? "/" : "/Solar-drying-system";
const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <Notfound/>,
    children: [
      {
        index: true,
        element: <Home/>
      },
      {
        path: 'registration',
        element: <Registration/>
      },
    ]
  },
  {
    path: '*',
    element: <Notfound/>
  }
],{ basename: baseName });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
);