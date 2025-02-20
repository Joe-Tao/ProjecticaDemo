"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    CozeWebSDK: {
      WebChatClient: new (config: {}) => void;
    }
  }
}

export default function AgentChat() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_COZE_PAT;
    console.log("Token available:", !!token); // 调试用

    const script = document.createElement("script");
    script.src = "https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.1.0-beta.3/libs/oversea/index.js";
    script.async = true;
    script.onload = () => {
      if (!token) {
        console.error("NEXT_PUBLIC_COZE_PAT is not configured");
        return;
      }

      new window.CozeWebSDK.WebChatClient({
        config: {
          bot_id: "7473426904213782583",
        },
        componentProps: {
          title: "Quick Market Research",
        },
        auth: {
          type: "token",
          token: token,
          onRefreshToken: function () {
            return token;
          },
        },
      });
    };
    document.body.appendChild(script);
  }, []);

  return <div id="coze-chat"></div>;
}
