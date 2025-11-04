import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../component/Button";
import Loading from "../component/Loading";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OTP from "../component/Otp";
import Modal from "../component/Modal";

function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(false);
  const [otpVerify, setOtpVerify] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalVerify, setModalVerify] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/registration");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { email, password, selected_role } = Object.fromEntries(formData.entries());

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/users/login`,
        {
          email: email.toLowerCase(),
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { user = {}, token, message } = res.data;
      const {
        id,
        role,
        address,
        full_name,
        first_name,
        middle_name,
        last_name,
        profile_image,
        mobile_number,
      } = user;
      if (message === "Account is not yet verified.") {
        toast.error(message);
        setTimeout(() => {
          localStorage.setItem("email", email.toLowerCase());
          setOtp(true);
        }, 2000);
      } else {
        if (role !== selected_role) {
          toast.error(`Access denied: You are not authorized as ${selected_role}.`);
          setLoading(false);
          return;
        }
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("full_name", full_name);
        localStorage.setItem("first_name", first_name);
        localStorage.setItem("middle_name", middle_name);
        localStorage.setItem("last_name", last_name);
        localStorage.setItem("email", email.toLowerCase());
        localStorage.setItem("address", address);
        localStorage.setItem("id", id);
        profile_image && localStorage.setItem("profile_image", profile_image);
        mobile_number && localStorage.setItem("mobile_number", mobile_number);

        toast.success(res.data.message);
        setTimeout(() => {
          if (role === "admin") navigate("/home");
          else if (role === "owner") navigate("/home");
          else if (role === "farmer") navigate("/home");
          else navigate("/home");
        }, 2000);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formField = [
    {
      label: "Email address",
      type: "email",
      required: true,
      name: "email",
      defaultValue: localStorage.getItem("email"),
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
          { password, email: localStorage.getItem("email") }
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
      <div className="h-full bg-gray-200 flex flex-col gap-1">
        <div className="flex-grow flex flex-col justify-center bg-gradient-to-t from-[rgba(0,100,0,255)] via-green-600 to-[rgba(0,100,0,255)]">
          <div className="mx-auto min-w-[320px]">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="role">
                    Role
                  </label>
                  <div className="mt-2">
                    <select
                      name="selected_role"
                      required
                      className="outline-0 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                      <option value="farmer">Farmer</option>
                    </select>
                  </div>
                </div>

                <Button
                  type={`submit`}
                  className={`w-full bg-green-600 hover:bg-green-700 text-white`}
                >
                  Sign In
                </Button>

                <Button
                  type={`button`}
                  onClick={() => setModalVerify(true)}
                  className={`w-full hover:bg-[rgba(0,0,0,0.3)] hover:text-white text-green-400`}
                >
                  Forgot password?
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                Don't have an account yet?{" "}
                <a
                  className="font-semibold text-green-400 hover:text-gray-400 underline cursor-pointer"
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
