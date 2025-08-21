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

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate("/sign-in");
  };

  const formField = [
    {
      id: "full_name",
    },
    {
      label: "Address",
      id: "address",
      type: "text",
      name: "address",
      required: true,
    },
    {
      label: "Email address",
      id: "email",
      type: "email",
      name: "email",
      required: true,
    },
    {
      label: "Password",
      id: "password",
      type: "password",
      name: "password",
      required: true,
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
        <div className="flex min-h-full flex-col justify-center py-12 lg:px-8 bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)]">
          <div className="bg-white p-8 rounded-2xl shadow-lg min-w-[320px] mx-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {formField.map((data, index) =>
                data.id === "full_name" ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-3/5">
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name
                      </label>
                      <input
                        className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                        id="first_ame"
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
                      />
                    </div>
                  )
                )
              )}

              <div>
                <Button type={"submit"} className={"w-full"}>
                  Register
                </Button>
              </div>
            </form>

            <p
              className="mt-10 text-center text-sm/6 text-gray-400"
              onClick={handleSignIn}
            >
              Already have an account?{" "}
              <a
                href="#"
                class="font-semibold text-green-400 hover:text-gray-400"
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
