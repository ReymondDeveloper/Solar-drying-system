import Button from "./Button";

function Notification() {
  return (
    <div className="bg-gray-200 rounded-md p-5 w-full relative">
      <div className="absolute ms-5 left-0 top-1/2 -translate-y-1/2 bg-red-600 rounded-full w-2 h-2"></div>
      <div className="italic ms-5">The system found no notifications.</div>
    </div>
  );
}

function NotificationModal({ setNotificationModal }) {
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
