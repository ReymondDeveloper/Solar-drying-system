import Button from "./Button";
import api from "../api/api";
import { useState, useEffect, useCallback } from "react";

function Notification() {
  return (
    <div className="bg-gray-200 rounded-md p-5 w-full relative hover:opacity-[75%] cursor-pointer">
      <div className="absolute ms-5 left-0 top-1/2 -translate-y-1/2 bg-red-600 rounded-full w-2 h-2"></div>
      <div className="italic ms-5 text-sm">The system found no notifications.</div>
    </div>
  );
}

function NotificationModal({ setNotificationModal }) {
  const [data, setData] = useState([]);
  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("notification_data");
    const data = JSON.parse(local);
    setData(Array.isArray(data) ? data : []);

    try {
      const result = await api.get(
        "/dryers/owned",
        {
          user: {
            id: localStorage.getItem("id"),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!Array.isArray(result.data)) throw new Error("Invalid data from API");
      const isDifferent =
        JSON.stringify(data) !==
        JSON.stringify(Array.isArray(result.data) ? result.data : []);
      if (isDifferent) {
        setData(
          result.data?.map((res) => ({
            ...res,
            created_at: res.created_at
              ? new Date(res.created_at).toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            action: (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => handleEdit(res)}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => navigate("/home/create-reservation/" + res.id)}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  View
                </Button>
              </div>
            ),
          }))
        );
        localStorage.setItem(
          "dryer_information_data",
          JSON.stringify(result.data)
        );
      }
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);
  return (
    <>
      <div
        onClick={() => setNotificationModal(false)}
        className="absolute z-1 top-0 left-0 flex items-start justify-end h-[calc(100dvh-56px)] w-full pt-[56px] pe-5"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[320px] max-h-[calc(100dvh-56px)] bg-[rgba(0,0,0,0.1)] backdrop-blur-[6px] rounded-b-md rounded-tl-md p-5 overflow-y-auto"
        >
          <div className="bg-gray-300 p-5 rounded-md flex flex-col gap-2 justify-between items-start">
            <Notification />
            <Notification />
            <Notification />
            <Notification />
            <Notification />
            <Notification />
            <Notification />
            <Notification />
            <Notification />
            <Notification />
            <Notification />
            <Button
              className={"w-full bg-green-600 hover:bg-green-700 text-white"}
            >
              Mark all as read
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationModal;
