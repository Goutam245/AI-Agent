"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { LucideCheck, LucideLoader2, LucideMoon, LucideSun } from "lucide-react"
import type { AIModel } from "../page"

interface SettingsPanelProps {
  apiKey: string
  setApiKey: (key: string) => void
  model: AIModel
  setModel: (model: AIModel) => void
  voiceEnabled: boolean
  setVoiceEnabled: (enabled: boolean) => void
  darkMode: boolean
  setDarkMode: (enabled: boolean) => void
}

export default function SettingsPanel({
  apiKey,
  setApiKey,
  model,
  setModel,
  voiceEnabled,
  setVoiceEnabled,
  darkMode,
  setDarkMode,
}: SettingsPanelProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [tempApiKey, setTempApiKey] = useState(apiKey)

  const handleSave = () => {
    setIsSaving(true)

    // Update API key
    setApiKey(tempApiKey)

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const handleVoiceToggle = (checked: boolean) => {
    // Check if browser supports speech synthesis
    if (checked && !("speechSynthesis" in window)) {
      alert("Your browser doesn't support speech synthesis. Voice output won't work.")
      return
    }

    // Check if browser supports speech recognition
    if (checked && !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Your browser doesn't support speech recognition. Voice input won't work.")
      return
    }

    setVoiceEnabled(checked)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="api-key">OpenAI API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={tempApiKey}
          onChange={(e) => setTempApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Your API key is stored locally in your browser and never sent to our servers.
          {!tempApiKey && (
            <span className="text-amber-500 block mt-1">
              Without an API key, the assistant will use the server's API key when deployed to Vercel, or run in demo
              mode locally with limited responses.
            </span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Model Selection</CardTitle>
          <CardDescription>Choose which AI model to use for responses</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={model} onValueChange={(value) => setModel(value as AIModel)}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="gpt-4" id="gpt-4" />
              <Label htmlFor="gpt-4" className="font-normal cursor-pointer">
                <div className="font-medium">GPT-4</div>
                <div className="text-xs text-muted-foreground">Most powerful model, better reasoning, higher cost</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="gpt-3.5-turbo" id="gpt-3.5-turbo" />
              <Label htmlFor="gpt-3.5-turbo" className="font-normal cursor-pointer">
                <div className="font-medium">GPT-3.5 Turbo</div>
                <div className="text-xs text-muted-foreground">Fast responses, good balance of capability and cost</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" disabled />
              <Label htmlFor="custom" className="font-normal cursor-pointer opacity-50">
                <div className="font-medium">Custom Model (Coming Soon)</div>
                <div className="text-xs text-muted-foreground">Connect to your own model or API endpoint</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interface Settings</CardTitle>
          <CardDescription>Customize your AI assistant experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1 space-y-1">
                <div className="font-medium">Voice Input/Output</div>
                <div className="text-xs text-muted-foreground">Enable speech recognition and text-to-speech</div>
              </div>
              <Switch checked={voiceEnabled} onCheckedChange={handleVoiceToggle} />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1 space-y-1">
                <div className="font-medium">Dark Mode</div>
                <div className="text-xs text-muted-foreground">Switch between light and dark theme</div>
              </div>
              <div className="flex items-center space-x-2">
                <LucideSun className="h-4 w-4 text-muted-foreground" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <LucideMoon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1 space-y-1">
                <div className="font-medium">Save Chat History</div>
                <div className="text-xs text-muted-foreground">Persist conversations between sessions</div>
              </div>
              <Switch checked={true} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="px-8 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <LucideCheck className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

