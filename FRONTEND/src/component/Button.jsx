function Button({ children, onClick, className, type }) {
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      className={`bg-green-600 rounded-sm font-semibold px-4 py-2 hover:bg-green-700 text-white transform-all duration-300 cursor-pointer ${className} `}
    >
      {children}
    </button>
  );
}

export default Button;
