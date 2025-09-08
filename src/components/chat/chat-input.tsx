
"use client";

import { useRef, type FormEvent, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { SendHorizontal, Loader2, CornerDownLeft, Paperclip, X, Mic, StopCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSendMessage: (message: string, imageDataUri?: string, deepThink?: boolean) => Promise<void>;
  isLoading: boolean;
};

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [deepThink, setDeepThink] = useState(false);

  const handleSendMessageWithText = async (text: string, image?: string) => {
    if ((text.trim() || image) && !isLoading) {
      await onSendMessage(text, image || undefined, deepThink);
      setMessage("");
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setDeepThink(false); // Reset after sending
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessageWithText(message, imagePreview);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
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

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const audioDataUri = reader.result as string;
            // The prompt for transcription will be empty, as the audio is the primary input.
            handleSendMessageWithText("", audioDataUri); 
          };
          reader.readAsDataURL(audioBlob);
           // Stop all media tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        // You might want to show a toast notification here
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleDeepThink = () => {
    setDeepThink(prev => !prev);
  }

  const isSendButtonDisabled = isLoading || (!message.trim() && !imagePreview);

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
            value={message}
            placeholder={deepThink ? "Deep thinking is active..." : "Ask Sage anything, or attach an image..."}
            disabled={isLoading || isRecording}
            className={cn("pr-48 resize-none max-h-48", deepThink && "border-purple-500 focus-visible:ring-purple-500")}
            aria-label="Chat input"
            rows={1}
            onKeyDown={handleKeyDown}
            onChange={handleInput}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
             <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
             <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isRecording} aria-label="Attach file" className="mr-1">
                <Paperclip className="h-4 w-4" />
             </Button>
             <Button type="button" size="icon" variant="ghost" onClick={toggleRecording} disabled={isLoading} aria-label={isRecording ? "Stop recording" : "Start recording"} className="mr-1">
              {isRecording ? <StopCircle className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
             </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={toggleDeepThink}
              disabled={isLoading || isRecording}
              aria-label="Toggle Deep Thinking"
              className={cn("mr-1", deepThink && "text-purple-500")}
            >
              <Brain className="h-4 w-4" />
            </Button>
             <Button
              type="submit"
              size="icon"
              disabled={isSendButtonDisabled}
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
