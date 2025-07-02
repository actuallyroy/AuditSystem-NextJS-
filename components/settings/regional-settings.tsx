"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Calendar, Clock, DollarSign, MapPin } from "lucide-react"

interface RegionalSettingsProps {
  userRole: "admin" | "manager" | "supervisor" | "auditor"
}

export function RegionalSettings({ userRole }: RegionalSettingsProps) {
  const [regional, setRegional] = useState({
    language: "en",
    country: "IN",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    currency: "INR",
    numberFormat: "1,234.56",
  })

  const languages = [
    { value: "en", label: "English", native: "English" },
    { value: "hi", label: "Hindi", native: "हिन्दी" },
    { value: "es", label: "Spanish", native: "Español" },
    { value: "fr", label: "French", native: "Français" },
    { value: "de", label: "German", native: "Deutsch" },
    { value: "zh", label: "Chinese", native: "中文" },
  ]

  const countries = [
    { value: "IN", label: "India" },
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "DE", label: "Germany" },
  ]

  const timezones = [
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +05:30)" },
    { value: "America/New_York", label: "America/New_York (EST -05:00)" },
    { value: "Europe/London", label: "Europe/London (GMT +00:00)" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo (JST +09:00)" },
    { value: "Australia/Sydney", label: "Australia/Sydney (AEDT +11:00)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (PST -08:00)" },
  ]

  const dateFormats = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "15/01/2025" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "01/15/2025" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2025-01-15" },
    { value: "DD MMM YYYY", label: "DD MMM YYYY", example: "15 Jan 2025" },
  ]

  const timeFormats = [
    { value: "12h", label: "12-hour", example: "2:30 PM" },
    { value: "24h", label: "24-hour", example: "14:30" },
  ]

  const currencies = [
    { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
    { value: "GBP", label: "British Pound (£)", symbol: "£" },
    { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
  ]

  const numberFormats = [
    { value: "1,234.56", label: "1,234.56 (Comma thousands, period decimal)" },
    { value: "1.234,56", label: "1.234,56 (Period thousands, comma decimal)" },
    { value: "1 234.56", label: "1 234.56 (Space thousands, period decimal)" },
    { value: "1234.56", label: "1234.56 (No thousands separator)" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Settings
          </CardTitle>
          <CardDescription>Configure language, location, and formatting preferences</CardDescription>
        </CardHeader>
      </Card>

      {/* Language and Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Language & Location
          </CardTitle>
          <CardDescription>Set your preferred language and country</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={regional.language}
                onValueChange={(value) => setRegional({ ...regional, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label} ({lang.native})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={regional.country} onValueChange={(value) => setRegional({ ...regional, country: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Zone
          </CardTitle>
          <CardDescription>Set your local time zone for accurate timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="timezone">Time Zone</Label>
            <Select value={regional.timezone} onValueChange={(value) => setRegional({ ...regional, timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Date and Time Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date & Time Format
          </CardTitle>
          <CardDescription>Choose how dates and times are displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={regional.dateFormat}
                onValueChange={(value) => setRegional({ ...regional, dateFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label} - {format.example}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={regional.timeFormat}
                onValueChange={(value) => setRegional({ ...regional, timeFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label} - {format.example}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency and Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency & Numbers
          </CardTitle>
          <CardDescription>Set currency and number formatting preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={regional.currency} onValueChange={(value) => setRegional({ ...regional, currency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberFormat">Number Format</Label>
            <Select
              value={regional.numberFormat}
              onValueChange={(value) => setRegional({ ...regional, numberFormat: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {numberFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Format Preview</CardTitle>
          <CardDescription>See how your settings will display information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-gray-600">Date</div>
                <div className="text-lg">{dateFormats.find((f) => f.value === regional.dateFormat)?.example}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Time</div>
                <div className="text-lg">{timeFormats.find((f) => f.value === regional.timeFormat)?.example}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Currency</div>
                <div className="text-lg">{currencies.find((c) => c.value === regional.currency)?.symbol}1,234.56</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Numbers</div>
                <div className="text-lg">{regional.numberFormat}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
