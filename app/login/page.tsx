import LoginForm from "../components/LoginForm";


const LoginScreen = () => {
    return (
        <div className="min-h-[89vh] w-full flex flex-row items-center justify-center py-[1rem]">
            
            <LoginForm/>
            <div className="text-black flex flex-col space-y-[10px] ">
                <div className="bg-gray-300 p-6 rounded-lg ml-10">
                    <p>Patient</p>
                    <p>Email: test@gmail.com</p>
                    <p>Password: test@123</p>
                </div>
                <div className="bg-gray-300 p-6 rounded-lg ml-10">
                    <p>Doctor</p>
                    <p>Email: dr.john.smith@hospital.com</p>
                    <p>Password: SecurePassword123</p>
                </div>
                <div className="bg-gray-300 p-6 rounded-lg ml-10">
                    <p>Admin</p>
                    <p>Email: admin@medicare.com</p>
                    <p>Password: admin123</p>
                </div>
                
            </div>
        </div>
    )
}

export default LoginScreen;