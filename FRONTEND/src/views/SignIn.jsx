import { useNavigate } from "react-router-dom";
import { FaCaretRight, FaArrowLeft } from "react-icons/fa6";
import { useState } from "react";
import Button from "../component/Button";
import Loading from "../component/Loading";

function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/registration");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email } = Object.fromEntries(formData.entries());

    let role = "";

    if (email === "admin@gmail.com") {
      role = "admin";
    } else if (email === "farmer@gmail.com") {
      role = "farmer";
    } else if (email === "owner@gmail.com") {
      role = "owner";
    }

    localStorage.setItem("role", role);
    setLoading(false);
    navigate("/home");
  };

  const formField = [
    {
      label: "Email address",
      id: "email",
      type: "email",
      name: "email",
      required: true,
      autoComplete: "email",
      value: "admin@gmail.com",
    },
    {
      label: "Password",
      id: "password",
      type: "password",
      name: "password",
      required: true,
      autoComplete: "password",
      value: "admin123",
    },
  ];
  return (
    <>
      {loading && <Loading />}
      <div className="h-full bg-gray-200 flex flex-col gap-1">
        <div className="flex-grow flex flex-col justify-center bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)]">
          <div className="mx-auto min-w-[320px]">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-5">
                {formField.map((field, index) => (
                  <div key={index}>
                    <label
                      className="block text-sm font-medium text-gray-700"
                      htmlFor={field.id}
                    >
                      {field.label}
                    </label>
                    <div className="mt-2">
                      <input
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                        id={field.id}
                        type={field.type}
                        name={field.name}
                        required={field.required}
                        autoComplete={field.autoComplete}
                        value={field.value}
                      />
                    </div>
                  </div>
                ))}

                <Button type={`submit`} className={`w-full`}>
                  Sign In
                </Button>

                <div className="flex items-center justify-center">
                  <div className="text-sm">
                    <a
                      className="font-semibold text-green-400 hover:text-gray-400"
                      href="#"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                Don't have an account yet?{" "}
                <a
                  className="font-semibold text-green-400 hover:text-gray-400 underline"
                  href="#"
                  onClick={handleRegister}
                >
                  Click here to register
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;
