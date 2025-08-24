function Reports() {
  return (
    <div className="bg-[rgba(0,0,0,0.1)] backdrop-blue-[6px] w-full rounded-md p-5 flex flex-col gap-5">
      <div className="flex justify-center gap-5">
        <div className="rounded-md overflow-hidden flex bg-green-400 text-white font-bold">
          <span className="p-5">Registered User</span>
          <div className="bg-green-500 p-5">100</div>
        </div>

        <div className="rounded-md overflow-hidden flex bg-blue-400 text-white font-bold">
          <span className="p-5">Verified Solar Dryer Owner</span>
          <div className="bg-blue-500 p-5">50</div>
        </div>

        <div className="rounded-md overflow-hidden flex bg-red-400 text-white font-bold">
          <span className="p-5">Registered Farmer</span>
          <div className="bg-red-500 p-5">25</div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
