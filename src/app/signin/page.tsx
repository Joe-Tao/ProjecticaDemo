import { auth, signIn } from "@/auth"
import { Metadata } from "next";
import Image from "next/image";
import { googleImage } from "@/app/assets";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Sign in | Projectica",
    description: "Sign in to your account to access your workspace",
}

interface SearchParams {
    callbackUrl?: string;
}

export default async function SignInPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const session = await auth()
    if (session?.user) {
        redirect("/workspace")
    }

    const callbackUrl = searchParams.callbackUrl || "/workspace"

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo and Title */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-lg text-gray-600">Sign in to continue to Projectica</p>
                </div>

                {/* Sign in box */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                    <div className="space-y-6">
                        {/* Sign in button */}
                        <form
                            action={async () => {
                                "use server"
                                await signIn("google", { callbackUrl })
                            }}
                            className="w-full"
                        >
                            <button 
                                type="submit" 
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 text-gray-600 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-100 hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:ring-offset-2 transition-all duration-200 group"
                            >
                                <Image 
                                    src={googleImage} 
                                    alt="Google" 
                                    className="w-5 h-5" 
                                />
                                <span className="text-base font-medium group-hover:text-blue-600">Continue with Google</span>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Coming soon message */}
                        <div className="text-center">
                            <p className="text-gray-500 text-sm">More sign-in options coming soon</p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}
