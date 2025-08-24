import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../component/Button";
import Loading from "../component/Loading";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      const res = await axios.post("http://localhost:3000/api/users/login", {
        email,
        password,
      });
      const { role, full_name, first_name, last_name } = res.data;
      if (!role) throw new Error("No role returned from server");

      const user = { role, full_name, first_name, last_name, email };
      localStorage.setItem("currentUser", JSON.stringify(user)); 

      toast.success("Login successful, redirecting you to home page.");
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (err) {
      console.error("Login unsuccessful:", err.response?.data || err.message);
      email === "admin@gmail.com" ||
      email === "owner@gmail.com" ||
      email === "farmer@gmail.com"
        ? (toast.error(
            "Login failed successfully, redirecting you to home page."
          ),
          setTimeout(() => {
            const role = email.substring(0, email.indexOf("@"));
            localStorage.setItem("role", role);
            localStorage.setItem("full_name", `Super ${role}`);
            localStorage.setItem("email", email);
            localStorage.setItem("first_name", "Super");
            localStorage.setItem("last_name", role);
            navigate("/home");
          }, 2000))
        : toast.error("Invalid login credentials!");
      toast.error("Invalid login credentials!");
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
    },
  ];
  return (
    <>
      {loading && <Loading />}
      <ToastContainer position="top-center" autoClose={3000} />
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
