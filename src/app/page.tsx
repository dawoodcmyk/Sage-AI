"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { type Message } from "@/lib/types";
import { getAiResponse } from "@/app/actions";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      type: "text",
    };

    const loadingMessage: Message = {
      id: crypto.randomUUID(),
      role: "ai",
      content: "loading",
      type: "loading",
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await getAiResponse(messageText);
      setMessages((prev) => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex((msg) => msg.type === "loading");
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = { ...aiResponse, id: crypto.randomUUID() };
        } else {
          newMessages.push({ ...aiResponse, id: crypto.randomUUID() });
        }
        return newMessages;
      });
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        type: "text",
      };
      setMessages((prev) => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex((msg) => msg.type === "loading");
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = errorMessage;
        } else {
          newMessages.push(errorMessage);
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const welcomeMessage: Message = {
    id: 'welcome-message',
    role: 'ai',
    content: "Hello! I'm Sage. Ask me anything, or try `/imagine <prompt>` to create an image.",
    type: 'text'
  };
  
  const initialMessages = messages.length > 0 ? messages : (isClient ? [welcomeMessage] : []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center p-4 border-b shrink-0">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="ml-2 text-xl font-bold">Sage</h1>
      </header>
      <main className="flex-1 overflow-hidden flex flex-col">
        <ChatMessages messages={initialMessages} />
      </main>
      <footer className="border-t bg-background">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
}
