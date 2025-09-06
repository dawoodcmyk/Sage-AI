export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  type: "text" | "image" | "loading";
};
