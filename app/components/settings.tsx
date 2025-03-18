"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucideZap, LucideWrench, LucideShield, LucideCheck, LucideLoader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function Settings() {
  const [model, setModel] = useState("gpt-4o")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [enableTools, setEnableTools] = useState(true)
  const [apiKey, setApiKey] = useState("")
  const [settingsTab, setSettingsTab] = useState("model")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = () => {
    setIsSaving(true)
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings saved",
        description: "Your agent settings have been updated successfully.",
        action: (
          <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <LucideCheck className="h-4 w-4 text-green-500" />
          </div>
        ),
      })
    }, 1000)
  }

  const modelOptions = [
    { value: "gpt-4o", label: "GPT-4o", description: "OpenAI's most capable model" },
    { value: "claude-3-7-sonnet", label: "Claude 3.7 Sonnet", description: "Anthropic's balanced model" },
    { value: "llama-3-70b", label: "Llama 3 70B", description: "Meta's open model" },
  ]

  return (
    <div className="p-6">
      <Tabs value={settingsTab} onValueChange={setSettingsTab} className="w-full">
        <TabsList className="grid grid-cols-3 h-14 rounded-xl bg-muted/50 p-1 mb-6">
          <TabsTrigger
            value="model"
            className={cn(
              "rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm h-12",
              settingsTab === "model" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <LucideZap className="mr-2 h-4 w-4" />
            Model
          </TabsTrigger>
          <TabsTrigger
            value="tools"
            className={cn(
              "rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm h-12",
              settingsTab === "tools" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <LucideWrench className="mr-2 h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className={cn(
              "rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm h-12",
              settingsTab === "advanced" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <LucideShield className="mr-2 h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="model" className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="model">AI Model</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1.5">
              {modelOptions.map((option) => (
                <Card
                  key={option.value}
                  className={cn(
                    "relative cursor-pointer transition-all hover:border-primary/50",
                    model === option.value ? "border-primary bg-primary/5" : "border-border",
                  )}
                  onClick={() => setModel(option.value)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      {model === option.value && (
                        <div className="absolute top-3 right-3 h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center">
                          <LucideCheck className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      {option.label}
                    </CardTitle>
                    <CardDescription className="text-xs">{option.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
              <span className="text-xs text-muted-foreground">
                {temperature < 0.4 ? "More precise" : temperature > 0.7 ? "More creative" : "Balanced"}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              Lower values make responses more deterministic, higher values more creative
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
              <span className="text-xs text-muted-foreground">
                {maxTokens < 500 ? "Brief" : maxTokens > 2000 ? "Detailed" : "Standard"}
              </span>
            </div>
            <Slider
              id="max-tokens"
              min={100}
              max={4000}
              step={100}
              value={[maxTokens]}
              onValueChange={(value) => setMaxTokens(value[0])}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">Maximum number of tokens in the response</p>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Available Tools</CardTitle>
              <CardDescription>Enable or disable tools that the AI agent can use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">Web Search</div>
                    <div className="text-xs text-muted-foreground">
                      Allow the agent to search the web for information
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">Calculator</div>
                    <div className="text-xs text-muted-foreground">
                      Allow the agent to perform mathematical calculations
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">Weather API</div>
                    <div className="text-xs text-muted-foreground">Allow the agent to check weather conditions</div>
                  </div>
                  <Switch checked={false} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">Code Execution</div>
                    <div className="text-xs text-muted-foreground">Allow the agent to execute code in a sandbox</div>
                  </div>
                  <Switch checked={enableTools} onCheckedChange={setEnableTools} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <LucideZap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">Tool usage may increase response time</p>
              <p className="text-muted-foreground text-xs">Complex tools require additional processing time</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="api-key">API Key (Optional)</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">Provide your own API key for the selected model</p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Advanced Settings</CardTitle>
              <CardDescription>Configure advanced options for the AI agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">Stream Responses</div>
                    <div className="text-xs text-muted-foreground">Show responses as they are generated</div>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">Save Chat History</div>
                    <div className="text-xs text-muted-foreground">Store conversation history between sessions</div>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">Debug Mode</div>
                    <div className="text-xs text-muted-foreground">
                      Show detailed information about agent operations
                    </div>
                  </div>
                  <Switch checked={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
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

