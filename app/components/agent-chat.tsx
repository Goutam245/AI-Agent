"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LucideSend, LucideLoader2, LucideRefreshCw, LucideTrash2, LucideChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm your AI assistant powered by the latest AI technology. How can I help you today?",
    timestamp: new Date(),
  },
]

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    scrollToBottom()

    // Check if we should show the scroll button
    const scrollArea = document.querySelector("[data-radix-scroll-area-viewport]")
    if (scrollArea) {
      const checkScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
      }

      scrollArea.addEventListener("scroll", checkScroll)
      return () => scrollArea.removeEventListener("scroll", checkScroll)
    }
  }, [messages])

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsThinking(true)

    try {
      // Simulate thinking state
      await new Promise((resolve) => setTimeout(resolve, 800))
      setIsThinking(false)

      // Simulate AI response with a delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: getSimulatedResponse(input),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
        setIsLoading(false)
      }, 1200)
    } catch (error) {
      console.error("Error generating response:", error)
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      setIsThinking(false)
    }
  }

  const clearConversation = () => {
    setMessages(initialMessages)
    toast({
      title: "Conversation cleared",
      description: "Your chat history has been reset.",
    })
  }

  // This is just a placeholder - in a real implementation, you would use the AI SDK
  const getSimulatedResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
      return "Hello! I'm glad to be assisting you today. What can I help you with?"
    } else if (lowerQuery.includes("weather")) {
      return "I don't have real-time weather data, but in a real implementation, I could call a weather API for you using the AI SDK's tool capabilities."
    } else if (lowerQuery.includes("calculate") || lowerQuery.includes("math")) {
      return "In a real implementation, I could perform calculations using the AI SDK's tool capabilities. For example, I could calculate complex expressions or solve equations."
    } else if (lowerQuery.includes("search") || lowerQuery.includes("find")) {
      return "With the AI SDK, I could search for information using various tools and APIs. This would allow me to provide you with up-to-date information on any topic you're interested in."
    } else if (lowerQuery.includes("help") || lowerQuery.includes("can you do")) {
      return "I can help with a variety of tasks! I can answer questions, generate content, provide recommendations, and more. In a real implementation with the AI SDK, I would have access to tools that could help me search the web, perform calculations, and interact with various APIs."
    } else {
      return "I'm a simulated AI agent. In a real implementation using the AI SDK, I would generate a more helpful and contextually relevant response based on your query. The AI SDK provides a unified interface to work with various AI models and tools, making it easy to build sophisticated AI applications."
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-[650px]">
      <div className="relative flex-1">
        <ScrollArea className="h-[550px] pr-4">
          <div className="space-y-4 p-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className="flex items-start max-w-[85%] space-x-2 group">
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 mt-0.5 border border-primary/20 bg-primary/5">
                        <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 shadow-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/80 border border-border/50",
                        )}
                      >
                        {message.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 px-2">{formatTime(message.timestamp)}</div>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 mt-0.5 border border-primary/20">
                        <AvatarFallback className="bg-secondary/30">You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </motion.div>
              ))}

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start max-w-[85%] space-x-2">
                    <Avatar className="h-8 w-8 mt-0.5 border border-primary/20 bg-primary/5">
                      <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="rounded-2xl px-4 py-3 bg-muted/80 border border-border/50 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <span className="animate-bounce delay-0 h-2 w-2 rounded-full bg-muted-foreground/40"></span>
                            <span className="animate-bounce delay-150 h-2 w-2 rounded-full bg-muted-foreground/40"></span>
                            <span className="animate-bounce delay-300 h-2 w-2 rounded-full bg-muted-foreground/40"></span>
                          </div>
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 right-4"
          >
            <Button size="icon" variant="secondary" className="rounded-full shadow-md h-8 w-8" onClick={scrollToBottom}>
              <LucideChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-xs bg-primary/5 hover:bg-primary/10">
            AI Agent
          </Badge>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={clearConversation}>
                    <LucideTrash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setMessages(initialMessages)}
                  >
                    <LucideRefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-background border-muted-foreground/20 focus-visible:ring-primary/50 rounded-full pl-4 pr-12 py-6 shadow-sm"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full w-12 h-12 p-0 bg-primary hover:bg-primary/90 shadow-md"
          >
            {isLoading ? <LucideLoader2 className="h-5 w-5 animate-spin" /> : <LucideSend className="h-5 w-5" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

