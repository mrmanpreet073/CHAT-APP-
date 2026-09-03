import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import api from "@/Utils/axios";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "@/Redux/reducers/auth";


// import { toast } from "sonner";
// toast.success("Account created successfully!");

const Login = () => {

    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        console.log(data);

        try {
        const response = await api.post("/user/login",
            {
                userName: data.userName,
                password: data.password,
            }
        );

        // Store access token
        if(response.data.accessToken) {
            localStorage.setItem("accessToken", response.data.accessToken);
        }
        dispatch(setUser(response.data.user));
        toast.success(response.data.message);

        // navigate("/chat");

    } catch (error) {
        
        console.error(error);
        toast.error(
            error.response?.data?.message ||
            "Login failed"
        );
    }
        
    };

    return (
        <AuthLayout type="login">

            {/* Heading */}
            <div className="mb-8">

                <h2 className="text-3xl font-bold text-[#111b21]">
                    Login
                </h2>

                <p className="text-[#667781] mt-2">
                    Enter your credentials to access your account
                </p>

            </div>


            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >

                {/* Username */}
                <div>

                    <label className="block text-sm font-semibold text-[#111b21] mb-2">
                        Username
                    </label>

                    <div className="relative">

                        <UserRound
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]"
                        />

                        <input
                            type="text"
                            placeholder="Enter your username"
                            {...register("userName", {
                                required: "Username is required",
                            })}
                            className="w-full h-12 pl-11 pr-4 rounded-lg border border-[#d1d7db] outline-none text-[#111b21] placeholder:text-[#8696a0] focus:border-[#25d366] focus:ring-2 focus:ring-[#25d366]/10 transition"
                        />

                    </div>

                    {errors.userName && (
                        <p className="text-red-500 text-xs mt-1.5">
                            {errors.userName.message}
                        </p>
                    )}

                </div>


                {/* Password */}
                <div>

                    <label className="block text-sm font-semibold text-[#111b21] mb-2">
                        Password
                    </label>

                    <div className="relative">

                        <LockKeyhole
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]"
                        />

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...register("password", {
                                required: "Password is required",
                            })}
                            className="w-full h-12 pl-11 pr-12 rounded-lg border border-[#d1d7db] outline-none text-[#111b21] placeholder:text-[#8696a0] focus:border-[#25d366] focus:ring-2 focus:ring-[#25d366]/10 transition"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8696a0] hover:text-[#128c7e]"
                        >
                            {showPassword ? (
                                <EyeOff size={19} />
                            ) : (
                                <Eye size={19} />
                            )}
                        </button>

                    </div>

                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1.5">
                            {errors.password.message}
                        </p>
                    )}

                </div>


                {/* Forgot password */}
                <div className="flex justify-end">

                    <button
                        type="button"
                        className="text-sm font-medium text-[#128c7e] hover:underline"
                    >
                        Forgot password?
                    </button>

                </div>


                {/* Submit */}
                <button
                    type="submit"
                    className="w-full h-12 rounded-lg bg-[#00a884] hover:bg-[#008f72] text-white font-semibold transition shadow-sm"
                >
                    Login
                </button>

            </form>


            {/* Signup */}
            <p className="text-center text-sm text-[#667781] mt-8">

                Don't have an account?{" "}

                <Link
                    to="/signup"
                    className="font-semibold text-[#128c7e] hover:underline"
                >
                    Sign up
                </Link>

            </p>

        </AuthLayout>
    );
};

export default Login;