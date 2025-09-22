import { useState } from "react";
import Button from "./Button";
import { RiCloseLargeLine } from "react-icons/ri";

function Modal({ setModal, handleSubmit, title, button_name, fields }) {
  const [address, setAddress] = useState("");
  const [previewUrls, setPreviewUrls] = useState({});
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
            console.log("Failed to get address. ", err.response?.data?.message)
          );
      },
      (err) => {
        console.log(
          "Permission denied or location error. ",
          err.response?.data?.message
        );
      }
    );
  };
  return (
    <>
      <div
        onClick={() => setModal(false)}
        className="absolute z-1 top-0 left-0 flex items-start justify-center h-full w-full backdrop-blur-[6px]"
      >
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="min-w-[320px] bg-gray-300 gap-5 rounded-lg p-5 flex flex-col justify-between items-start my-auto"
        >
          <div className="w-full flex justify-between items-center">
            <h1 className="font-bold text-2xl text-[rgba(0,100,0,255)] capitalize">
              {title}
            </h1>
            <div
              onClick={() => setModal(false)}
              className="p-3 cursor-pointer rounded-full hover:bg-[rgba(0,0,0,0.2)] transition-all duration-300"
            >
              <RiCloseLargeLine />
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-5">
            {fields?.map((field, index) => (
              <div
                key={index}
                className={`col-span-2 ${
                  field.colspan === 1 ? "md:col-span-1" : "md:col-span-2"
                }`}
              >
                
                {field.name === "image_url" ? (
                  <>
                    <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                      {field.label}
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        name={field.name}
                        accept="image/*"
                        className="bg-gray-200 w-full rounded-md p-2 outline-0"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          const localPreview = URL.createObjectURL(file);
                          setPreviewUrls((prev) => ({ ...prev, [field.name]: localPreview }));

                          const formData = new FormData();
                          formData.append("file", file);

                          try {
                            const res = await fetch(`${import.meta.env.VITE_API}/upload`, {
                              method: "POST",
                              body: formData,
                            });
                            const data = await res.json();
                            if (data.url) {
                              setPreviewUrls((prev) => ({ ...prev, [field.name]: data.url }));
                            }
                          } catch (err) {
                            console.error("Image upload failed:", err);
                          }
                        }}
                      />
                        {(previewUrls[field.name] || field.defaultValue) && (
                          <img
                            src={
                              (previewUrls[field.name] || field.defaultValue).startsWith("http")
                                ? (previewUrls[field.name] || field.defaultValue)
                                : `${import.meta.env.VITE_API.replace("/api", "")}${previewUrls[field.name] || field.defaultValue}`
                            }
                            alt="Preview"
                            className="mt-2 w-32 h-32 object-cover rounded-md border"
                          />
                        )}
                    </div>
                  </>
                ) : field.type === "select" ? (
                  <>
                    <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                      {field.label}
                    </label>
                    <div className="bg-gray-200 w-full rounded-md p-2">
                      <div
                        className={`max-h-48 overflow-y-auto rounded-md ${
                          field.options.length >= 5 ? "scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" : ""
                        }`}
                      >
                        <select
                          name={field.name}
                          className="outline-0 w-full text-[rgba(0,100,0,255)] capitalize bg-gray-200"
                          defaultValue={field.defaultValue || ""}
                          disabled={field.disabled}
                        >
                          {field.options.map((option, idx) => (
                            <option
                              key={idx}
                              value={option.value}
                              className="bg-gray-200 capitalize"
                            >
                              {option.value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : field.name === "address" ? (
                  <>
                    <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                      {field.label}
                    </label>
                    <input
                      className="bg-gray-200 w-full rounded-md p-2 outline-0"
                      type={field.type}
                      required={field.required}
                      name={field.name}
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
                ) : field.name === "id" ? (
                  <input
                    name={field.name}
                    type={field.type} 
                    value={field.value}
                  />
                ) : (
                  <>
                    <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                      {field.label}
                    </label>
                    <input
                      className="bg-gray-200 w-full rounded-md p-2 outline-0 capitalize"
                      type={field.type}
                      required={field.required}
                      name={field.name}
                      minLength={field.minLength}
                      maxLength={field.maxLength}
                      defaultValue={field.defaultValue || ""}
                      disabled={field.disabled}
                      step={field.step}
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="w-full flex gap-3 justify-end items-center mt-3">
            <Button
              type={"button"}
              className={"hover:bg-[rgba(0,0,0,0.2)] text-black"}
              onClick={() => setModal(false)}
            >
              Cancel
            </Button>
            <Button
              type={"submit"}
              className={"bg-green-600 hover:bg-green-700 text-white"}
            >
              {button_name}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Modal;
