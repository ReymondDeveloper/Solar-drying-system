import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../component/Button";
import Loading from "../component/Loading";
import OTP from "../component/Otp";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RiCloseLargeLine } from "react-icons/ri";

function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(false);
  const [email, setEmail] = useState(null);
  const [address, setAddress] = useState("");
  const handleSignIn = (e) => {
    e.preventDefault();
    navigate("/sign-in");
  };

  const formField = [
    {
      label: "First Name",
      type: "text",
      name: "first_name",
      required: true,
      colspan: 1,
    },
    {
      label: "Middle Name",
      type: "text",
      name: "middle_name",
      required: false,
      colspan: 1,
    },
    {
      label: "Last Name",
      type: "text",
      name: "last_name",
      required: true,
      colspan: 1,
    },
    {
      label: "Mobile Number",
      type: "text",
      name: "mobile_number",
      required: true,
      colspan: 1,
      onchange: (e) => {
        let newValue = e.target.value.replace(/\D/g, "");

        if (newValue.startsWith("0")) {
          newValue = "+63" + newValue.slice(1);
        } else if (newValue.startsWith("63")) {
          newValue = "+" + newValue;
        } else if (!newValue.startsWith("+63") && newValue.length > 0) {
          newValue = "+63" + newValue;
        }

        if (newValue.length > 13) {
          newValue = newValue.slice(0, 13);
        }
        e.target.value = newValue;
      },
    },
    {
      label: "Email address",
      type: "email",
      name: "email",
      required: true,
      colspan: 2,
    },
    {
      label: "Address",
      type: "text",
      name: "address",
      required: true,
      colspan: 2,
    },
    {
      label: "Role",
      type: "select",
      name: "role",
      options: [{ value: "owner" }, { value: "farmer" }],
      colspan: 2,
    },
    {
      label: "Password",
      type: "password",
      name: "password",
      minLength: 8,
      maxLength: 16,
      required: true,
      colspan: 2,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const {
      first_name,
      middle_name,
      last_name,
      address,
      email,
      role,
      password,
      mobile_number,
    } = Object.fromEntries(formData.entries());
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/users/register`,
        {
          first_name,
          middle_name,
          last_name,
          address,
          email,
          password,
          role,
          mobile_number,
        }
      );
      toast.success(res.data.message);

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: res.data.id,
        context:
          `You've successfully created your account at ` +
          new Date().toLocaleString(),
      });

      setTimeout(() => {
        setEmail(email);
        localStorage.setItem("email", email);
        setOtp(true);
      }, 2000);
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
          .then((res) => res.json())
          .then((data) => {
            const reversed = [...data.localityInfo.administrative].reverse();
            const address = reversed
              .map((level) => level.name.replace(/\s\(\w+?\)/, ""))
              .join(", ");
            setAddress(`${address}`);
          })
          .catch((err) =>
            toast.error("Failed to get address. ", err.response?.data?.message)
          );
      },
      (err) => {
        toast.error(
          "Permission denied or location error. ",
          err.response?.data?.message
        );
      }
    );
  };

  return (
    <>
      {loading && <Loading />}
      <ToastContainer position="top-center" autoClose={3000} />
      {otp && (
        <OTP
          setOtp={setOtp}
          email={email}
          onVerified={() => navigate("/sign-in")}
          loading={loading}
          setLoading={setLoading}
        />
      )}
      <div className="h-full bg-gray-200 flex flex-col gap-1">
        <div className="min-h-full overflow-auto bg-[url(/landing_page.avif)] bg-cover">
          <div className="w-full h-dvh backdrop-blur-sm backdrop-brightness-75 flex flex-col justify-start lg:px-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg min-w-[320px] m-auto">
              <NavLink to={"/"} className="flex justify-end mb-4">
                <div className="hover:bg-gray-200 rounded-full p-2">
                  <RiCloseLargeLine size={22} />
                </div>
              </NavLink>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
                {formField.map((data, index) =>
                  data.type === "select" ? (
                    <div
                      key={index}
                      className={`col-span-2 ${
                        data.colspan === 1 ? "md:col-span-1" : "md:col-span-2"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={data.name}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {data.label}
                        </label>
                      </div>
                      <select
                        required={data.required}
                        name={data.name}
                        className="outline-0 capitalize mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        {data.options.map((option, i) => (
                          <option key={i} value={option.value}>
                            {option.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className={`col-span-2 ${
                        data.colspan === 1 ? "md:col-span-1" : "md:col-span-2"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={data.name}
                          className="block text-sm font-medium text-gray-700"
                        >
                          {data.label}
                        </label>
                      </div>
                      {data.name === "address" ? (
                        <>
                          <input
                            className="outline-0 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                            name={data.name}
                            type={data.type}
                            required={data.required}
                            minLength={data.minLength}
                            maxLength={data.maxLength}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                          <span
                            onClick={(e) => handleLocation(e)}
                            className="text-sm font-bold text-gray-400 hover:text-blue-400 cursor-pointer"
                          >
                            Use Current Location
                          </span>
                        </>
                      ) : (
                        <input
                          className="outline-0 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                          name={data.name}
                          type={data.type}
                          required={data.required}
                          minLength={data.minLength}
                          maxLength={data.maxLength}
                          onChange={data.onchange}
                        />
                      )}
                    </div>
                  )
                )}

                <div className="col-span-2">
                  <Button
                    type={"submit"}
                    className={
                      "w-full bg-green-600 hover:bg-green-700 text-white"
                    }
                  >
                    Register
                  </Button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <a
                  className="font-semibold text-green-400 hover:text-gray-400 underline cursor-pointer"
                  onClick={handleSignIn}
                >
                  Click here to sign in.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Registration;
