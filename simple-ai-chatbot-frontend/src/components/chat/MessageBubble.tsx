"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Bot, User, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  role: "USER" | "ASSISTANT";
  content: string;
}

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === "USER";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex max-w-[85%] gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
            isUser ? "bg-indigo-600 text-white border-indigo-600" : "bg-card text-card-foreground border-border"
          )}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div
          className={cn(
            "relative group flex flex-col gap-2 rounded-2xl px-5 py-3.5 text-sm shadow-sm",
            isUser ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-card text-card-foreground border border-border rounded-tl-sm glass"
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {!isUser && (
            <button
              onClick={copyToClipboard}
              className="absolute -right-10 top-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 border border-border"
              title="Copy to clipboard"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
