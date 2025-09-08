
"use client";

import Image from "next/image";
import { Bot, User, Download, FileAudio } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Message } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function ChatMessage({ message }: { message: Message }) {
  const { role, content, type, mediaDataUri } = message;

  const isAi = role === "ai";
  const isAudio = mediaDataUri?.startsWith('data:audio');

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = content;
    link.download = `sage-image-${new Date().toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (type === "loading") {
    return (
      <div className="flex items-start gap-4">
        <Avatar className="h-9 w-9 border">
          <AvatarImage src="/bot-avatar.png" alt="Sage" />
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="rounded-lg bg-secondary p-4 space-y-2 w-full max-w-md">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (role === 'user' && type === 'media') {
       if (isAudio) {
         return (
            <div className="flex items-center gap-2">
              <FileAudio className="h-5 w-5" /> 
              <span>{content}</span>
            </div>
         )
       }
       return (
        <div className="space-y-2">
          <Image
            src={mediaDataUri!}
            alt="User uploaded image"
            width={400}
            height={400}
            className="rounded-md"
            data-ai-hint="user image"
          />
          {content && <p>{content}</p>}
        </div>
      )
    }

    if (type === "image") {
        return (
          <div className="relative group">
            <Image
                src={content}
                alt="Generated image"
                width={400}
                height={400}
                className="rounded-md"
                data-ai-hint="generated image"
            />
            <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/75"
                onClick={handleDownload}
            >
                <Download className="h-4 w-4" />
            </Button>
          </div>
        );
    }
    
    return (
      <div
        className={cn("prose prose-sm", isAi ? "prose-invert" : "")}
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
      />
    );
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 animate-in fade-in-0 slide-in-from-bottom-4",
      )}
    >
      <Avatar className={cn("h-9 w-9 border", isAi ? "" : "order-2")}>
        {isAi ? (
          <>
            <AvatarImage src="/bot-avatar.png" alt="Sage" />
            <AvatarFallback>
              <Bot className="h-5 w-5 text-foreground" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className={cn(
          "max-w-xl rounded-lg p-4",
          isAi ? "bg-secondary" : "bg-black text-white ml-auto"
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
}
