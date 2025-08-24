import { useState } from "react";
import Button from "../component/Button";

function Settings() {
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: localStorage.getItem("first_name") || "",
    middle_name: localStorage.getItem("middle_name") || "",
    last_name: localStorage.getItem("last_name") || "",
    mobile: localStorage.getItem("mobile") || "",
    email: localStorage.getItem("email") || "",
    password: "",
  });

  const handleFileChange = (e) => {
    setProfileImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const alertMessage = `
      First Name: ${formData.first_name}
      Middle Name: ${formData.middle_name}
      Last Name: ${formData.last_name}
      Mobile: ${formData.mobile}
      Email: ${formData.email}
      Password: ${formData.password}
      Profile Image: ${profileImage ? profileImage.split("/").pop() : "None"}
    `;
    alert(alertMessage);
    setIsEditing(false);
  };

  const formFields = [
    { label: "First Name", name: "first_name", type: "text", colSpan: 1 },
    { label: "Middle Name", name: "middle_name", type: "text", colSpan: 1 },
    { label: "Last Name", name: "last_name", type: "text", colSpan: 1 },
    { label: "Mobile Number", name: "mobile", type: "text", colSpan: 1 },
    { label: "Email", name: "email", type: "email", colSpan: 2 },
    { label: "Password", name: "password", type: "password", colSpan: 2 },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row justify-center items-start p-6 gap-6 bg-[rgba(0,0,0,0.1)] backdrop-blur-[6px] rounded-lg">
      <div className="flex-1 flex flex-col items-center bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="w-full md:w-80 md:h-80 rounded-full overflow-hidden bg-gray-200 mb-4 shadow-md">
          <img
            src={
              profileImage ||
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
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
        )}
        {profileImage && (
          <p className="mt-2 text-sm text-gray-600 truncate">
            {profileImage.split("/").pop()}
          </p>
        )}
      </div>

      <div className="flex-2 w-full bg-white p-6 rounded-lg shadow-lg overflow-auto">
        <h2 className="font-semibold text-2xl mb-6 border-b pb-2">
          Profile Settings
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 w-full">
          {formFields.map((field, index) => (
            <div
              key={index}
              className={`flex flex-col w-full ${
                field.colSpan === 2 ? "col-span-2" : "col-span-2 lg:col-span-1"
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
                  ${
                    field.name === "password" || field.name === "email"
                      ? ""
                      : "capitalize"
                  }
                `}
                disabled={!isEditing}
                required
              />
            </div>
          ))}

          <Button
            type={isEditing ? "submit" : "button"}
            onClick={() => {
              if (!isEditing) setIsEditing(true);
            }}
            className={`mt-6 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-semibold transition duration-200 col-span-2`}
          >
            {isEditing ? "Save Profile" : "Edit Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
