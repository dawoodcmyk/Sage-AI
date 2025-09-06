"use client";

import { useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal, Loader2 } from "lucide-react";

type ChatInputProps = {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
};

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = inputRef.current?.value;
    if (message && !isLoading) {
      await onSendMessage(message);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex items-center gap-4 p-4">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Ask Sage anything..."
          disabled={isLoading}
          className="flex-1"
          aria-label="Chat input"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading}
          aria-label="Send message"
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizontal className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}
