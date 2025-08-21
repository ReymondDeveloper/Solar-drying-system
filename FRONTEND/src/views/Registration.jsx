import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaCaretRight, FaArrowLeft } from "react-icons/fa6";
import Button from "../component/Button";
import Loading from "../component/Loading";
import OTP from "../component/Otp";

function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(false);

  const handleBackToHome = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate("/sign-in");
  };

  const formField = [
    {
      label: "Account Name",
      type: "text",
      placeholder: "ex. Last Name, First Name MI.",
      required: true,
      name: "account_name",
    },
    {
      label: "Password",
      type: "password",
      min: 6,
      max: 16,
      placeholder: "Enter 8-16 characters",
      required: true,
      name: "password",
    },
    {
      label: "Role",
      type: "select",
      name: "role",
      option: [
        { value: "farmer", phrase: "Farmer" },
        { value: "owner", phrase: "Solar-Dryer Owner" },
      ],
    },
    {
      label: "Email",
      type: "email",
      placeholder: "Enter a valid email address",
      required: true,
      name: "email",
    },
  ];

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const Myalert = `
        Account Name: ${data.account_name}\n
        Password: ${data.password}\n
        Role: ${data.role}\n
        Email: ${data.email}`;
    alert(Myalert);
    setLoading(false);
    setOtp(true);
  };

  return (
    <>
      {loading && <Loading />}
      {otp && <OTP setOtp={setOtp} />}
      <div className="h-full bg-gray-200 flex flex-col gap-1">
        {/* <div className="relative p-2 bg-white">
          <b
            onClick={handleBackToHome}
            className="hover:text-green-500 transition-all duration-300 cursor-pointer flex items-center gap-1"
          >
            <FaArrowLeft /> Registration
          </b>
          <span className="content-[''] absolute left-0 bottom-0 bg-[rgba(0,100,0,255)] w-full h-[3px]"></span>
        </div> */}

        {/* <span className="p-3 my-1 bg-white text-sm text-gray-800">
          Already have an account?{" "}
          <span
            onClick={handleSignIn}
            className="hover:text-green-500 transition-all duration-300 cursor-pointer select-none underline"
          >
            Click here to sign in.
          </span>
        </span> */}
 
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)]">

        <div className="bg-white p-8 rounded-2xl shadow-lg w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-[600px] mx-auto">
        {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Fields */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-3/5">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700"> First Name </label>
                  <input className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                    id="firstName" name="firstName" type="text"required
                  />
                </div>

                <div className="w-full sm:w-3/5">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700"> Last Name </label>
                  <input className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                    id="lastName" name="lastName" type="text" required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700"> Address </label>
                </div>
                <input className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                  id="address" name="address" type="address" required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700"> Email </label>
                </div>
                <input className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                  id="email" name="email" type="address" required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700"> Password </label>
                </div>
                <input className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                  id="password" name="password" type="password" required
                />
              </div>
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-green-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Register
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-sm/6 text-gray-400" onClick={handleSignIn}>
              Already have an account?
              <a href="#" class="font-semibold text-green-400 hover:text-gray-400"> Click here to sign in. </a>
            </p>
          </div>
        </div>

      {/* </form> */}
        {/* <form
          onSubmit={handleSubmit}
          className="flex-grow flex flex-col justify-center gap-4 bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)] p-5"
        >
          <div
            className="
                        flex flex-col gap-4 md:w-[50%] md:mx-auto
                    "
          >
            {formField.map((data, index) => (
              <div className="flex items-center gap-3" key={index}>
                <div className="flex justify-center items-center gap-2 bg-[rgba(0,0,0,0.5)] w-15 rounded-full px-1">
                  <div className="flex justify-center font-bold text-[#00cc00]">
                    <h1>0{index + 1}</h1>
                  </div>
                  <FaCaretRight className="text-[#00cc00]" />
                </div>

                <div
                  className="
                                    flex flex-col gap-1 text-white w-full
                                    md:mx-auto
                                "
                >
                  <label className="font-bold">{data.label}</label>
                  {data.type === "select" ? (
                    <select
                      className="outline-0 bg-[rgba(0,80,0,255)] p-2"
                      name={data.name}
                    >
                      {data.option?.map((el, idx) => (
                        <option key={idx} value={el.value}>
                          {el.phrase}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="bg-[rgba(0,80,0,255)] p-2 outline-0"
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
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center gap-2 bg-[rgba(0,0,0,0.5)] w-15 rounded-full px-1">
                <div className="flex justify-center font-bold text-[#00cc00]">
                  <h1>05</h1>
                </div>
                <FaCaretRight className="text-[#00cc00]" />
              </div>

              <Button
                type={`submit`}
                className={`w-full md:mx-auto border border-green-500`}
              >
                Create an account
              </Button>
            </div>
          </div>
        </form> */}
      </div>
    </>
  );
}

export default Registration;
