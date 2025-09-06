export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  type: "text" | "image" | "loading";
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};
