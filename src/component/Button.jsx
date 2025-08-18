function Button({ children, onclick }) {
    return(
        <button type="button" onclick={onclick} className="bg-green-600 rounded-sm font-semibold px-4 py-2 hover:bg-green-700 transform-all duration-300">
            {children}
        </button>
    )
}

export default Button