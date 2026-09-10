import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Camera,
    Eye,
    EyeOff,
    LockKeyhole,
    UserRound,
    UserPlus,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { toast } from "sonner";
import api from "@/Utils/axios.js";

const Signup = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();


    const handleAvatarChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setValue("avatar", file, {
            shouldValidate: true,
        });

        setAvatarPreview(URL.createObjectURL(file));
    };


    const onSubmit = async (data) => {
        console.log("SUBMIT FUNCTION CALLED");
        console.log("FORM DATA:", data);
        try {
            const formData = new FormData();

            formData.append("name", data.name);
            formData.append("userName", data.userName);
            formData.append("password", data.password);

            if (data.avatar) {
                formData.append("avatar", data.avatar);
            }

            const response = await api.post(
                "/user/register",
                formData
            );

            console.log("response", response);
            

            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }


            console.log(response.data);

        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message || "Registration failed"
            );
        }
    };


    return (
        <AuthLayout type="signup">

            {/* Heading */}
            <div className="mb-6">

                <h2 className="text-3xl font-bold text-[#111b21]">
                    Create account
                </h2>

                <p className="text-[#667781] mt-2">
                    Create your account and start chatting
                </p>

            </div>


            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
            >

                {/* Avatar */}
                <div className="flex justify-center mb-5">

                    <label className="relative cursor-pointer group">

                        <div className="w-24 h-24 rounded-full bg-[#e7f8f1] border-2 border-[#25d366] overflow-hidden flex items-center justify-center">

                            {avatarPreview ? (

                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    className="w-full h-full object-cover"
                                />

                            ) : (

                                <UserPlus
                                    size={32}
                                    className="text-[#00a884]"
                                />

                            )}

                        </div>


                        {/* Camera */}
                        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center border-2 border-white">

                            <Camera size={15} />

                        </div>


                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />

                    </label>

                </div>


                {/* Name */}
                <div>

                    <label className="block text-sm font-semibold text-[#111b21] mb-1.5">
                        Full name
                    </label>

                    <div className="relative">

                        <UserRound
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]"
                        />

                        <input
                            type="text"
                            placeholder="Enter your name"
                            {...register("name", {
                                required: "Name is required",
                            })}
                            className="w-full h-11 pl-11 pr-4 rounded-lg border border-[#d1d7db] outline-none placeholder:text-[#8696a0] focus:border-[#25d366] focus:ring-2 focus:ring-[#25d366]/10 transition"
                        />

                    </div>

                    {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.name.message}
                        </p>
                    )}

                </div>


                {/* Username */}
                <div>

                    <label className="block text-sm font-semibold text-[#111b21] mb-1.5">
                        Username
                    </label>

                    <div className="relative">

                        <UserRound
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]"
                        />

                        <input
                            type="text"
                            placeholder="Choose a username"
                            {...register("userName", {
                                required: "Username is required",
                            })}
                            className="w-full h-11 pl-11 pr-4 rounded-lg border border-[#d1d7db] outline-none placeholder:text-[#8696a0] focus:border-[#25d366] focus:ring-2 focus:ring-[#25d366]/10 transition"
                        />

                    </div>

                    {errors.userName && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.userName.message}
                        </p>
                    )}

                </div>


                {/* Password */}
                <div>

                    <label className="block text-sm font-semibold text-[#111b21] mb-1.5">
                        Password
                    </label>

                    <div className="relative">

                        <LockKeyhole
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]"
                        />

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message:
                                        "Password must be at least 6 characters",
                                },
                            })}
                            className="w-full h-11 pl-11 pr-12 rounded-lg border border-[#d1d7db] outline-none placeholder:text-[#8696a0] focus:border-[#25d366] focus:ring-2 focus:ring-[#25d366]/10 transition"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8696a0]"
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>

                    </div>

                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.password.message}
                        </p>
                    )}

                </div>


                {/* Submit */}
                <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-[#00a884] hover:bg-[#008f72] text-white font-semibold transition shadow-sm mt-2"
                >
                    Create account
                </button>

            </form>


            {/* Login */}
            <p className="text-center text-sm text-[#667781] mt-6">

                Already have an account?{" "}

                <Link
                    to="/login"
                    className="font-semibold text-[#128c7e] hover:underline"
                >
                    Login
                </Link>

            </p>

        </AuthLayout>
    );
};

export default Signup;