"use client";

import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleStartChat = async () => {
    try {
      const res = await fetch("http://localhost:5000/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (res.ok) {
        const newConv = await res.json();
        // Dispatch event to update sidebar
        window.dispatchEvent(new Event("conversation_created"));
        router.push(`/c/${newConv.id}`);
      }
    } catch (error) {
      console.error("Failed to start new chat", error);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 bg-background">
      <div className="flex max-w-md flex-col items-center text-center space-y-6">
        <div className="rounded-full bg-indigo-500/10 p-4 ring-1 ring-indigo-500/20">
          <MessageSquarePlus className="h-10 w-10 text-indigo-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            Welcome to AI Assistant
          </h1>
          <p className="text-muted-foreground">
            A professional, industry-standard chatbot interface powered by advanced AI.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={handleStartChat}
            className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            Start a New Conversation
          </button>
        </div>
      </div>
    </div>
  );
}