import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../component/Button";
import Loading from "../component/Loading";
import axios from "axios";

function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/registration");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API}/login`, {
        email,
        password,
      });
      const { role, full_name, first_name, last_name, email } = res.data;
      localStorage.setItem("role", role);
      localStorage.setItem("full_name", full_name);
      localStorage.setItem("first_name", first_name);
      localStorage.setItem("last_name", last_name);
      localStorage.setItem("email", email);
      navigate("/home");
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      alert("Invalid login credentials Try Again");
    } finally {
      setLoading(false);
    }
  };

  const formField = [
    {
      label: "Email address",
      id: "email",
      type: "email",
      name: "email",
      required: true,
      autoComplete: "email",
      onChange: (e) => setEmail(e.target.value),
      value: email,
      defaultValue: "admin@gmail.com",
    },
    {
      label: "Password",
      id: "password",
      type: "password",
      name: "password",
      required: true,
      autoComplete: "password",
      onChange: (e) => setPassword(e.target.value),
      value: password,
      defaultValue: "123456",
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
                        onChange={field.onChange}
                        defaultValue={field.defaultValue}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type={`submit`}
                  className={`w-full bg-green-600 hover:bg-green-700 text-white`}
                >
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
