"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles, MessageSquare, Plus, PanelLeft, Bot, Image as ImageIcon, Wand2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Intelligent Chat",
    description: "Ask complex questions, get thoughtful answers, and explore topics in depth.",
    example: "What is the meaning of life?",
  },
  {
    icon: <ImageIcon className="w-6 h-6" />,
    title: "Image Generation",
    description: "Bring your ideas to life by generating images from text descriptions.",
    example: "/imagine A futuristic city at sunset",
  },
  {
    icon: <Wand2 className="w-6 h-6" />,
    title: "Word Creation",
    description: "Invent new words for unique concepts and feelings.",
    example: "/word The feeling of a lazy Sunday afternoon",
  },
];


export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId);
  }, [conversations, activeConversationId]);

  const handleNewConversation = (startChat: boolean = true) => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setChatStarted(startChat);
  };
  
  useEffect(() => {
    if (conversations.length === 0) {
      handleNewConversation(false);
    }
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !activeConversationId) return;

    if (!chatStarted) {
      setChatStarted(true);
    }

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
  
  const messages = activeConversation?.messages ?? [];
  const showWelcome = messages.length === 0 && !chatStarted;

  const WelcomeScreen = () => (
    <div className="flex flex-col h-screen">
      <header className="flex items-center p-4 border-b shrink-0 h-16">
        <div className="flex items-center gap-2 mx-auto">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Sage</h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Your intelligent chat assistant</h2>
              <p className="text-muted-foreground mt-2">Ask me anything, or try one of the features below.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-secondary/50 hover:bg-secondary transition-colors">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                      <button
                        onClick={() => handleSendMessage(feature.example)}
                        className="text-sm text-primary/80 hover:text-primary mt-4 text-left w-full"
                      >
                        Try: "{feature.example}"
                      </button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
                <Button size="lg" onClick={() => setChatStarted(true)}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start New Chat
                </Button>
              </div>
          </div>
        </div>
      </main>
    </div>
  );

  const ChatInterface = () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleNewConversation()}>
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
                  onClick={() => {
                    setActiveConversationId(conversation.id)
                    setChatStarted(true);
                  }}
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
            <ChatMessages messages={messages} />
          </main>
          <footer className="border-t bg-background/95 backdrop-blur-sm">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );

  return showWelcome ? <WelcomeScreen /> : <ChatInterface />;
}
