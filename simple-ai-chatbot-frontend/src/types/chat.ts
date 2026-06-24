export interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt?: string;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}