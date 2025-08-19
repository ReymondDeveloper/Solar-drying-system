import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from "./App.jsx";
import "./index.css";
import Notfound from './views/Notfound.jsx'
import Index from './views/Index'
import Registration from './views/Registration'
import SignIn from './views/SignIn'
import Home from './views/Home'

const baseName = import.meta.env.MODE === "development" ? "/" : "/Solar-drying-system";
const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <Notfound/>,
    children: [
      {
        index: true,
        element: <Index/>
      },
      {
        path: 'registration',
        element: <Registration/>
      },
      {
        path: 'sign-in',
        element: <SignIn/>
      },
      {
        path: 'home',
        element: <Home/>
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