"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, RotateCcw, User } from "lucide-react";
import { Button } from "@repo/ui";
import { motion, AnimatePresence } from "motion/react";
import { useAskRove } from "@/react-query/qa-suites/actions";

interface Message {
  id: string;
  sender: "user" | "rove";
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m-1",
    sender: "rove",
    text: "Hello! I am Rove QA Assistant. I'm connected live to your telemetry traces, scans, and issue database. How can I help your QA triage today?",
    timestamp: "Just now",
  },
];

const SUGGESTED_PROMPTS = [
  "Summarize active QA issues",
  "How to fix TTFB latency on /products?",
  "Generate Playwright test for login flow",
  "Check headers security status",
];

export function AiAssistantWidget() {
  const askRove = useAskRove();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() || askRove.isPending) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: content.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    try {
      const response = await askRove.mutateAsync({ prompt: content.trim() });
      const roveMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "rove",
        text: response.reply,
        timestamp: response.timestamp || "Just now",
      };
      setMessages((prev) => [...prev, roveMsg]);
    } catch {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "rove",
        text: "Could not reach the QA diagnostic service. Please verify your backend connection.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <AnimatePresence mode='wait'>
        {/* Rounded Floating Circular Action Button */}
        {!isOpen && (
          <motion.button
            key='widget-trigger'
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", damping: 18, stiffness: 320 }}
            className='group relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 border border-primary/30 cursor-pointer'
            aria-label='Open Rove AI Assistant'
          >
            {/* Ambient Pulse Glow */}
            <div className='absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-primary/60 opacity-60 blur-xs group-hover:opacity-100 transition-opacity' />

            <div className='relative flex items-center justify-center'>
              <Bot className='w-6 h-6 transition-transform duration-200 group-hover:rotate-6' />
              <span className='absolute -top-1.5 -right-1.5 flex h-3 w-3'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
                <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-background' />
              </span>
            </div>
          </motion.button>
        )}

        {/* Smooth Expandable AI Assistant Window */}
        {isOpen && (
          <motion.div
            key='widget-window'
            initial={{ opacity: 0, scale: 0.85, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 340 }}
            className='w-[90vw] sm:w-[420px] h-[580px] max-h-[85vh] flex flex-col rounded-3xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl shadow-primary/10 overflow-hidden'
          >
            {/* Header */}
            <div className='px-4 py-3.5 border-b border-border bg-secondary/30 flex items-center justify-between select-none'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs'>
                  <Bot className='w-5 h-5' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-xs font-bold text-foreground tracking-tight'>Rove QA Assistant</h3>
                    <span className='w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse' />
                  </div>
                  <p className='text-[10px] text-muted-foreground'>Autonomous Diagnostic Agent</p>
                </div>
              </div>

              <div className='flex items-center gap-1'>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type='button'
                  onClick={handleReset}
                  title='Reset conversation'
                  className='p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer'
                >
                  <RotateCcw className='w-4 h-4' />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type='button'
                  onClick={() => setIsOpen(false)}
                  title='Minimize assistant'
                  className='p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer'
                >
                  <X className='w-4 h-4' />
                </motion.button>
              </div>
            </div>

            {/* Messages Container */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3.5 text-xs'>
              {messages.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx === messages.length - 1 ? 0.05 : 0 }}
                  className={`flex gap-2.5 max-w-[90%] ${m.sender === "user" ? "ml-auto justify-end" : "mr-auto"}`}
                >
                  {m.sender === "rove" && (
                    <div className='w-7 h-7 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-0.5'>
                      <Bot className='w-3.5 h-3.5' />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl space-y-1.5 ${
                      m.sender === "user"
                        ? "bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-xs"
                        : "bg-secondary/70 border border-border/80 text-foreground rounded-tl-xs shadow-xs"
                    }`}
                  >
                    <p className='leading-relaxed whitespace-pre-wrap text-xs'>{m.text}</p>
                    <div className='text-[9px] opacity-65 text-right font-mono'>{m.timestamp}</div>
                  </div>

                  {m.sender === "user" && (
                    <div className='w-7 h-7 rounded-xl bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 mt-0.5'>
                      <User className='w-3.5 h-3.5' />
                    </div>
                  )}
                </motion.div>
              ))}

              {askRove.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex items-center gap-2 text-xs text-muted-foreground pl-1 py-1'
                >
                  <Bot className='w-4 h-4 text-primary animate-spin' />
                  <span className='text-[11px]'>Rove is evaluating telemetry traces...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className='px-3 py-2 border-t border-border/60 bg-secondary/20 flex gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none]'>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type='button'
                  onClick={() => handleSend(prompt)}
                  disabled={askRove.isPending}
                  className='whitespace-nowrap px-3 py-1.5 rounded-full bg-secondary/80 text-[10.5px] text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/70 transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0'
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className='p-3 border-t border-border bg-card/80 flex items-center gap-2'
            >
              <input
                ref={inputRef}
                type='text'
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Ask about scans, bugs, test scripts...'
                className='flex-1 h-9.5 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-shadow'
              />
              <Button
                type='submit'
                variant='primary'
                size='sm'
                className='h-9.5 px-3.5 rounded-xl'
                disabled={!inputText.trim() || askRove.isPending}
                isLoading={askRove.isPending}
                leftIcon={<Send className='w-3.5 h-3.5' />}
              >
                Send
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
