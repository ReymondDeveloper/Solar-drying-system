import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function Authentication({ role, children }) {
	const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const [access, setAccess] = useState(null);

    useEffect(() => {
		role === userRole ? setAccess(true) : setAccess(false)
	}, [role, userRole]);

	localStorage.removeItem('code');
	localStorage.removeItem('code_name');

    if (access === null) {
		return null;
	} else if (!access) {
		localStorage.setItem('code', '401');
		localStorage.setItem('code_name', 'Unauthorized Access');
		navigate('/error');
	}
	
    return children
}

export default Authentication