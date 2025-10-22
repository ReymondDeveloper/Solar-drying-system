import Button from "./Button";
import api from "../api/api";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function Notification({ index, item, setNotificationModal }) {
  const navigate = useNavigate();
  function handleClick() {
    item.seen === false &&
      api.put(`${import.meta.env.VITE_API}/notification/${item.id}`);

    item.url && navigate(item.url);

    item.url && setNotificationModal(false);
  }
  return (
    <div
      key={index}
      className="bg-gray-200 rounded-md p-5 w-full relative hover:opacity-[75%] cursor-pointer"
      onClick={() => handleClick()}
    >
      {item.seen === false && (
        <div className="absolute ms-5 left-0 top-1/2 -translate-y-1/2 bg-red-600 rounded-full w-2 h-2"></div>
      )}
      <div className="italic ms-5 text-sm">{item.context}</div>
    </div>
  );
}

function NotificationModal({ setNotificationModal }) {
  const [data, setData] = useState([]);
  const fetchData = useCallback(async () => {
    const local = localStorage.getItem("notification_data");
    const data = JSON.parse(local);
    setData(data ? data : []);

    try {
      const result = await api.get(`${import.meta.env.VITE_API}/notification`, {
        user: localStorage.getItem("id"),
      });

      if (!result.data) throw new Error("Invalid data from API");
      const isDifferent =
        JSON.stringify(data) !== JSON.stringify(result.data ? result.data : []);
      if (isDifferent) {
        setData(result.data);
        localStorage.setItem("notification_data", JSON.stringify(result.data));
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

  function handleClick() {
    data.forEach((item) => {
      item.seen === false && api.put(`/notification/${item.id}`);
    });
  }

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
            {data.length > 0 ? (
              data.map((item, index) => (
                <Notification
                  key={index}
                  item={item}
                  setNotificationModal={setNotificationModal}
                />
              ))
            ) : (
              <div className="bg-gray-200 rounded-md p-5 w-full relative hover:opacity-[75%] cursor-pointer">
                <div className="italic ms-5 text-sm">
                  The system found no notifications.
                </div>
              </div>
            )}
            <Button
              className={"w-full bg-green-600 hover:bg-green-700 text-white"}
              onClick={() => handleClick()}
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
