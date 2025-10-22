import { useState } from "react";
import Button from "./Button";
import { RiCloseLargeLine, RiQrCodeLine } from "react-icons/ri";
import { FaLocationArrow } from "react-icons/fa";
import { ImFolderUpload } from "react-icons/im";

function Modal({
  setModal,
  handleSubmit,
  title,
  button_name,
  fields,
  datas,
  setGcashModal,
}) {
  const [address, setAddress] = useState("");
  const [previewUrls, setPreviewUrls] = useState({});
  const [mainImage, setMainImage] = useState("");
  const userRole = localStorage.getItem("role");
  const [qrModal, setQrmodal] = useState(false);

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

  const safeNumber = (val) => {
    const cleaned = (val || "0").toString().replace(/[^0-9.-]+/g, "");
    return isNaN(cleaned) ? 0 : Number(cleaned);
  };

  return (
    <div
      onClick={() => setModal(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-6 md:p-10 space-y-6"
      >
        <div className="flex justify-between items-center border-b pb-3">
          <h1 className="text-2xl font-bold text-green-700">{title}</h1>
          <button
            type="button"
            onClick={() => setModal(false)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <RiCloseLargeLine size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields?.map((field, index) => (
            <div
              key={index}
              className={`col-span-1 ${
                field.colspan === 2 ? "md:col-span-2" : ""
              }`}
            >
              {field.name === "payment" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.name === "payment" && userRole === "farmer"
                      ? "Paraan ng Pagbabayad"
                      : field.label}
                  </label>
                  <select
                    name={field.name}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"
                    defaultValue={field.defaultValue || ""}
                    required={field.required}
                    disabled={field.disabled}
                  >
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                  </select>
                </>
              ) : field.name === "quantity" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {userRole === "farmer"
                      ? "Dami (Canvans)"
                      : "Quantity (Canvans)"}
                  </label>
                  <input
                    type="number"
                    name={field.name}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"
                    defaultValue={field.defaultValue || ""}
                    required={field.required}
                    disabled={field.disabled}
                    min={0}
                    step={1}
                  />
                </>
              ) : field.name === "crop_type" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {userRole === "farmer" ? "Uri ng pananim" : field.label}
                  </label>
                  <select
                    name={field.name}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-sm focus:ring-2 focus:ring-green-500"
                    defaultValue={field.defaultValue || ""}
                    disabled={field.disabled}
                    required={field.required}
                  >
                    {(() => {
                      if (userRole === "farmer") {
                        return (
                          <>
                            <option value="" disabled>
                              {userRole === "farmer"
                                ? "Pumili ng uri ng pananim"
                                : field.label}
                            </option>
                            <option value="mais">Mais</option>
                            <option value="rice">Palay</option>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <option value="" disabled>
                              Select crop type
                            </option>
                            <option value="corn">Corn</option>
                            <option value="rice">Rice</option>
                          </>
                        );
                      }
                    })()}
                  </select>
                </>
              ) : field.name === "image_url" ? (
                <>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="file"
                      name={field.name}
                      accept="image/*"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const localPreview = URL.createObjectURL(file);
                        setPreviewUrls((prev) => ({
                          ...prev,
                          [field.name]: localPreview,
                        }));
                        setMainImage(localPreview);

                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                          const res = await fetch(
                            `${import.meta.env.VITE_API}/upload`,
                            {
                              method: "POST",
                              body: formData,
                            }
                          );
                          const data = await res.json();
                          if (data.url) {
                            setPreviewUrls((prev) => ({
                              ...prev,
                              [field.name]: data.url,
                            }));
                            setMainImage(data.url);
                          }
                        } catch (err) {
                          console.error("Image upload failed:", err);
                        }
                      }}
                    />
                  </div>
                </>
              ) : field.type === "select" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <select
                    name={field.name}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-sm focus:ring-2 focus:ring-green-500"
                    defaultValue={field.defaultValue || ""}
                    onChange={(e) => field.onChange && field.onChange(e)}
                  >
                    {field.options.map((option, idx) => (
                      <option
                        key={idx}
                        value={option.value}
                        className="capitalize"
                      >
                        {option.value}
                      </option>
                    ))}
                  </select>
                </>
              ) : field.name === "address" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"
                      type={field.type}
                      required={field.required}
                      name={field.name}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <span
                      onClick={handleLocation}
                      className="text-xs font-semibold text-blue-500 hover:underline cursor-pointer"
                    >
                      Use Current Location
                    </span>
                  </div>
                </>
              ) : field.name === "id" ? (
                <input
                  name={field.name}
                  type={field.type}
                  value={field.value}
                />
              ) : field.type === "textarea" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    disabled={field.disabled}
                    defaultValue={field.defaultValue || ""}
                    autoFocus={field.name === "notes"}
                    className="w-full h-32 border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-green-500"
                  />
                </>
              ) : (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"
                    type={field.type}
                    required={field.required}
                    name={field.name}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                    defaultValue={field.defaultValue || ""}
                    step={field.step}
                  />
                </>
              )}
            </div>
          ))}

          {datas ? (
            <div className="col-span-1 md:col-span-2">
              <div className="flex flex-col text-sm">
                {userRole === "farmer" && (
                  <div
                    className="ms-auto bg-[rgba(0,0,0,0.1)] hover:bg-[rgba(0,0,0,0.2)] p-3 rounded-full relative cursor-pointer"
                    title="Gcash QR Code"
                    onClick={() => setQrmodal((prev) => !prev)}
                  >
                    <RiQrCodeLine />
                  </div>
                )}

                {qrModal && (
                  <div className="mx-auto text-auto border p-1 bg-white max-w-1/2">
                    <img
                      src={
                        datas.dryer_id.qr_code !== undefined &&
                        datas.dryer_id.qr_code !== null
                          ? datas.dryer_id.qr_code.startsWith("http") ||
                            datas.dryer_id.qr_code.startsWith("blob:")
                            ? datas.dryer_id.qr_code
                            : `${import.meta.env.VITE_API.replace("/api", "")}${
                                datas.dryer_id.qr_code
                              }`
                          : null
                      }
                      alt="Preview"
                      className="max-h-[400px] w-auto object-contain"
                    />
                  </div>
                )}

                <p>
                  {userRole === "farmer" ? "Patuyuan: " : "Dryer: "}
                  <span className="capitalize font-bold">
                    {datas.dryer_id.dryer_name}
                  </span>
                </p>
                <p>
                  {userRole === "farmer" ? "Lokasyon: " : "Location: "}
                  <span className="capitalize font-bold">
                    {String(datas.dryer_id.location).includes("Sablayan") ||
                    String(datas.dryer_id.location).includes(
                      "Occidental Mindoro"
                    )
                      ? datas.dryer_id.location
                      : datas.dryer_id.location +
                        ", Sablayan, Occidental Mindoro"}
                  </span>
                </p>
                <p>
                  {userRole === "farmer" ? "Tasa: " : "Rate: "}
                  <span className="capitalize font-bold">
                    {datas.dryer_id.rate}
                  </span>
                </p>
                <br />
                <p>
                  {userRole === "farmer" ? "Nireserba ni: " : "Reserved by: "}
                  <span className="capitalize font-bold">
                    {datas.farmer_id.first_name}
                  </span>
                </p>
                <p>
                  {userRole === "farmer" ? "Nireserba nang: " : "Reserved on: "}
                  <span className="capitalize font-bold">
                    {new Date(datas.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </p>
                <p>
                  {userRole === "farmer" ? "Katayuan: " : "Status: "}
                  <span className="capitalize font-bold">{datas.status}</span>
                </p>
                {datas.status === "denied" && (
                  <p>
                    {userRole === "farmer"
                      ? "Rason sa pag tangi: "
                      : "Reason for denial: "}
                    <span className="capitalize font-bold">
                      {datas.notes ||
                        datas.crop_type_id.notes ||
                        "No notes provided."}
                    </span>
                  </p>
                )}
                <br />
                <p>
                  {userRole === "farmer"
                    ? "Paraan ng pag babayad: "
                    : "Payment method: "}
                  <span className="capitalize font-bold">
                    {datas.crop_type_id.payment}
                  </span>
                </p>
                <p>
                  {userRole === "farmer" ? "Uri ng pananim: " : "Crop type: "}
                  <span className="capitalize font-bold">
                    {datas.crop_type_id.crop_type_name}
                  </span>
                </p>
                <p>
                  {userRole === "farmer" ? "Dami: " : "Quantity (Canvans): "}
                  <span className="capitalize font-bold">
                    {datas.crop_type_id.quantity}
                  </span>
                </p>

                <p>
                  {userRole === "farmer" ? "Kabuoan: " : "Total: "}
                  <span className="capitalize font-bold">
                    {safeNumber(datas.dryer_id.rate) *
                      safeNumber(datas.crop_type_id.quantity)}
                  </span>
                </p>
                <div className="mt-4 flex flex-col">
                  <div className="rounded-t-md bg-green-400 px-5 py-2 text-white">
                    {userRole === "farmer"
                      ? "Makipag-usap sa Dryer Owner"
                      : "Chat with Farmer"}
                  </div>
                  <div className="px-1 py-5 border-x-4 border-green-400 flex flex-col gap-1">
                    <div className="flex">
                      <div className="bg-green-200 text-sm font-normal rounded px-5 py-2 max-w-3/4">
                        <span className="italic">Sample</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-green-200 text-sm font-normal rounded px-5 py-2 max-w-3/4">
                        <span className="italic">Sample</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-400 p-1 h-[46px] text-white flex gap-2">
                    <textarea className="bg-[rgba(255,255,255,0.9)] flex-grow p-2 text-black resize-none"></textarea>
                    {userRole === "farmer" && (
                      <span
                        onClick={() => {
                          setGcashModal(true);
                          setModal(false);
                        }}
                        className="rounded-full p-3 bg-green-600 flex items-center gap-2 hover:bg-green-700 cursor-pointer"
                      >
                        <span className="max-[768px]:hidden">
                          {userRole === "farmer" ? "I-upload" : "Upload"}
                        </span>
                        <ImFolderUpload />
                      </span>
                    )}
                    <span className="rounded-full p-3 bg-green-600 flex items-center gap-2 hover:bg-green-700 cursor-pointer">
                      <span className="max-[768px]:hidden">
                        {userRole === "farmer" ? "Ipadala" : "Send"}
                      </span>
                      <FaLocationArrow className="rotate-45" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {mainImage && (
          <div className="flex justify-center border rounded-lg p-4 bg-gray-50">
            <img
              src={
                mainImage.startsWith("http") || mainImage.startsWith("blob:")
                  ? mainImage
                  : `${import.meta.env.VITE_API.replace(
                      "/api",
                      ""
                    )}${mainImage}`
              }
              alt="Preview"
              className="max-h-[400px] w-auto object-contain rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            onClick={() => setModal(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {button_name}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Modal;
