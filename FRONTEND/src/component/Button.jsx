function Button({ children, onClick, className, type }) {
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      className={`rounded-sm font-semibold px-4 py-2 transform-all duration-300 cursor-pointer ${className} `}
    >
      {children}
    </button>
  );
}

export default Button;
