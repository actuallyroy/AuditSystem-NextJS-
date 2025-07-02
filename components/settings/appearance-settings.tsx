"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Palette, Monitor, Sun, Moon, Eye } from "lucide-react"

interface AppearanceSettingsProps {
  userRole: "admin" | "manager" | "supervisor" | "auditor"
}

export function AppearanceSettings({ userRole }: AppearanceSettingsProps) {
  const [appearance, setAppearance] = useState({
    theme: "system",
    colorScheme: "blue",
    fontSize: "medium",
    density: "comfortable",
    animations: true,
    compactMode: false,
    sidebarCollapsed: false,
  })

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  const colorSchemes = [
    { value: "blue", label: "Blue", color: "bg-blue-500" },
    { value: "green", label: "Green", color: "bg-green-500" },
    { value: "purple", label: "Purple", color: "bg-purple-500" },
    { value: "orange", label: "Orange", color: "bg-orange-500" },
    { value: "red", label: "Red", color: "bg-red-500" },
    { value: "gray", label: "Gray", color: "bg-gray-500" },
  ]

  const fontSizes = [
    { value: "small", label: "Small", preview: "text-sm" },
    { value: "medium", label: "Medium", preview: "text-base" },
    { value: "large", label: "Large", preview: "text-lg" },
  ]

  const densityOptions = [
    { value: "compact", label: "Compact", description: "More content, less spacing" },
    { value: "comfortable", label: "Comfortable", description: "Balanced spacing" },
    { value: "spacious", label: "Spacious", description: "More spacing, easier to read" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance Settings
          </CardTitle>
          <CardDescription>Customize the look and feel of your interface</CardDescription>
        </CardHeader>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred color theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {themes.map((theme) => (
              <Button
                key={theme.value}
                variant={appearance.theme === theme.value ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setAppearance({ ...appearance, theme: theme.value })}
              >
                <theme.icon className="h-6 w-6" />
                <span>{theme.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
          <CardDescription>Select your preferred accent color</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-6">
            {colorSchemes.map((scheme) => (
              <Button
                key={scheme.value}
                variant={appearance.colorScheme === scheme.value ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setAppearance({ ...appearance, colorScheme: scheme.value })}
              >
                <div className={`w-6 h-6 rounded-full ${scheme.color}`} />
                <span className="text-sm">{scheme.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle>Font Size</CardTitle>
          <CardDescription>Adjust the text size for better readability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select
              value={appearance.fontSize}
              onValueChange={(value) => setAppearance({ ...appearance, fontSize: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    <span className={size.preview}>{size.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Layout Density */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Density</CardTitle>
          <CardDescription>Control the spacing and density of interface elements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {densityOptions.map((option) => (
              <div key={option.value} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
                <Button
                  variant={appearance.density === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAppearance({ ...appearance, density: option.value })}
                >
                  {appearance.density === option.value ? "Selected" : "Select"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interface Options */}
      <Card>
        <CardHeader>
          <CardTitle>Interface Options</CardTitle>
          <CardDescription>Additional interface customization options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Enable Animations</div>
              <div className="text-sm text-gray-500">Smooth transitions and animations</div>
            </div>
            <Switch
              checked={appearance.animations}
              onCheckedChange={(checked) => setAppearance({ ...appearance, animations: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Compact Mode</div>
              <div className="text-sm text-gray-500">Reduce padding and margins for more content</div>
            </div>
            <Switch
              checked={appearance.compactMode}
              onCheckedChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Collapsed Sidebar</div>
              <div className="text-sm text-gray-500">Start with sidebar collapsed by default</div>
            </div>
            <Switch
              checked={appearance.sidebarCollapsed}
              onCheckedChange={(checked) => setAppearance({ ...appearance, sidebarCollapsed: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </CardTitle>
          <CardDescription>See how your settings will look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded ${colorSchemes.find((c) => c.value === appearance.colorScheme)?.color}`}
                />
                <span className={fontSizes.find((f) => f.value === appearance.fontSize)?.preview}>
                  Sample text with your selected font size
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium">Card Title</div>
                  <div className="text-sm text-gray-500">Card description text</div>
                </div>
                <div className="p-3 bg-white rounded border">
                  <div className="font-medium">Another Card</div>
                  <div className="text-sm text-gray-500">More content here</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
