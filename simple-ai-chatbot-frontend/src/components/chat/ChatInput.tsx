"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonal, SquareSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (message: string) => void;
  isGenerating?: boolean;
  onStop?: () => void;
}

export default function ChatInput({ onSend, isGenerating, onStop }: Props) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (!message.trim() || isGenerating) return;
    onSend(message.trim());
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-background w-full">
      <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-secondary/50 rounded-2xl border border-border p-2 focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/30 transition-all shadow-sm">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message AI..."
          className="w-full max-h-[200px] bg-transparent border-none outline-none resize-none px-3 py-3 text-sm placeholder:text-muted-foreground"
          rows={1}
        />

        {isGenerating ? (
          <button
            onClick={onStop}
            className="p-3 shrink-0 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            <SquareSquare size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className={cn(
              "p-3 shrink-0 rounded-xl transition-all",
              message.trim()
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <SendHorizonal size={18} />
          </button>
        )}
      </div>
      <div className="text-center mt-2 text-[10px] text-muted-foreground">
        AI can make mistakes. Consider verifying important information.
      </div>
    </div>
  );
}
