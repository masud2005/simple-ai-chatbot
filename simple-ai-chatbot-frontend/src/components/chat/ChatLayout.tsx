"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";


import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import EmptyState from "./EmptyState";

import { socket } from "@/lib/socket";
import { Message } from "@/types/chat";

interface ChatLayoutProps {
  conversationId: string;
  initialMessages: Message[];
}

export default function ChatLayout({
  conversationId,
  initialMessages,
}: ChatLayoutProps) {
  const [messages, setMessages] =
    useState<Message[]>(
      initialMessages
    );

  const [isTyping, setIsTyping] =
    useState(false);

  const [isConnected, setIsConnected] =
    useState(socket.connected);

  const handleReceiveMessage =
    useCallback(
      (data: any) => {
        const aiMessage: Message = {
          id:
            data.id ??
            crypto.randomUUID(),
          role: "ASSISTANT",
          content: data.response || data.content || "Empty response",
        };

        setMessages((prev) => [
          ...prev,
          aiMessage,
        ]);

        setIsTyping(false);
      },
      []
    );

  useEffect(() => {
    const onConnect = () =>
      setIsConnected(true);

    const onDisconnect = () =>
      setIsConnected(false);

    socket.on(
      "connect",
      onConnect
    );

    socket.on(
      "disconnect",
      onDisconnect
    );

    socket.on(
      "receive_message",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "connect",
        onConnect
      );

      socket.off(
        "disconnect",
        onDisconnect
      );

      socket.off(
        "receive_message",
        handleReceiveMessage
      );
    };
  }, [handleReceiveMessage]);

  const handleSend = (
    content: string
  ) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "USER",
      content,
    };

    // instant UI update
    setMessages((prev) => {
      if (prev.length === 0) {
        // Dispatch event to refresh sidebar title after a slight delay
        setTimeout(() => {
          window.dispatchEvent(new Event("conversation_created"));
        }, 800);
      }
      return [...prev, userMessage];
    });

    setIsTyping(true);

    socket.emit(
      "send_message",
      {
        conversationId,
        content,
      }
    );
  };

  return (
    <main className="flex h-full w-full flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-b px-6 py-4 bg-background/80 backdrop-blur-md z-10">
        <div>
          <h1 className="text-lg font-semibold ">
            AI Assistant
          </h1>

          <p className="text-xs text-muted-foreground mt-0.5">
            Professional Chat Interface
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
          <div
            className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${isConnected
              ? "bg-green-500 shadow-green-500/50"
              : "bg-red-500 shadow-red-500/50"
              }`}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {isConnected
              ? "Connected"
              : "Disconnected"}
          </span>
        </div>
      </header>

      <section className="flex-1 overflow-hidden flex flex-col">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <MessageList messages={messages} isTyping={isTyping} />
        )}
      </section>

      <div className="border-t">
        <ChatInput
          onSend={handleSend}
          isGenerating={isTyping}
        />
      </div>
    </main>
  );
}