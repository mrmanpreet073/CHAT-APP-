import { MessageCircle, ShieldCheck, Zap, Users } from "lucide-react";

const AuthLayout = ({ children, type }) => {
    return (
        <div className="min-h-screen bg-[#f5f7f6] flex items-center justify-center p-4 md:p-6">

            <div className="w-full max-w-6xl min-h-[680px] bg-white rounded-2xl overflow-hidden shadow-xl flex">

                {/* LEFT SIDE */}
                <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[#075e54] text-white">

                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-[0.07]">
                        <div className="absolute inset-0 pattern-bg" />
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#128c7e] opacity-40" />

                    <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-[#25d366] opacity-10" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center items-center text-center w-full px-12">

                        {/* Custom Logo */}
                        <div className="w-24 h-24 rounded-3xl bg-[#25d366] flex items-center justify-center shadow-lg mb-8 rotate-[-5deg]">

                            <MessageCircle
                                size={52}
                                strokeWidth={2.2}
                                className="text-white"
                            />

                        </div>

                        {type === "login" ? (
                            <>
                                <h1 className="text-4xl font-bold mb-4">
                                    Welcome back!
                                </h1>

                                <p className="text-white/80 text-lg max-w-md mb-10">
                                    Sign in and continue your conversations
                                    with the people who matter.
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold mb-4">
                                    Start connecting
                                </h1>

                                <p className="text-white/80 text-lg max-w-md mb-10">
                                    Create your account and start chatting
                                    with your friends.
                                </p>
                            </>
                        )}

                        {/* Features */}
                        <div className="space-y-5 text-left">

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>

                                <div>
                                    <p className="font-medium">
                                        Private conversations
                                    </p>

                                    <p className="text-sm text-white/60">
                                        Your conversations stay yours
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Zap size={20} />
                                </div>

                                <div>
                                    <p className="font-medium">
                                        Fast messaging
                                    </p>

                                    <p className="text-sm text-white/60">
                                        Chat without unnecessary delays
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Users size={20} />
                                </div>

                                <div>
                                    <p className="font-medium">
                                        Stay connected
                                    </p>

                                    <p className="text-sm text-white/60">
                                        Keep your conversations together
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>


                {/* RIGHT SIDE */}
                <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16">

                    <div className="w-full max-w-md">
                        {children}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AuthLayout;