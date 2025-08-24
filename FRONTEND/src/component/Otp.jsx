import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function OTP({ setOtp, email, onVerified, loading, setLoading }) {
  const inputRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOTP = async (otpCode) => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API}/verify-otp`, {
        email,
        otp: otpCode,
      });
      toast.success(res.data.message);
      setTimeout(() => {
        localStorage.setItem("email", email);
        onVerified?.();
      }, 2000);
    } catch (err) {
      toast.error(err.response.data.message);
      inputRefs.current.forEach((input) => (input.value = ""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every((val) => val.length === 1)) {
      handleOTP(newOtp.join(""));
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex flex-col gap-5 items-center justify-center">
      <span className="font-bold text-white text-center px-5 mx-auto">
        Enter the 4 digit OTP sent to your provided Email Address.
      </span>
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((_, index) => (
          <div
            key={index}
            className="rounded-md bg-[rgba(255,255,255,0.5)] w-[50px] h-[50px]"
          >
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={otpValues[index]}
              className="w-full h-full text-center font-bold"
              onChange={(e) => handleChange(e, index)}
              maxLength={1}
              disabled={loading}
            />
          </div>
        ))}
      </div>
      <div className="px-10 md:px-5 w-full text-center">
        <button
          type="button"
          onClick={() => setOtp(false)}
          className="rounded-md bg-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.4)] w-full md:w-[50%] py-2 font-bold"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default OTP;
