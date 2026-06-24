import { Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center space-y-4 max-w-md"
      >
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center ring-1 ring-border shadow-sm mb-4">
          <Bot size={32} className="text-indigo-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-foreground">
          How can I help you today?
        </h1>
        
        <p className="text-muted-foreground text-sm">
          I&apos;m an advanced AI assistant. You can ask me questions, have me explain concepts, or help you write code.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full">
          {[
            "Explain quantum computing in simple terms",
            "Write a React component for a responsive navbar",
            "How do I optimize a PostgreSQL query?",
            "Plan a 3-day trip to Kyoto, Japan"
          ].map((suggestion, i) => (
            <div 
              key={i}
              className="p-3 text-left text-sm rounded-xl border border-border bg-card/50 hover:bg-secondary/80 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              &quot;{suggestion}&quot;
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}