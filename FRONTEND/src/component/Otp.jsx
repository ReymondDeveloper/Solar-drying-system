import { useRef, useEffect } from "react";

function OTP({ setOtp }) {
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleOTP = (otp) => {
        alert(`Entered OTP: ${otp}`);
    };

    const handleChange = (e, index) => {
        const value = e.target.value;

        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }

        const otpValues = inputRefs.current.map((input) => input.value);

        if (otpValues.every((val) => val.length === 1)) {
            handleOTP(otpValues.join(""));
        }
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex flex-col gap-5 items-center justify-center">
            <span className="font-bold text-white text-center px-5 mx-auto">Enter the 4 digit OTP sent to your provided Email Address.</span>
            <div className="flex gap-3">
                {[0, 1, 2, 3].map((_, index) => (
                    <div
                        key={index}
                        className="rounded-md bg-[rgba(255,255,255,0.5)] w-[50px] h-[50px]"
                    >
                        <input
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            pattern="[0-9]{1}"
                            className="w-full h-full text-center font-bold"
                            onBeforeInput={(e) => {
                                if (!/^\d$/.test(e.data)) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(e) => handleChange(e, index)}
                        />
                    </div>
                ))}
            </div>
            <div className="px-10 md:px-5 w-full text-center">
                <button type="button" onClick={() => setOtp(false)} className='rounded-md bg-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.4)] w-full md:w-[50%] py-2 font-bold'>Cancel</button>
            </div>
        </div>
    );
}

export default OTP;