import { useState } from "react";
import Button from "../component/Button";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Settings() {
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: localStorage.getItem("first_name") || "",
    middle_name: localStorage.getItem("middle_name") || "",
    last_name: localStorage.getItem("last_name") || "",
    mobile_number: localStorage.getItem("mobile_number") || "",
    email: localStorage.getItem("email") || "",
    password: localStorage.getItem("password") || "********",
  });

  const navigate = useNavigate();  
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();  
    navigate("/"); 
    toast.success("Successfully logged out!");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile_number") {
      let newValue = value.replace(/\D/g, "");

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

      setFormData((prev) => ({ ...prev, [name]: newValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mobileRegex = /^\+63\d{10}$/;
    if (!mobileRegex.test(formData.mobile_number)) {
      toast.error("Invalid mobile number. Format must be 11 digits.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const base = import.meta.env.VITE_API;

      const formDataToSend = new FormData();
      formDataToSend.append("first_name", formData.first_name);
      formDataToSend.append("middle_name", formData.middle_name);
      formDataToSend.append("last_name", formData.last_name);
      formDataToSend.append("mobile_number", formData.mobile_number);
      formDataToSend.append("email", formData.email);

      if (profileImage) {
        formDataToSend.append("file", profileImage);
      }

      const res = await axios.put(
        `${base}/users/update-profile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      localStorage.setItem("first_name", formData.first_name);
      localStorage.setItem("middle_name", formData.middle_name);
      localStorage.setItem("last_name", formData.last_name);
      localStorage.setItem("mobile_number", formData.mobile_number);
      localStorage.setItem("email", formData.email);
      if (res.data.profile_image) {
        localStorage.setItem("profile_image", res.data.profile_image);
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  };

  // Define form fields
  const formFields = [
    {
      label: "First Name",
      name: "first_name",
      type: "text",
      colSpan: 1,
      required: true,
    },
    {
      label: "Middle Name",
      name: "middle_name",
      type: "text",
      colSpan: 1,
      required: false,
    },
    {
      label: "Last Name",
      name: "last_name",
      type: "text",
      colSpan: 1,
      required: true,
    },
    {
      label: "Mobile Number",
      name: "mobile_number",
      type: "text",
      colSpan: 1,
      required: true,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      colSpan: 2,
      required: true,
    },
  ];

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full flex flex-col md:flex-row justify-center items-start p-6 gap-6 bg-[rgba(0,0,0,0.1)] backdrop-blur-[6px] rounded-lg">
        <div className="flex-1 flex flex-col items-center bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="w-full md:w-80 md:h-80 rounded-full overflow-hidden bg-gray-200 mb-4 shadow-md">
            <img
              src={
                profileImage
                  ? URL.createObjectURL(profileImage)
                  : localStorage.getItem("profile_image") ||
                    "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="font-semibold text-xl mb-1 capitalize">
            {localStorage.getItem("full_name")}
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            {localStorage.getItem("email")}
          </p>

          {isEditing && (
            <label className="mt-2 w-full max-w-xs cursor-pointer bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-center transition duration-200">
              Choose File
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex-2 w-full bg-white p-6 rounded-lg shadow-lg overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-2xl border-b pb-2">Profile Settings</h2>
            <Button
              onClick={handleLogout}  // Add this onClick to trigger logout
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-lg"
            >
              Logout
            </Button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-4 w-full"
          >
            {formFields.map((field, index) => (
              <div
                key={index}
                className={`flex flex-col w-full ${
                  field.colSpan === 2
                    ? "col-span-2"
                    : "col-span-2 lg:col-span-1"
                }`}
              >
                <label className="text-gray-700 mb-1 w-full">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.label}
                  className={`border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-600 
                    ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
                    ${field.name === "email" ? "" : "capitalize"}
                  `}
                  disabled={!isEditing}
                  required={field.required}
                />
              </div>
            ))}

            <Button
              type={isEditing ? "submit" : "button"}
              onClick={() => !isEditing && setIsEditing(true)}
              className="mt-6 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-semibold transition duration-200 col-span-2"
            >
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Settings;
