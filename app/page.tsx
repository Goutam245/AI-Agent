"use client"

import { useState, useEffect } from "react"
import ChatInterface from "./components/chat-interface"
import SettingsPanel from "./components/settings-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { LucideMessageSquare, LucideSettings, LucideZap } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Framer Motion animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export type AIModel = "gpt-4" | "gpt-3.5-turbo" | "custom"

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState<AIModel>("gpt-3.5-turbo")
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load saved messages and settings from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages")
    const savedApiKey = localStorage.getItem("apiKey")
    const savedModel = localStorage.getItem("model") as AIModel
    const savedVoiceEnabled = localStorage.getItem("voiceEnabled")
    const savedDarkMode = localStorage.getItem("darkMode")

    if (savedMessages) setMessages(JSON.parse(savedMessages))
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedModel) setModel(savedModel)
    if (savedVoiceEnabled) setVoiceEnabled(savedVoiceEnabled === "true")
    if (savedDarkMode) {
      const isDark = savedDarkMode === "true"
      setDarkMode(isDark)
      if (isDark) document.documentElement.classList.add("dark")
    }

    // Add welcome message if no messages exist
    if (!savedMessages || JSON.parse(savedMessages).length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm your AI assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  // Save messages and settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    localStorage.setItem("apiKey", apiKey)
  }, [apiKey])

  useEffect(() => {
    localStorage.setItem("model", model)
  }, [model])

  useEffect(() => {
    localStorage.setItem("voiceEnabled", String(voiceEnabled))
  }, [voiceEnabled])

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      // Prepare conversation history for context
      const conversationHistory = messages
        .slice(-10) // Only use last 10 messages for context
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      // Add the new user message
      conversationHistory.push({
        role: "user",
        content,
      })

      // Call our API route
      const response = await fetchAIResponse(conversationHistory, apiKey, model)

      // Add AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(response)
      }
    } catch (error) {
      console.error("Error fetching AI response:", error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your API key and try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const fetchAIResponse = async (messages: { role: string; content: string }[], apiKey: string, model: AIModel) => {
    // If we're in demo mode (no API key and not on server), return a simulated response
    if (!apiKey && typeof window !== "undefined") {
      return simulateResponse(messages[messages.length - 1].content)
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          model,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.content
    } catch (error) {
      console.error("Error calling chat API:", error)
      throw error
    }
  }

  // Simulate AI response for demo purposes when no API key is provided
  const simulateResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! How can I assist you today?"
    } else if (lowerMessage.includes("help")) {
      return "I'm here to help! You can ask me questions, request information, or just chat. What would you like to know?"
    } else if (lowerMessage.includes("weather")) {
      return "I don't have access to real-time weather data, but if you had provided an API key, I could integrate with a weather service to give you accurate forecasts."
    } else if (lowerMessage.includes("name")) {
      return "I'm your AI assistant, built with React and the OpenAI API. You can call me AI Assistant!"
    } else {
      return "I'm running in demo mode without an API key. To get more intelligent responses, please add your OpenAI API key in the settings tab."
    }
  }

  // Speech synthesis for voice output
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat history cleared. How can I help you?",
        timestamp: new Date(),
      },
    ])
  }

  if (!mounted) return null

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 ${darkMode ? "dark" : ""}`}>
      <div className="w-full max-w-4xl">
        <motion.div initial="hidden" animate="show" variants={container} className="space-y-8">
          <div className="text-center space-y-4 mb-6">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full">
              <LucideZap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                AI Assistant
              </span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your personal AI assistant powered by React and OpenAI
            </p>
          </div>

          <motion.div variants={item}>
            <Card className="border border-primary/20 shadow-lg overflow-hidden bg-card">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 pointer-events-none" />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-2 h-14 rounded-xl bg-muted/50 p-1">
                    <TabsTrigger
                      value="chat"
                      className={cn(
                        "rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm h-12",
                        activeTab === "chat" ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <LucideMessageSquare className="mr-2 h-5 w-5" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className={cn(
                        "rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm h-12",
                        activeTab === "settings" ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <LucideSettings className="mr-2 h-5 w-5" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="chat" className="p-0 m-0">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onClearConversation={clearConversation}
                    loading={loading}
                    voiceEnabled={voiceEnabled}
                  />
                </TabsContent>
                <TabsContent value="settings" className="p-0 m-0">
                  <SettingsPanel
                    apiKey={apiKey}
                    setApiKey={setApiKey}
                    model={model}
                    setModel={setModel}
                    voiceEnabled={voiceEnabled}
                    setVoiceEnabled={setVoiceEnabled}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>

          <motion.div variants={item} className="text-center text-sm text-muted-foreground">
            <p>Built with React, TailwindCSS, and OpenAI</p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

