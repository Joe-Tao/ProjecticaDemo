import React from "react";
import ChatHelp from "./ChatHelp";
import Chat from "./Chat";
import ChatInput from "./ChatInput";
interface Props {
    params: {
        id: string;
    };
}

const ChatandPlan = ({ params: { id } }: Props) => {
    return (
        <div className="flex flex-col justify-center h-[100%] p-5 pt-16 overflow-hidden">
        <div className="flex-1 overflow-y-scroll">
          <Chat id={id} />
        </div>
        <ChatInput id={id} />
        <div className="flex justify-center mt-5">
            <ChatHelp projectId={id} />
        </div>
      </div>    
    );
};

export default ChatandPlan;