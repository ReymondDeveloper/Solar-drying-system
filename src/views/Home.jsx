import Button from '../component/Button'
function Home() {
    return(
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="bg-green-900 text-white p-5 pb-4">
                <h1 className="text-5xl md:text-center abril-fatface">
                Solar-Drying Reservation System
                </h1>
                <div className="flex gap-3 justify-end my-3">
                <Button>
                    Register
                </Button>
                <Button>
                    Sign In
                </Button>
                </div>
                <div className="relative">
                <span className="content-[''] absolute w-[100dvw] -left-5 bg-green-500 h-[2px]"></span>
                </div>
            </div>

            <img
                className="object-cover w-full h-full flex-grow rotate-y-180"
                src="https://images.unsplash.com/photo-1594771804886-a933bb2d609b?q=80&w=1182&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
        </div>
    )
}

export default Home