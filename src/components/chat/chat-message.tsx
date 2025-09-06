"use client";

import Image from "next/image";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Message } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatMessage({ message }: { message: Message }) {
  const { role, content, type } = message;

  const isAi = role === "ai";

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
          isAi ? "bg-secondary" : "bg-primary text-primary-foreground ml-auto"
        )}
      >
        {type === "image" ? (
          <Image
            src={content}
            alt="Generated image"
            width={400}
            height={400}
            className="rounded-md"
            data-ai-hint="generated image"
          />
        ) : (
          <div
            className="prose prose-sm prose-invert"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
          />
        )}
      </div>
    </div>
  );
}
