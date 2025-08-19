import { useNavigate } from 'react-router-dom'
import Button from '../component/Button'
import Loading from '../component/Loading'
import OTP from '../component/Otp'
import { useState} from "react";
import { FaCaretRight } from "react-icons/fa6";

function Registration() {
    const navigate = useNavigate();
    // const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(false);

    const handleBackToHome = (e) => {
        e.preventDefault();
        navigate('/');
    }

    const formField = [
        {label: 'Account Name', type: 'text', placeholder: 'ex. Last Name, First Name MI.', required: true, name: 'account_name'},
        {label: 'Password', type: 'password', min: 6, max: 16, placeholder: 'Enter 8-16 characters', required: true, name: 'password'},
        {
            label: 'Role', type: 'select', name: 'role',
            option: [
                {value: 'farmer', phrase: 'Farmer'},
                {value: 'owner', phrase: 'Solar-Dryer Owner'},
            ]
        },
        {label: 'Email', type: 'email', placeholder: 'Enter a valid email address', required: true, name: 'email'},
    ]

    const handleSubmit = (e) => {
        // setLoading(true);
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        alert(data.email);
        // data.account_name
        // data.password
        // data.role
        // data.email
        setOtp(true);
    }

    return(
        <>
            {/* {loading && <Loading />} */}
            {otp && <OTP />}
            <div className="h-screen overflow-hidden flex flex-col gap-1">
                <div className="relative p-2">
                    <b onClick={handleBackToHome} className="hover:text-green-500 transition-all duration-300 cursor-pointer">&larr; Create an account</b>
                    <span className="content-[''] absolute left-0 bottom-0 bg-[rgba(0,100,0,255)] w-full h-[3px]"></span>
                </div>

                <form onSubmit={handleSubmit} className='flex-grow flex flex-col justify-center gap-4 bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)] p-5'>
                    <div className='
                        flex flex-col gap-4 md:w-[50%] md:mx-auto
                    '>
                        {formField.map((data, index) => (
                            <div className='flex items-center gap-3'>

                                <div className='flex justify-center items-center gap-2 bg-[rgba(0,0,0,0.5)] w-15 rounded-full px-1'>
                                    <div className='flex justify-center font-bold text-[#00cc00]'>
                                        <h1>0{index + 1}</h1>
                                    </div>
                                    <FaCaretRight className='text-[#00cc00]' />
                                </div>
                                
                                <div className='
                                    flex flex-col gap-1 text-white w-full
                                    md:mx-auto' 
                                key={index}>
                                    <label className='font-bold'>{data.label}</label>
                                    {data.type === 'select' ? (
                                        <select className='outline-0 bg-[rgba(0,80,0,255)] p-2' name={data.name}>
                                            {data.option?.map((el, idx) => (
                                                <option key={idx} value={el.value}>
                                                    {el.phrase}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            className='bg-[rgba(0,80,0,255)] p-2 outline-0'
                                            type={data.type} 
                                            placeholder={data.placeholder}
                                            required={data.required}
                                            spellCheck="false"
                                            name={data.name}
                                            minLength={data.min}
                                            maxLength={data.max}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className='flex items-center gap-3'>
                            <div className='flex justify-center items-center gap-2 bg-[rgba(0,0,0,0.5)] w-15 rounded-full px-1'>
                                <div className='flex justify-center font-bold text-[#00cc00]'>
                                    <h1>05</h1>
                                </div>
                                <FaCaretRight className='text-[#00cc00]' />
                            </div>

                            <Button type={`submit`} className={`w-full md:mx-auto`}>Create an account</Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Registration