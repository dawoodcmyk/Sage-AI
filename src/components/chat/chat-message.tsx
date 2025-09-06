"use client";

import Image from "next/image";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Message } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatMessage({ message }: { message: Message }) {
  const { role, content, type } = message;

  const isAi = role === "ai";

  if (type === "loading") {
    return (
      <div className="flex items-start gap-4">
        <Avatar className="h-9 w-9 border">
          <AvatarFallback className="bg-card">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="rounded-lg border p-4 space-y-2 w-full max-w-md">
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
        !isAi && "flex-row-reverse"
      )}
    >
      <Avatar className="h-9 w-9 border">
        <AvatarFallback className={cn(isAi ? "bg-card" : "bg-primary")}>
          {isAi ? (
            <Bot className="h-5 w-5 text-foreground" />
          ) : (
            <User className="h-5 w-5 text-primary-foreground" />
          )}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-md rounded-lg p-4",
          isAi ? "bg-card border" : "bg-primary"
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
          <p
            className={cn(
              "text-sm",
              isAi ? "text-foreground" : "text-primary-foreground"
            )}
          >
            {content}
          </p>
        )}
      </div>
    </div>
  );
}
