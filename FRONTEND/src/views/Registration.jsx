import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../component/Button";
import Loading from "../component/Loading";
import OTP from "../component/Otp";
import { toast } from "react-toastify";
import axios from "axios";

function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState(null);

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate("/sign-in");
  };

  const formField = [
    { id: "full_name" },
    { label: "Address", id: "address", type: "text", name: "address", required: true },
    { label: "Email address", id: "email", type: "email", name: "email", required: true },
    { label: "Password", id: "password", type: "password", name: "password", minLength: 8, maxLength: 16, required: true },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { first_name, last_name, address, email, password } =
    Object.fromEntries(formData.entries());

    try {
      const res = await axios.post("http://localhost:3000/api/users/register", {
        first_name,
        last_name,
        address,
        email,
        password,
        is_owner: true,
      });
      toast.success(res.data.message || "Registered successfully");
      toast.success(res.data.message);
      setEmailForOtp(email);
      setOtp(true); 
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
    setLoading(false);
  }; 

  return (
    <>
      {loading && <Loading />}
      {otp && <OTP 
          setOtp={setOtp} 
          email={emailForOtp} 
          onVerified={() => navigate("/sign-in")} 
      />}
      <div className="h-full bg-gray-200 flex flex-col gap-1">
        <div className="flex min-h-full flex-col justify-center py-12 lg:px-8 bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)]">
          <div className="bg-white p-8 rounded-2xl shadow-lg min-w-[320px] mx-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {formField.map((data, index) =>
                data.id === "full_name" ? (
                  <div key={index} className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-3/5">
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name
                      </label>
                      <input
                        className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                      />
                    </div>

                    <div className="w-full sm:w-3/5">
                      <label
                        htmlFor="last_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name
                      </label>
                      <input
                        className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  data.id !== "full_name" && (
                    <div key={index}>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={data.id}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {data.label}
                        </label>
                      </div>
                      <input
                        className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                        id={data.id}
                        name={data.name}
                        type={data.type}
                        required={data.required}
                        minLength={data.minLength}
                        maxLength={data.maxLength}
                      />
                    </div>
                  )
                )
              )}

              <div>
                <Button type={"submit"} className={"w-full bg-green-600 hover:bg-green-700 text-white"}>
                  Register
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <a
                className="font-semibold text-green-400 hover:text-gray-400 underline"
                onClick={handleSignIn}
              >
                Click here to sign in.
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Registration;
