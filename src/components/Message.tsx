import { DocumentData } from "firebase/firestore";
import Image from "next/image";
import React from "react";
interface Props {
  message: DocumentData;
  onSaveToPlan?: (text: string) => void;
}

const Message = ({ message }: Props) => {
  const isProjectica = message.user.name === "Projectica";
  return (
    <div className={`py-5 text-white `}>
      <div className="flex space-x-2.5 md:space-x-5 md:px-10">
        <div className="border border-gray-600 w-9 h-9 rounded-full flex-shrink-0 p-1 overflow-hidden">
          <Image
            src={message?.user?.avatar}
            alt="userImage"
            width={50}
            height={50}
            className="w-full h-full rounded-full object-cover"
          />
        </div>

        <div
          className={`flex flex-col max-w-md ${
            isProjectica ? "items-start" : "items-end"
          }`}
        >
          <p
            className={`${
              isProjectica ? "bg-black/50" : "bg-blue-400"
            } px-4 py-2 rounded-lg shadow-sm text-base font-medium tracking-wide whitespace-pre-wrap`}
          >
            {message?.text}
          </p>
          {/* {isProjectica && (
            <SavePlanButton 
              onClick={() => onSaveToPlan?.(message.text)} 
            />
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Message;