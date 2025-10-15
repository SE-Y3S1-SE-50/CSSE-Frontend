import LoginForm from "../components/LoginForm";


const LoginScreen = () => {
    return (
        <div className="min-h-[89vh] w-full flex flex-col items-center justify-center py-[1rem]">
            <h1>Login Screen</h1>
            <LoginForm/>
        </div>
    )
}

export default LoginScreen;