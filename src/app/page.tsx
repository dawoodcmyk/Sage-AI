"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles, MessageSquare, Plus, PanelLeft } from "lucide-react";
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

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          const newTitle = c.messages.length === 0 ? messageText.substring(0, 30) : c.title;
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
            const newMessages = c.messages.filter((msg) => msg.type !== "loading");
            return { ...c, messages: [...newMessages, { ...aiResponse, id: crypto.randomUUID() }] };
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
            const newMessages = c.messages.filter((msg) => msg.type !== "loading");
            return { ...c, messages: [...newMessages, errorMessage] };
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
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleNewConversation}>
              <Plus className="w-4 h-4 mr-2" />
              <span>New Chat</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {conversations.map((conversation) => (
              <SidebarMenuItem key={conversation.id}>
                <SidebarMenuButton
                  onClick={() => setActiveConversationId(conversation.id)}
                  isActive={conversation.id === activeConversationId}
                  tooltip={conversation.title}
                  className="justify-start"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span className="truncate">{conversation.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="flex items-center p-4 border-b shrink-0 h-16">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
            </SidebarTrigger>
            <div className="flex items-center gap-2 mx-auto">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Sage</h1>
            </div>
          </header>
          <main className="flex-1 overflow-hidden flex flex-col">
            <ChatMessages messages={initialMessages} />
          </main>
          <footer className="border-t bg-background/95 backdrop-blur-sm">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
