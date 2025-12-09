import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../component/Button";
import Loading from "../component/Loading";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OTP from "../component/Otp";
import Modal from "../component/Modal";
import { RiCloseLargeLine } from "react-icons/ri";

function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(false);
  const [otpVerify, setOtpVerify] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalVerify, setModalVerify] = useState(false);

  const handleRedirect = (e) => {
    e.preventDefault();
    navigate("/activate");
  };

  const formField = [
    {
      label: "User ID",
      type: "text",
      required: true,
      name: "user_id",
      defaultValue: localStorage.getItem("user_id"),
    },
    {
      label: "Password",
      type: "password",
      minLength: 8,
      maxLength: 16,
      required: true,
      name: "password",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { user_id, password } = Object.fromEntries(formData.entries());

    try {
      const res = await axios.post(`${import.meta.env.VITE_API}/users/login`, {
        user_id,
        password,
      });

      const { user = {}, token, message } = res.data;
      if (message === "User ID isn't activated yet.") {
        toast.info(message);
        setTimeout(() => {
          navigate("/activate");
        }, 2000);
      } else {
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("name", user.name);
        localStorage.setItem("address", user.address);
        localStorage.setItem("id", user.id);
        user.profile_image &&
          localStorage.setItem("profile_image", user.profile_image);
        user.mobile_number &&
          localStorage.setItem("mobile_number", user.mobile_number);
        toast.success(res.data.message);
        setTimeout(() => {
          if (localStorage.getItem("redirect")) {
            navigate(localStorage.getItem("redirect"));
            localStorage.removeItem("redirect");
          } else {
            navigate("/home");
          }
        }, 2000);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fieldsVerify = [
    {
      label: "Email",
      type: "email",
      required: true,
      name: "email",
      colspan: 2,
    },
  ];

  const handleSubmitVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      const { email } = data;
      const res = await axios.post(`${import.meta.env.VITE_API}/users/verify`, {
        email,
      });
      toast.success(res.data.message);
      setModalVerify(false);
      setTimeout(() => {
        localStorage.setItem("email", email);
        setOtpVerify(true);
      }, 2000);
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldsEdit = [
    {
      label: "Password",
      type: "password",
      minLength: 8,
      maxLength: 16,
      placeholder: "Enter 8-16 characters",
      required: true,
      name: "password",
    },
    {
      label: "Confirm Password",
      type: "password",
      minLength: 8,
      maxLength: 16,
      placeholder: "Enter 8-16 characters",
      required: true,
      name: "confirm_password",
    },
  ];

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      const { password, confirm_password } = data;

      if (password === confirm_password) {
        const res = await axios.put(
          `${import.meta.env.VITE_API}/users/update`,
          { password, email: localStorage.getItem("email") },
        );

        toast.success(res.data.message);
        setTimeout(() => {
          setModalEdit(false);
        }, 2000);
      } else {
        toast.error("Password and Confirm Password doesn’t match.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {loading && <Loading />}
      <ToastContainer position="top-center" autoClose={3000} />
      {otp && (
        <OTP
          setOtp={setOtp}
          onVerified={() => setOtp(false)}
          loading={loading}
          setLoading={setLoading}
        />
      )}
      {modalVerify && (
        <Modal
          setModal={setModalVerify}
          handleSubmit={handleSubmitVerify}
          fields={fieldsVerify}
          title={"Email Verification"}
          button_name={"Confirm Email"}
        />
      )}
      {modalEdit && (
        <Modal
          setModal={setModalEdit}
          handleSubmit={handleSubmitEdit}
          fields={fieldsEdit}
          title={"Forgot Password"}
          button_name={"Update Password"}
        />
      )}
      {otpVerify && (
        <OTP
          setOtp={setOtpVerify}
          onVerified={() => (setOtpVerify(false), setModalEdit(true))}
          loading={loading}
          setLoading={setLoading}
        />
      )}
      <div className="h-full flex">
        <div className="flex-grow bg-[url(/landing_page.avif)] bg-cover">
          <div className="w-full h-dvh backdrop-blur-sm backdrop-brightness-75 flex flex-col justify-center">
            <div className="mx-auto min-w-[320px]">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <NavLink to={"/"} className="flex justify-end mb-4">
                  <div className="hover:bg-gray-200 rounded-full p-2">
                    <RiCloseLargeLine size={22} />
                  </div>
                </NavLink>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {formField.map((field, index) => (
                    <div key={index}>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor={field.name}
                      >
                        {field.label}
                      </label>
                      <div className="mt-2">
                        <input
                          className="outline-0 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                          type={field.type}
                          name={field.name}
                          required={field.required}
                          defaultValue={field.defaultValue}
                          minLength={field.minLength}
                          maxLength={field.maxLength}
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

                  {/* <Button
                    type={`button`}
                    onClick={() => setModalVerify(true)}
                    className={`w-full hover:bg-[rgba(0,0,0,0.3)] hover:text-white text-green-400`}
                  >
                    Forgot password?
                  </Button> */}
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                  Don't have a password yet?{" "}
                  <a
                    className="font-semibold text-green-400 hover:text-gray-400 underline cursor-pointer"
                    onClick={handleRedirect}
                  >
                    Click here to activate
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;
