import { Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full mb-6 justify-start"
    >
      <div className="flex max-w-[85%] gap-4 flex-row">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow bg-card text-card-foreground border-border">
          <Bot size={16} />
        </div>
        
        <div className="flex items-center gap-1.5 rounded-2xl px-5 py-4 shadow-sm bg-card text-card-foreground border border-border rounded-tl-sm glass h-[44px]">
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} 
            className="h-2 w-2 rounded-full bg-indigo-500/60" 
          />
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }} 
            className="h-2 w-2 rounded-full bg-indigo-500/60" 
          />
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }} 
            className="h-2 w-2 rounded-full bg-indigo-500/60" 
          />
        </div>
      </div>
    </motion.div>
  );
}