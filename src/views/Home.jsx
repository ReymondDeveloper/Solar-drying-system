function Home() {
    return(
        <>
            <div className="h-screen bg-green-900 text-white p-5">
                <h1 className="text-5xl md:text-center">Solar-Drying Reservation System</h1>
                <div className="flex gap-3 justify-end my-3">
                    <button className="bg-green-600 rounded-sm font-semibold px-4 py-2">
                        Register
                    </button>

                    <button className="bg-green-600 rounded-sm font-semibold px-4 py-2">
                        Sign In
                    </button>
                </div>
                
            </div>
        </>
    )
}

export default Home