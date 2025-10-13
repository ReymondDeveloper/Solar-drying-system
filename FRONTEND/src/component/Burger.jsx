function Burger({ button, setButton }) {
  return (
    <>
      <button
        type="button"
        onClick={() => setButton(!button)}
        className="w-[25px] h-[25px] left-0"
      >
        <div
          className={`
                    flex flex-col transistion-all
                    ${button ? "-rotate-135 duration-1000" : "duration-300"}
                    `}
        >
          <span
            className={`
                    content-[''] h-[2px] w-[25px] bg-white transition-all
                    ${button ? "rotate-45 duration-800" : "duration-1000"}
                    `}
          ></span>
          <span
            className={`
                    content-[''] h-[2px] w-[25px] bg-white mx-auto! my-2!
                    ${button ? "hidden" : ""}
                    `}
          ></span>
          <span
            className={`
                    content-[''] h-[2px] w-[25px] bg-white transition-all
                    ${button ? "-rotate-45 duration-300" : "duration-800"}
                    `}
          ></span>
        </div>
      </button>
    </>
  );
}
export default Burger;
