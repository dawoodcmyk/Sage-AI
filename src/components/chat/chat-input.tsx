"use client";

import { useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal, Loader2, CornerDownLeft } from "lucide-react";
import { Textarea } from "../ui/textarea";

type ChatInputProps = {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
};

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = inputRef.current?.value;
    if (message && !isLoading) {
      await onSendMessage(message);
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e.currentTarget.form as HTMLFormElement);
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  return (
    <div className="relative max-w-3xl mx-auto py-4">
      <form onSubmit={handleSubmit} className="flex items-start gap-4 px-4">
        <div className="relative flex-1">
          <Textarea
            ref={inputRef}
            placeholder="Ask Sage anything..."
            disabled={isLoading}
            className="pr-20 resize-none max-h-48"
            aria-label="Chat input"
            rows={1}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
             <Button
              type="submit"
              size="icon"
              disabled={isLoading}
              aria-label="Send message"
              className="shrink-0 h-8 w-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
       <div className="text-xs text-muted-foreground text-center mt-1">
          <CornerDownLeft className="inline-block h-3 w-3 mr-1" />
          Enter to send, Shift+Enter for new line
        </div>
    </div>
  );
}
