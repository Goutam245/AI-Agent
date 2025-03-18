"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LucideSend,
  LucideLoader2,
  LucideTrash2,
  LucideChevronDown,
  LucideMic,
  LucideStopCircle,
  LucideCheck,
  LucideImage,
  LucideSmile,
  LucideRefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { Message } from "../page"
import { motion, AnimatePresence } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  onClearConversation: () => void
  loading: boolean
  voiceEnabled: boolean
}

// Animation variants
const messageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
}

// Emoji picker data
const emojiCategories = [
  {
    name: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘"],
  },
  {
    name: "Gestures",
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤙", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🙏", "🤝"],
  },
  {
    name: "Objects",
    emojis: ["💻", "📱", "⌚", "📷", "🔋", "💡", "🔍", "🔑", "📚", "✏️", "📌", "📎", "🔒", "🔓", "🧲"],
  },
]

export default function ChatInterface({
  messages,
  onSendMessage,
  onClearConversation,
  loading,
  voiceEnabled,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()

    // Check if we should show the scroll button
    const scrollArea = scrollAreaRef.current
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

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("")

        setInput(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Handle typing indicator
  useEffect(() => {
    if (input.length > 0 && !isTyping) {
      setIsTyping(true)
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    if (input.length > 0) {
      const timeout = setTimeout(() => {
        setIsTyping(false)
      }, 2000)

      setTypingTimeout(timeout)
    } else {
      setIsTyping(false)
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [input])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    onSendMessage(input)
    setInput("")
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)

      // Send the message if there's input
      if (input.trim()) {
        onSendMessage(input)
        setInput("")
      }
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const messageDate = new Date(date)

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today"
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return messageDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: messageDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = formatDate(new Date(message.timestamp))
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    },
    {} as Record<string, Message[]>,
  )

  return (
    <div className="flex flex-col h-[650px]">
      <div className="relative flex-1">
        <ScrollArea className="h-[550px] pr-4" scrollHideDelay={100} ref={scrollAreaRef as any}>
          <div className="space-y-6 p-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">{date}</div>
                </div>

                <AnimatePresence initial={false}>
                  {dateMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      <div className="flex items-start max-w-[85%] space-x-2 group">
                        {message.role === "assistant" && (
                          <Avatar className="h-9 w-9 mt-0.5 border border-primary/20 bg-primary/5 shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-medium">
                              AI
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col">
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 shadow-sm",
                              message.role === "user"
                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                                : "bg-muted/80 border border-border/50",
                            )}
                          >
                            {message.content}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1 px-2">
                            <span>{formatTime(message.timestamp)}</span>
                            {message.role === "user" && <LucideCheck className="h-3 w-3 ml-1 text-primary/70" />}
                          </div>
                        </div>
                        {message.role === "user" && (
                          <Avatar className="h-9 w-9 mt-0.5 border border-primary/20 shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-secondary/50 to-secondary/30 font-medium">
                              You
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}

            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex items-start max-w-[85%] space-x-2">
                  <Avatar className="h-9 w-9 mt-0.5 border border-primary/20 bg-primary/5 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-medium">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="rounded-2xl px-4 py-3 bg-muted/80 border border-border/50 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <span className="animate-pulse h-2 w-2 rounded-full bg-primary/40"></span>
                          <span className="animate-pulse delay-150 h-2 w-2 rounded-full bg-primary/40"></span>
                          <span className="animate-pulse delay-300 h-2 w-2 rounded-full bg-primary/40"></span>
                        </div>
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {isTyping && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-end"
              >
                <div className="text-xs text-muted-foreground mr-12 italic">You are typing...</div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 right-4 z-10"
          >
            <Button size="icon" variant="secondary" className="rounded-full shadow-md h-8 w-8" onClick={scrollToBottom}>
              <LucideChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs bg-primary/5 hover:bg-primary/10 font-medium">
              AI Assistant
            </Badge>

            {messages.length > 1 && (
              <Badge variant="outline" className="text-xs bg-muted/50 hover:bg-muted/80">
                {messages.length} messages
              </Badge>
            )}
          </div>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-muted/80"
                    onClick={onClearConversation}
                  >
                    <LucideTrash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
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
                    className="h-8 w-8 rounded-full hover:bg-muted/80"
                    onClick={() => {
                      const firstMessage = messages[0]
                      onClearConversation()
                    }}
                  >
                    <LucideRefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Reset conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 bg-background border-muted-foreground/20 focus-visible:ring-primary/50 rounded-full pl-4 pr-24 py-6 shadow-sm"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full hover:bg-muted/80"
                    >
                      <LucideSmile className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="end">
                    <div className="space-y-2">
                      {emojiCategories.map((category) => (
                        <div key={category.name}>
                          <div className="text-xs font-medium text-muted-foreground mb-1 px-1">{category.name}</div>
                          <div className="grid grid-cols-8 gap-1">
                            {category.emojis.map((emoji) => (
                              <Button
                                key={emoji}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md hover:bg-muted"
                                onClick={() => addEmoji(emoji)}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full hover:bg-muted/80"
                        disabled
                      >
                        <LucideImage className="h-4 w-4 text-muted-foreground/50" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Attach image (coming soon)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {voiceEnabled && (
              <Button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "rounded-full w-12 h-12 p-0 shadow-md",
                  isListening ? "bg-red-500 hover:bg-red-600" : "bg-secondary hover:bg-secondary/80",
                )}
              >
                {isListening ? <LucideStopCircle className="h-5 w-5" /> : <LucideMic className="h-5 w-5" />}
                <span className="sr-only">{isListening ? "Stop listening" : "Start voice input"}</span>
              </Button>
            )}

            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full w-12 h-12 p-0 bg-primary hover:bg-primary/90 shadow-md"
            >
              {loading ? <LucideLoader2 className="h-5 w-5 animate-spin" /> : <LucideSend className="h-5 w-5" />}
              <span className="sr-only">Send</span>
            </Button>
          </div>

          <div className="mt-2 text-xs text-center text-muted-foreground">
            AI responses are generated and may not always be accurate
          </div>
        </form>
      </div>
    </div>
  )
}

