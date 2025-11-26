import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

function Authentication({ role, children }) {
	const navigate = useNavigate();
  	const location = useLocation();
    const userRole = localStorage.getItem('role');
    const [access, setAccess] = useState(null);

    useEffect(() => {
		if (Array.isArray(role)) {
			setAccess(role.includes(userRole));
		} else {
			setAccess(role === userRole);
		}
	}, [role, userRole]);

	!localStorage.getItem("code") && localStorage.removeItem("code");
	!localStorage.getItem("code_name") && localStorage.removeItem("code_name");
	!localStorage.getItem("redirect") && localStorage.removeItem("redirect");

    useEffect(() => {
		if (access === false) {
			if (location.pathname !== "/error") {
				!localStorage.getItem("code") && localStorage.setItem("code", "401");
				!localStorage.getItem("code_name") && localStorage.setItem("code_name", "Unauthorized Access");
				!localStorage.getItem("redirect") && localStorage.setItem("redirect", location.pathname + location.search + location.hash);
			}
			navigate("/error");
		}
	}, [access, navigate, location]);

	if (access === null) {
		return null;
	}
	
    return children
}

export default Authentication