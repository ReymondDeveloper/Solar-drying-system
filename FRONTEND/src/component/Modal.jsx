import { useState, useEffect, useCallback, useRef } from "react";
import Button from "./Button";
import { RiCloseLargeLine, RiQrCodeLine } from "react-icons/ri";
import { FaLocationArrow } from "react-icons/fa";
import { ImFolderUpload } from "react-icons/im";
import api from "../api/api.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import axios from "axios";

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
  const userRole = localStorage.getItem("role");
  const [qrModal, setQrmodal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [chats, setChats] = useState([]);
  const chatRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [chatTextArea, setChatTextArea] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
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
            console.log("Failed to get address. ", err.response?.data?.message),
          );
      },
      (err) => {
        console.log(
          "Permission denied or location error. ",
          err.response?.data?.message,
        );
      },
    );
  };

  const safeNumber = (val) => {
    const cleaned = (val || "0").toString().replace(/[^0-9.-]+/g, "");
    return isNaN(cleaned) ? 0 : Number(cleaned);
  };

  const fetchData = useCallback(async () => {
    let local = localStorage.getItem("modal_reservation_data");
    let data = JSON.parse(local);
    setTransactions(
      Array.isArray(data)
        ? data?.map((res) => ({
            reference_no: res.reference_no,
            amount: res.amount,
            sender: res.sender_number,
            date: res.transaction_date,
          }))
        : [],
    );

    try {
      const result = await api.get(`/transactions/${datas.id}`);

      if (!Array.isArray(result.data)) throw new Error("Invalid data from API");
      const isDifferent =
        JSON.stringify(data) !==
        JSON.stringify(Array.isArray(result.data) ? result.data : []);
      if (isDifferent) {
        setTransactions(
          result.data?.map((res) => ({
            reference_no: res.reference_no,
            amount: res.amount,
            sender: res.sender_number,
            date: res.transaction_date,
          })),
        );
        localStorage.setItem(
          "modal_reservation_data",
          JSON.stringify(result.data),
        );
      }
    } catch (error) {
      console.error(error);
      setTransactions([]);
    }

    local = localStorage.getItem("modal_chat_data");
    data = JSON.parse(local);
    setChats(
      Array.isArray(data)
        ? data?.map((res) => ({
            message: res.message,
            sender: res.sender,
            created_at: res.created_at,
          }))
        : [],
    );

    try {
      const result = await api.get(`/chats?id=${datas.id}`);

      if (!Array.isArray(result.data)) throw new Error("Invalid data from API");
      const isDifferent =
        JSON.stringify(data) !==
        JSON.stringify(Array.isArray(result.data) ? result.data : []);
      if (isDifferent) {
        setChats(
          result.data?.map((res) => ({
            message: res.message,
            sender: res.sender,
            created_at: res.created_at,
          })),
        );
        localStorage.setItem("modal_chat_data", JSON.stringify(result.data));
      }
    } catch (error) {
      console.error(error);
      setChats([]);
    }
  }, [datas]);

  useEffect(() => {
    if (datas) {
      fetchData();

      const interval = setInterval(() => {
        fetchData();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [fetchData, datas]);

  useEffect(() => {
    if (!isHovered && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chats, isHovered]);

  function handleChat() {
    if (chatTextArea.trim() === "") return;
    try {
      api.post("/chats", {
        message: chatTextArea,
        sender: localStorage.getItem("id"),
        reservation_id: datas.id,
      });

      const newChat = {
        message: chatTextArea,
        sender: localStorage.getItem("id"),
        created_at: new Date().toLocaleDateString(),
        reservation_id: datas.id,
      };

      setChats((prev) => [...prev, newChat]);
      localStorage.setItem(
        "modal_chat_data",
        JSON.stringify([...chats, newChat]),
      );
      setChatTextArea("");

      if (userRole === "owner") {
        axios.post(`${import.meta.env.VITE_API}/notification`, {
          user: datas.farmer_id.id,
          context: `A dryer owner message you regarding your reservation at "${datas.dryer_id.dryer_name.toUpperCase()}" dryer on ${new Date().toLocaleDateString()}. Tap to respond.`,
          url: `/home/reservation-history?id=${datas.id}`,
        });
      } else if (userRole === "farmer") {
        axios.post(`${import.meta.env.VITE_API}/notification`, {
          user: datas.owner_id.id,
          context: `A farmer messaged you regarding their reservation at "${datas.dryer_id.dryer_name.toUpperCase()}" dryer on ${new Date().toLocaleDateString()}. Tap to respond.`,
          url: `/home/booking-requests?id=${datas.id}`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  function formatDateLocal(date) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are zero-based
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // function normalizeDate(date) {
  //   if (!(date instanceof Date)) {
  //     date = new Date(date);
  //   }
  //   return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // }

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
              {field.name === "business_permit" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <div className="flex flex-col gap-3">
                    {field.disabled !== true && (
                      <input
                        type={field.type}
                        name={field.name}
                        accept="application/pdf"
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const localPreview = URL.createObjectURL(file);

                          setPreviewUrls((prev) => ({
                            ...prev,
                            [field.name]: localPreview,
                          }));

                          const formData = new FormData();
                          formData.append("file", file);

                          try {
                            const res = await api.post("/upload", formData, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            });

                            const data = await res.data;
                            if (data.url) {
                              setPreviewUrls((prev) => ({
                                ...prev,
                                [field.name]: data.url,
                              }));

                              URL.revokeObjectURL(localPreview);
                            }
                          } catch (err) {
                            console.error("Image upload failed:", err);
                          }
                        }}
                      />
                    )}

                    {previewUrls[field.name] ? (
                      <>
                        <input
                          type="hidden"
                          name={`pdf_${[field.name]}`}
                          value={previewUrls[field.name]}
                        />
                        <div className="flex flex-col gap-2 justify-center border rounded-lg p-4 bg-gray-50">
                          <a
                            href={
                              previewUrls[field.name].startsWith("http") ||
                              previewUrls[field.name].startsWith("blob:")
                                ? previewUrls[field.name]
                                : `${import.meta.env.VITE_API.replace(
                                    "/api",
                                    "",
                                  )}${previewUrls[field.name]}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-green-500 hover:text-green-600"
                          >
                            View in another tab
                          </a>
                          <iframe
                            src={
                              previewUrls[field.name].startsWith("http") ||
                              previewUrls[field.name].startsWith("blob:")
                                ? previewUrls[field.name]
                                : `${import.meta.env.VITE_API.replace(
                                    "/api",
                                    "",
                                  )}${previewUrls[field.name]}`
                            }
                            alt="Preview"
                            className="max-h-[400px] w-auto object-contain rounded-lg shadow-md"
                          />
                        </div>
                      </>
                    ) : field.defaultValue ? (
                      <>
                        <input
                          type="hidden"
                          name={`pdf_${[field.name]}`}
                          value={field.defaultValue}
                        />
                        <div className="flex flex-col gap-2 justify-center border rounded-lg p-4 bg-gray-50">
                          <a
                            href={
                              field.defaultValue.startsWith("http") ||
                              field.defaultValue.startsWith("blob:")
                                ? field.defaultValue
                                : `${import.meta.env.VITE_API.replace("/api", "")}${field.defaultValue}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-green-500 hover:text-green-600"
                          >
                            View in another tab
                          </a>
                          <iframe
                            src={
                              field.defaultValue.startsWith("http") ||
                              field.defaultValue.startsWith("blob:")
                                ? field.defaultValue
                                : `${import.meta.env.VITE_API.replace("/api", "")}${field.defaultValue}`
                            }
                            alt="Preview"
                            className="max-h-[400px] w-auto object-contain rounded-lg shadow-md"
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </>
              ) : field.name === "password" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-0"
                    type={field.type}
                    required={field.required}
                    name={field.name}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                    defaultValue={field.defaultValue || ""}
                    step={field.step}
                    min={field.min}
                    onChange={field.onchange}
                    disabled={field.disabled || false}
                    placeholder={field.placeholder || null}
                  />
                  <div className="flex items-center gap-1 cursor-pointer text-gray-700">
                    <input name="show_password" type="checkbox"
                      onChange={() => {
                        if (document.querySelector('[name="show_password"]').checked) {
                          document.querySelector('[name="password"]').type = "text"
                        } else {
                          document.querySelector('[name="password"]').type = "password"
                        }
                      }} 
                    />
                    <small
                      className="select-none"
                      onClick={() => {
                        (document.querySelector('[name="show_password"]').checked = !document.querySelector('[name="show_password"]').checked)
                        if (document.querySelector('[name="show_password"]').checked) {
                          document.querySelector('[name="password"]').type = "text"
                        } else {
                          document.querySelector('[name="password"]').type = "password"
                        }
                      }}
                    >
                      Show Password
                    </small>
                  </div>
                </>
              ) : field.name === "confirm_password" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-0"
                    type={field.type}
                    required={field.required}
                    name={field.name}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                    defaultValue={field.defaultValue || ""}
                    step={field.step}
                    min={field.min}
                    onChange={field.onchange}
                    disabled={field.disabled || false}
                    placeholder={field.placeholder || null}
                  />
                  <div className="flex items-center gap-1 cursor-pointer text-gray-700">
                    <input name="show_confirm_password" type="checkbox"
                      onChange={() => {
                        if (document.querySelector('[name="show_confirm_password"]').checked) {
                          document.querySelector('[name="confirm_password"]').type = "text"
                        } else {
                          document.querySelector('[name="confirm_password"]').type = "password"
                        }
                      }} 
                    />
                    <small
                      className="select-none"
                      onClick={() => {
                        (document.querySelector('[name="show_confirm_password"]').checked = !document.querySelector('[name="show_confirm_password"]').checked)
                        if (document.querySelector('[name="show_confirm_password"]').checked) {
                          document.querySelector('[name="confirm_password"]').type = "text"
                        } else {
                          document.querySelector('[name="confirm_password"]').type = "password"
                        }
                      }}
                    >
                      Show Confirm Password
                    </small>
                  </div>
                </>
              ) : field.type === "file" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type={field.type}
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

                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                          const res = await api.post("/upload", formData, {
                            headers: {
                              "Content-Type": "multipart/form-data",
                            },
                          });

                          const data = await res.data;
                          if (data.url) {
                            setPreviewUrls((prev) => ({
                              ...prev,
                              [field.name]: data.url,
                            }));

                            URL.revokeObjectURL(localPreview);
                          }
                        } catch (err) {
                          console.error("Image upload failed:", err);
                        }
                      }}
                    />

                    {previewUrls[field.name] ? (
                      <>
                        <input
                          type="hidden"
                          name={`img_${[field.name]}`}
                          value={previewUrls[field.name]}
                        />
                        <div className="flex justify-center border rounded-lg p-4 bg-gray-50">
                          <img
                            src={
                              previewUrls[field.name].startsWith("http") ||
                              previewUrls[field.name].startsWith("blob:")
                                ? previewUrls[field.name]
                                : `${import.meta.env.VITE_API.replace(
                                    "/api",
                                    "",
                                  )}${previewUrls[field.name]}`
                            }
                            alt="Preview"
                            className="max-h-[400px] w-auto object-contain rounded-lg shadow-md"
                          />
                        </div>
                      </>
                    ) : field.defaultValue ? (
                      <>
                        <input
                          type="hidden"
                          name={`img_${[field.name]}`}
                          value={field.defaultValue}
                        />
                        <div className="flex justify-center border rounded-lg p-4 bg-gray-50">
                          <img
                            src={
                              field.defaultValue.startsWith("http") ||
                              field.defaultValue.startsWith("blob:")
                                ? field.defaultValue
                                : `${import.meta.env.VITE_API.replace(
                                    "/api",
                                    "",
                                  )}${field.defaultValue}`
                            }
                            alt="Preview"
                            className="max-h-[400px] w-auto object-contain rounded-lg shadow-md"
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </>
              ) : field.type === "select" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <select
                    name={field.name}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-sm focus:ring-2 focus:ring-green-500 outline-0"
                    defaultValue={field.defaultValue || ""}
                    onChange={(e) => field.onChange && field.onChange(e)}
                    disabled={field.disabled}
                  >
                    {field.options.map((option, idx) => (
                      <option
                        key={idx}
                        value={option.value}
                        className="capitalize"
                      >
                        {option.phrase}
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
              ) : field.name === "date_from" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-0"
                    type={field.type}
                    required={field.required}
                    name={field.name}
                    defaultValue={field.defaultValue || ""}
                    min={field.min}
                    onChange={field.onchange}
                  />
                </>
              ) : field.name === "date_to" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-0"
                    type={field.type}
                    required={field.required}
                    name={field.name}
                    defaultValue={field.defaultValue || ""}
                    min={field.min}
                    onChange={field.onchange}
                  />
                </>
              ) : field.type === "date" ? (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <br />

                  <DatePicker
                    selectsRange
                    startDate={startDate ?? field.startDate}
                    endDate={endDate ?? field.endDate}
                    onChange={(dates) => {
                      const [start, end] = dates;
                      setStartDate(start);
                      field.startDate = start;
                      setEndDate(end);
                      field.endDate = end;
                    }}
                    minDate={field.min ?? null}
                    disabled={field.disabled}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-0"
                    placeholderText="Select a date range"
                  />

                  <input
                    type="hidden"
                    name="date_from"
                    value={startDate ? formatDateLocal(startDate) : field.startDate}
                  />
                  <input
                    type="hidden"
                    name="date_to"
                    value={endDate ? formatDateLocal(endDate) : field.endDate}
                  />
                </>
              ) : (
                <>
                  <label className="text-[rgba(0,100,0,255)] font-bold text-md">
                    {field.label}
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 outline-0"
                    type={field.type}
                    required={field.required}
                    name={field.name}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                    defaultValue={field.defaultValue || ""}
                    step={field.step}
                    min={field.min}
                    onChange={field.onchange}
                    disabled={field.disabled || false}
                    placeholder={field.placeholder || null}
                    max={field.max}
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
                  <div className="mx-auto my-5 text-auto border p-1 bg-white max-w-1/2">
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
                  {"Dryer: "}
                  <span className="capitalize font-bold">
                    {datas.dryer_id.dryer_name}
                  </span>
                </p>
                <p>
                  {"Owner: "}
                  <span className="capitalize font-bold">
                    {datas.owner_id.name}
                  </span>
                </p>
                <p>
                  {"Location: "}
                  <span className="capitalize font-bold">
                    {String(datas.dryer_id.location).includes("Sablayan") ||
                    String(datas.dryer_id.location).includes(
                      "Occidental Mindoro",
                    )
                      ? datas.dryer_id.location
                      : datas.dryer_id.location +
                        ", Sablayan, Occidental Mindoro"}
                  </span>
                </p>
                <p>
                  {"Rate: "}
                  <span className="capitalize font-bold">
                    &#8369;{Number(datas.dryer_id.rate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </p>
                <br />
                <p>
                  {"Reserved by: "}
                  <span className="capitalize font-bold">
                    {datas.farmer_id.name}
                  </span>
                </p>
                <p>
                  {"Reserved on: "}
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
                  {"Status: "}
                  <span className="capitalize font-bold">{datas.status}</span>
                </p>
                {datas.status === "denied" && (
                  <p>
                    {"Reason for denial: "}
                    <span className="capitalize font-bold">
                      {datas.notes ||
                        datas.crop_type_id.notes ||
                        "No reason provided."}
                    </span>
                  </p>
                )}
                {datas.status === "canceled" && (
                  <p>
                    {"Reason for cancelation: "}
                    <span className="capitalize font-bold">
                      {datas.canceled_reason || "No reason provided."}
                    </span>
                  </p>
                )}
                <br />
                <p>
                  {"Payment method: "}
                  <span className="capitalize font-bold">
                    {datas.crop_type_id.payment}
                  </span>
                </p>
                <p>
                  {"Crop type: "}
                  <span className="capitalize font-bold">
                    {datas.crop_type_id.crop_type_name}
                  </span>
                </p>
                <p>
                  {"Quantity (Canvan): "}
                  <span className="capitalize font-bold">
                    {datas.crop_type_id.quantity}
                  </span>
                </p>

                <p>
                  {"Estimated Total Amount: "}
                  <span className="capitalize font-bold">
                    &#8369;{Number(safeNumber(datas.dryer_id.rate) * safeNumber(datas.crop_type_id.quantity)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </p>

                {userRole !== "admin" && (
                  <div className="flex flex-col mt-4">
                    <div className="rounded-t-md bg-green-400 px-5 py-2 text-white">
                      {userRole === "farmer"
                        ? "Chat with Dryer Owner"
                        : "Chat with Farmer"}
                    </div>
                    <div
                      ref={chatRef}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className="p-1 border-x-4 border-green-400 flex flex-col gap-6 h-[150px] overflow-y-auto"
                    >
                      {chats.length > 0 ? (
                        chats.map((chat, index) => (
                          <div
                            className={`flex mt-auto relative ${
                              chat.sender === localStorage.getItem("id")
                                ? "justify-end"
                                : "justify-start"
                            }`}
                            key={index}
                          >
                            <div className="bg-green-200 text-sm font-normal rounded px-5 py-2 max-w-3/4">
                              <span
                                className="italic"
                                style={{ whiteSpace: "pre-line" }}
                              >
                                {chat.message}
                              </span>
                            </div>
                            <span className="absolute bottom-[calc(0%-18px)] text-[10px] text-gray-500 italic px-1">
                              {new Date(chat.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center my-auto italic">
                          Theres no messages to show.
                        </div>
                      )}
                    </div>
                    <div className="bg-green-400 p-1 h-[46px] text-white flex gap-2">
                      <textarea
                        value={chatTextArea}
                        onChange={(e) => setChatTextArea(e.target.value)}
                        className="bg-[rgba(255,255,255,0.9)] flex-grow p-2 text-black resize-none"
                      ></textarea>
                      {userRole === "farmer" &&
                        datas.status !== "denied" &&
                        datas.status !== "pending" && (
                          <span
                            onClick={() => {
                              localStorage.setItem(
                                "amount_of_payment",
                                safeNumber(datas.dryer_id.rate) * safeNumber(datas.crop_type_id.quantity)
                              );
                              setGcashModal(true);
                              setModal(false);
                            }}
                            className="rounded-full p-3 bg-green-600 flex items-center gap-2 hover:bg-green-700 cursor-pointer"
                          >
                            <span className="max-[768px]:hidden">Upload</span>
                            <ImFolderUpload />
                          </span>
                        )}
                      <span
                        onClick={() => handleChat()}
                        className="rounded-full p-3 bg-green-600 flex items-center gap-2 hover:bg-green-700 cursor-pointer"
                      >
                        <span className="max-[768px]:hidden">Send</span>
                        <FaLocationArrow className="rotate-45" />
                      </span>
                    </div>
                  </div>
                )}

                {datas.status !== "denied" && datas.status !== "pending" && (
                  <div className="w-full overflow-x-auto mt-4">
                    <table className="min-w-[700px] w-full">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">Reference No.</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Sender</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map((item, index) => (
                            <tr key={item.id}>
                              <td className="border-b p-2">{index + 1}</td>
                              <td className="border-b p-2">
                                {item.reference_no}
                              </td>
                              <td className="border-b p-2">
                                P {item.amount.toFixed(2)}
                              </td>
                              <td className="border-b p-2">{item.date}</td>
                              <td className="border-b p-2">{item.sender}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="border-b p-2 text-center"
                              colSpan={5}
                            >
                              No transactions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

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
