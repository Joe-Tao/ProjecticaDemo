import { auth, signIn } from "@/auth"
import { Metadata } from "next";
import Image from "next/image";
import { githubImage, googleImage } from "@/app/assets";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Signin | Projectica",
    description: "Sign in to your account",
}

export default async function SignInPage() {
    const session = await auth()
    if (session?.user) {
        redirect("/")
    }
    return (
        <div className="fixed w-full h-full bg-black/80 left-0 flex justify-center items-center">
            <div className="bg-[#2f2f2f] p-10 rounded-lg flex flex-col justify-center items-center">
                <div className="px-10 text-center">
                    <p className="text-3xl font-bold">Welcome back</p>
                    <p className="text-sm text-white/60 font-medium mt-2">Log in to your account to continue</p>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <form
                        action={async () => {
                            "use server"
                            await signIn("google")
                        }}
                    >
                        <button type="submit" className="border border-white/50 py-2 px-6 rounded-md text-base font-semibold flex items-center gap-2 hover:border-white text-white/80 hover:text-white duration-300 ease-in-out group"> 
                            <Image src={googleImage} alt="Google" className="w-6 bg-gray-700 rounded-full group-hover:bg-white duration-300" /> 
                            Sign in with Google
                        </button>
                    </form>
                    <form
                        action={async () => {
                            "use server"
                            await signIn()
                        }}
                    >
                        <button type="submit" className="border border-white/50 py-2 px-6 rounded-md text-base font-semibold flex items-center gap-2 hover:border-white text-white/80 hover:text-white duration-300 ease-in-out group"> 
                            <Image src={githubImage} alt="Github" className="w-6 bg-gray-700 rounded-full group-hover:bg-white duration-300" /> 
                            Sign in with Github
                        </button>
                    </form>
                </div>
            </div>
            
        </div>
    );
}
