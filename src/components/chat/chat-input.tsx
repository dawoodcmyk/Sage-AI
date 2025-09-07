"use client";

import { useRef, type FormEvent, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { SendHorizontal, Loader2, CornerDownLeft, Paperclip, X } from "lucide-react";

type ChatInputProps = {
  onSendMessage: (message: string, imageDataUri?: string) => Promise<void>;
  isLoading: boolean;
};

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = inputRef.current?.value || "";
    if ((message.trim() || imagePreview) && !isLoading) {
      await onSendMessage(message, imagePreview || undefined);
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.style.height = 'auto';
      }
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="relative max-w-3xl mx-auto py-4">
      <form ref={formRef} onSubmit={handleSubmit} className="flex items-start gap-4 px-4">
        <div className="relative flex-1">
          {imagePreview && (
            <div className="relative mb-2 p-2 border rounded-md bg-secondary">
              <Image src={imagePreview} alt="Image preview" width={80} height={80} className="rounded-md" />
              <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6" onClick={handleRemoveImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Textarea
            ref={inputRef}
            placeholder="Ask Sage anything, or attach an image..."
            disabled={isLoading}
            className="pr-24 resize-none max-h-48"
            aria-label="Chat input"
            rows={1}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
             <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
             <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isLoading} aria-label="Attach file" className="mr-1">
                <Paperclip className="h-4 w-4" />
             </Button>
             <Button
              type="submit"
              size="icon"
              disabled={isLoading || (!inputRef.current?.value?.trim() && !imagePreview)}
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
