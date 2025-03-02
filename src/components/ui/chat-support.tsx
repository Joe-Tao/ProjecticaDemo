"use client";

import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleAction,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";

import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useChat} from "ai/react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaRegCopy } from "react-icons/fa6";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-hot-toast';
import { db } from "@/firebase";
import { collection, addDoc, orderBy, getDocs, query, Timestamp } from "firebase/firestore";


interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" ;
}

interface ChatSupportProps {
  projectId: string
  userId: string
}

const ChatAiIcons = [
  {
    id: 'copy',
    label: "Copy",
  }
]

export default function ChatSupport({ projectId, userId }: ChatSupportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullMessages, setFullMessages] = useState('');
  console.log(fullMessages)
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    onResponse(response) {
      if (response) {
        setIsGenerating(false);
        setFullMessages((prev) => prev + response);
      }
    },
    onFinish(message) {
      setIsGenerating(false);
      // use the last message
      const lastMessage = message.content;
      saveMessageToFirestore(lastMessage, 'assistant', Timestamp.now());
    },
    onError(error) {
      if (error) {
        setIsGenerating(false);
        toast.error('Error sending message');
      }
    },
  });

  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const saveMessageToFirestore = async (message: string, role: string, createdAt: Timestamp) => {
    try {
      const messagesRef = collection(db, 'users', userId, 'projects', projectId, 'messages');
      await addDoc(messagesRef, {
        content: message,
        role: role,
        createdAt: createdAt
      });
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Error saving message');
    }
  };


  //fetch messages from firestore
  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = collection(db, 'users', userId, 'projects', projectId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messages);
    };
    fetchMessages();
  }, [projectId, userId]);

  // save user message
  useEffect(() => {
    const saveUserMessage = async () => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'user') {
        await saveMessageToFirestore(lastMessage.content, 'user', Timestamp.now());
      }
    };

    if (messages.length > 0) {
      saveUserMessage();
    }
  }, [messages.length]);

  // auto scroll
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsGenerating(true);  
    handleSubmit(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || isLoading || !input) return;
      setIsGenerating(true);
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="flex flex-col h-full">
    
      <div className="bg-muted/25 h-[300px] md:h-[500px] lg:h-[700px]">
        <ChatMessageList className="bg-muted/25" ref={messagesRef}>
          {/* Initial message */}
          <ChatBubble variant="received">
            <ChatBubbleAvatar src="" fallback="🤖" />
            <ChatBubbleMessage>
              Hello! I am a Planning Assistant. How can I help you with your project today?
            </ChatBubbleMessage>
          </ChatBubble>

          {/* Messages */}
          {messages &&
            messages.map((message, index) => (
              <ChatBubble
                key={index}
                variant={message.role == "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  src=""
                  fallback={message.role == "user" ? "👤" : "🤖"}
                />

               
                    <ChatBubbleMessage
                    variant={message.role == "user" ? "sent" : "received"}
                    >
                    {message.content
                        .split("```")
                        .map((part: string, index: number) => {
                        
                            return (
                            <Markdown key={index} remarkPlugins={[remarkGfm]}>
                                {part}
                            </Markdown>
                            );
                        
                        })}

                        {message.role == 'assistant' && (
                          <div>
                            {!isLoading && (
                              <>
                              {
                                ChatAiIcons.map((icon) => {
                                  return (
                                    <CopyToClipboard key={icon.id} text={message.content} onCopy={() => toast.success('Copied!')}>
                                      <ChatBubbleAction icon={<FaRegCopy className="size-4 text-black" />} />
                                    </CopyToClipboard>
                                  )
                                })
                              }
                              </>
                            )}
                          </div>
                        )}
                    </ChatBubbleMessage>
              </ChatBubble>
              
            ))}

          {/* Loading */}
          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar src="" fallback="🤖" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>
      {/* Chat input */}
      <div className="bg-muted/25">
        <form ref={formRef} className="flex relative gap-2" onSubmit={onSubmit}>
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            className="min-h-12 bg-background shadow-none "
          />
          <Button
            className="absolute top-1/2 right-2 transform  -translate-y-1/2"
            type="submit"
            size="icon"
            disabled={isLoading || isGenerating || !input}
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
