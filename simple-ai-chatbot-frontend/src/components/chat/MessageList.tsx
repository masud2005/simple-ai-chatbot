"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { Message } from "@/types/chat";

interface Props {
  messages: Message[];
  isTyping?: boolean;
}

export default function MessageList({
  messages,
  isTyping,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
      <div className="max-w-4xl mx-auto flex flex-col w-full pb-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}