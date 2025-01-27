import Chat from "@/components/Chat";
import ChatHelp from "@/components/ChatHelp";
import ChatInput from "@/components/ChatInput";
import { db } from "@/firebase";
import { getDoc } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";



export default function ProjectChat(){

    const params = useParams();
    const projectId = params.id as string;

    
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-1 bg-white rounded-lg overflow-hidden">
                <Chat id={projectId} />
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-gray-800/50 backdrop-blur-sm py-4">
                <div className="max-w-7xl mx-auto px-4">
                <ChatInput id={projectId} />
                </div>
                {/* <div className="flex justify-center pt-2">
                <ChatHelp />
                </div> */}
            </div>
        </div>
    )
}