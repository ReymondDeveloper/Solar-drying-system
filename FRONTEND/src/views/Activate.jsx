import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../component/Button";
import Loading from "../component/Loading";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RiCloseLargeLine } from "react-icons/ri";
import Modal from "../component/Modal";

function Activate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const handleRedirect = (e) => {
    e.preventDefault();
    navigate("/sign-in");
  };

  const formField = [
    {
      label: "Name",
      type: "text",
      name: "name",
      required: true,
      colspan: 2,
    },
    {
      label: "User ID",
      type: "text",
      name: "user_id",
      required: true,
      colspan: 2,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { user_id, name } = Object.fromEntries(formData.entries());
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API}/users/activate`,
        {
          params: {
            user_id,
            name,
          },
        }
      );

      res.data.user_id
        ? (localStorage.setItem("user_id", user_id),
          localStorage.setItem("name", name),
          setModalUpdate(true),
          toast.info("Password requirements: 8-16 characters"))
        : toast.error("Invalid User ID.");
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldsUpdate = [
    {
      label: "Name",
      type: "text",
      name: "name",
      disabled: true,
      defaultValue: localStorage.getItem("name"),
      colspan: 2,
    },
    {
      label: "User ID",
      type: "text",
      name: "user_id",
      disabled: true,
      defaultValue: localStorage.getItem("user_id"),
    },
    {
      label: "Password",
      type: "password",
      name: "password",
      minLength: 8,
      maxLength: 16,
      required: true,
    },
  ];

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { password } = Object.fromEntries(formData.entries());

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API}/users/activate`,
        {
          user_id: localStorage.getItem("user_id"),
          password,
        }
      );

      axios.post(`${import.meta.env.VITE_API}/notification`, {
        user: res.data.id,
        context:
          `You've successfully activated your account on ` +
          new Date().toLocaleString(),
      });

      toast.success(res.data.message);

      setTimeout(() => {
        setModalUpdate(false);
        navigate("/sign-in");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong...");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loading />}
      <ToastContainer position="top-center" autoClose={3000} />
      {modalUpdate && (
        <Modal
          setModal={setModalUpdate}
          handleSubmit={handleSubmitUpdate}
          fields={fieldsUpdate}
          title={"Account Activation"}
          button_name={"Update"}
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
                {formField.map((data, index) => (
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
                    <input
                      className="outline-0 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                      name={data.name}
                      type={data.type}
                      required={data.required}
                    />
                  </div>
                ))}

                <div className="col-span-2">
                  <Button
                    type={"submit"}
                    className={
                      "w-full bg-green-600 hover:bg-green-700 text-white"
                    }
                  >
                    Activate
                  </Button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <a
                  className="font-semibold text-green-400 hover:text-gray-400 underline cursor-pointer"
                  onClick={handleRedirect}
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

export default Activate;
