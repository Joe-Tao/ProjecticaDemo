import { signOut } from "@/auth";

const SignOut = () => {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button type="submit" className="text-sm text-black hover:text-black/50 duration-300">Sign Out</button>
    </form>
  )
}

export default SignOut