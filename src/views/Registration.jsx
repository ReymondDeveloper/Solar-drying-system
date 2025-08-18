import { useNavigate } from 'react-router-dom'
import Button from '../component/Button'

function Registration() {
    const navigate = useNavigate();

    const handleBackToHome = (e) => {
        e.preventDefault();
        navigate('/');
    }

    const formField = [
        {label: 'Account Name', type: 'text', placeholder: 'ex. Last Name, First Name MI.', required: true},
        {label: 'Password', type: 'password', min: 6, max: 16, placeholder: 'Enter 8-16 characters', required: true},
        {
            label: 'Role', type: 'select',
            option: [
                {value: 'farmer', phrase: 'Farmer'},
                {value: 'owner', phrase: 'Solar-Dryer Owner'},
            ]
        },
        {label: 'Email', type: 'email', placeholder: 'Enter a valid email address', required: true},
    ]

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        alert(JSON.stringify(data));
    }

    return(
        <div className="h-screen overflow-hidden flex flex-col gap-1">
            <div className="relative p-2">
                <b onClick={handleBackToHome} className="hover:text-green-500 transition-all duration-300 cursor-pointer">&larr; Create an account</b>
                <span className="content-[''] absolute left-0 bottom-0 bg-[rgba(0,100,0,255)] w-full h-[3px]"></span>
            </div>

            <form onSubmit={handleSubmit} className='flex-grow flex flex-col gap-4 bg-[rgba(0,100,0,255)] p-5'>
                <div className='
                    grid grid-cols-1 
                    md:grid-cols-2 gap-4
                '>
                    {formField.map((data, index) => (
                        <div className='
                            flex flex-col gap-1 text-white
                            md:w-full md:mx-auto' 
                        key={index}>
                            <label className='font-bold'>{data.label}</label>
                            {data.type === 'select' ? (
                                <select className='outline-0 bg-[rgba(0,80,0,255)] p-2' name={data.type}>
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
                                    name={data.type}
                                    minLength={data.min}
                                    maxLength={data.max}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <Button type={`submit`} className={`md:w-[50%] md:mx-auto`}>Create an account</Button>
            </form>
        </div>
    )
}

export default Registration