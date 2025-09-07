import type { User } from "firebase/auth";

export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  type: "text" | "image" | "loading";
  imageDataUri?: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  userId: string;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};
