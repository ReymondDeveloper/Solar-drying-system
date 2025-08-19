function Loading() {
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-100 flex flex-col items-center justify-center text-white">
      <svg
        className="animate-spin h-5 w-5 mb-2 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="text-sm">Loading...</p>
    </div>
  );
}

export default Loading