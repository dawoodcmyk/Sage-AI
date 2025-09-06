"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles, MessageSquare, Plus } from "lucide-react";
import { type Message, type Conversation } from "@/lib/types";
import { getAiResponse } from "@/app/actions";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // On first load, create a new conversation if none exist
    if (conversations.length === 0) {
      handleNewConversation();
    }
  }, []);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId);
  }, [conversations, activeConversationId]);

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !activeConversationId) return;

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

    // Update the active conversation with the new messages
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          // If it's the first user message, update the title
          const newTitle = c.messages.length === 0 ? messageText.substring(0, 25) : c.title;
          return {
            ...c,
            title: newTitle,
            messages: [...c.messages, userMessage, loadingMessage],
          };
        }
        return c;
      })
    );
    setIsLoading(true);

    try {
      const aiResponse = await getAiResponse(messageText);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            const newMessages = [...c.messages];
            const loadingIndex = newMessages.findIndex((msg) => msg.type === "loading");
            if (loadingIndex !== -1) {
              newMessages[loadingIndex] = { ...aiResponse, id: crypto.randomUUID() };
            } else {
              // This case might not be necessary but is a good fallback
              newMessages.splice(newMessages.length - 1, 1, { ...aiResponse, id: crypto.randomUUID() });
            }
            return { ...c, messages: newMessages };
          }
          return c;
        })
      );
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        type: "text",
      };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversationId) {
            const newMessages = [...c.messages];
            const loadingIndex = newMessages.findIndex((msg) => msg.type === "loading");
            if (loadingIndex !== -1) {
              newMessages[loadingIndex] = errorMessage;
            } else {
              newMessages.push(errorMessage);
            }
            return { ...c, messages: newMessages };
          }
          return c;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const welcomeMessage: Message = {
    id: 'welcome-message',
    role: 'ai',
    content: "Hello! I'm Sage. Ask me anything, or try `/imagine <prompt>` to generate an image or `/word <concept>` to create a new word.",
    type: 'text'
  };

  const messages = activeConversation?.messages ?? [];
  const initialMessages = messages.length > 0 ? messages : (isClient ? [welcomeMessage] : []);


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="w-full" onClick={handleNewConversation}>
              <Plus />
              <span>New Chat</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {conversations.map((conversation) => (
              <SidebarMenuItem key={conversation.id}>
                <SidebarMenuButton
                  onClick={() => setActiveConversationId(conversation.id)}
                  isActive={conversation.id === activeConversationId}
                  tooltip={conversation.title}
                >
                  <MessageSquare />
                  <span>{conversation.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background text-foreground">
          <header className="flex items-center p-4 border-b shrink-0">
            <SidebarTrigger />
            <div className="flex items-center gap-2 mx-auto">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Sage</h1>
            </div>
          </header>
          <main className="flex-1 overflow-hidden flex flex-col">
            <ChatMessages messages={initialMessages} />
          </main>
          <footer className="border-t bg-background">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
