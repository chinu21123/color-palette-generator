"use client"

import { useState, useEffect } from "react"
import { HexColorPicker } from "react-colorful"
import { Check, Copy, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Helper function to convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Helper function to convert Hex to HSL
function hexToHsl(hex: string): [number, number, number] {
  // Remove the # if present
  hex = hex.replace(/^#/, "")

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  // Find the min and max values
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  // Calculate lightness
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (max !== min) {
    // Calculate saturation
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)

    // Calculate hue
    if (max === r) {
      h = (g - b) / (max - min) + (g < b ? 6 : 0)
    } else if (max === g) {
      h = (b - r) / (max - min) + 2
    } else {
      h = (r - g) / (max - min) + 4
    }
    h *= 60
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
}

// Generate complementary color
function getComplementary(hex: string): string {
  const [h, s, l] = hexToHsl(hex)
  return hslToHex((h + 180) % 360, s, l)
}

// Generate analogous colors
function getAnalogous(hex: string, count = 5): string[] {
  const [h, s, l] = hexToHsl(hex)
  const colors: string[] = []
  const step = 30

  const startAngle = h - step * Math.floor(count / 2)

  for (let i = 0; i < count; i++) {
    const newHue = (startAngle + step * i + 360) % 360
    colors.push(hslToHex(newHue, s, l))
  }

  return colors
}

// Generate monochromatic colors
function getMonochromatic(hex: string, count = 5): string[] {
  const [h, s, l] = hexToHsl(hex)
  const colors: string[] = []

  // Start with a lower lightness and increase
  const minL = Math.max(l - 40, 10)
  const step = (90 - minL) / (count - 1)

  for (let i = 0; i < count; i++) {
    const newL = minL + step * i
    colors.push(hslToHex(h, s, newL))
  }

  return colors
}

// Generate triadic colors
function getTriadic(hex: string): string[] {
  const [h, s, l] = hexToHsl(hex)
  return [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)]
}

// Generate tetradic colors
function getTetradic(hex: string): string[] {
  const [h, s, l] = hexToHsl(hex)
  return [hex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)]
}

// Generate shades
function getShades(hex: string, count = 5): string[] {
  const [h, s, _] = hexToHsl(hex)
  const colors: string[] = []

  for (let i = 0; i < count; i++) {
    const l = 10 + (i * 80) / (count - 1)
    colors.push(hslToHex(h, s, l))
  }

  return colors
}

export default function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState("#6366f1")
  const [savedColors, setSavedColors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("complementary")
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  // Generate palettes based on the base color
  const complementary = [baseColor, getComplementary(baseColor)]
  const analogous = getAnalogous(baseColor)
  const monochromatic = getMonochromatic(baseColor)
  const triadic = getTriadic(baseColor)
  const tetradic = getTetradic(baseColor)
  const shades = getShades(baseColor)

  // Handle color copy to clipboard
  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color)
    setCopiedColor(color)

    toast({
      title: "Color copied!",
      description: `${color} has been copied to your clipboard.`,
      duration: 2000,
    })

    setTimeout(() => {
      setCopiedColor(null)
    }, 1000)
  }

  // Save the current base color
  const saveColor = () => {
    if (!savedColors.includes(baseColor)) {
      setSavedColors([...savedColors, baseColor])
    }
  }

  // Remove a saved color
  const removeColor = (color: string) => {
    setSavedColors(savedColors.filter((c) => c !== color))
  }

  // Generate a random color
  const generateRandomColor = () => {
    const randomColor =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    setBaseColor(randomColor)
  }

  // Load saved colors from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedColors")
    if (saved) {
      setSavedColors(JSON.parse(saved))
    }
  }, [])

  // Save colors to localStorage when they change
  useEffect(() => {
    localStorage.setItem("savedColors", JSON.stringify(savedColors))
  }, [savedColors])

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="grid md:grid-cols-[300px_1fr] border-b">
        <div className="p-6 border-r">
          <h2 className="text-xl font-semibold mb-4">Base Color</h2>

          <div className="mb-6">
            <HexColorPicker color={baseColor} onChange={setBaseColor} />
          </div>

          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-md mr-3 shadow-sm" style={{ backgroundColor: baseColor }} />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex space-x-2 mb-6">
            <Button onClick={saveColor} variant="outline" className="flex-1">
              Save Color
            </Button>
            <Button onClick={generateRandomColor} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Random
            </Button>
          </div>

          {savedColors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Saved Colors</h3>
              <div className="grid grid-cols-5 gap-2">
                {savedColors.map((color, index) => (
                  <div key={index} className="relative group">
                    <button
                      className="w-full aspect-square rounded-md shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setBaseColor(color)}
                      title={color}
                    />
                    <button
                      className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeColor(color)}
                    >
                      <Trash2 className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Palettes</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="complementary">Complementary</TabsTrigger>
              <TabsTrigger value="analogous">Analogous</TabsTrigger>
              <TabsTrigger value="monochromatic">Monochromatic</TabsTrigger>
              <TabsTrigger value="triadic">Triadic</TabsTrigger>
              <TabsTrigger value="tetradic">Tetradic</TabsTrigger>
              <TabsTrigger value="shades">Shades</TabsTrigger>
            </TabsList>

            <TabsContent value="complementary" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                {complementary.map((color, index) => (
                  <ColorSwatch key={index} color={color} onCopy={copyToClipboard} isCopied={color === copiedColor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analogous" className="mt-0">
              <div className="grid grid-cols-5 gap-4">
                {analogous.map((color, index) => (
                  <ColorSwatch key={index} color={color} onCopy={copyToClipboard} isCopied={color === copiedColor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="monochromatic" className="mt-0">
              <div className="grid grid-cols-5 gap-4">
                {monochromatic.map((color, index) => (
                  <ColorSwatch key={index} color={color} onCopy={copyToClipboard} isCopied={color === copiedColor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="triadic" className="mt-0">
              <div className="grid grid-cols-3 gap-4">
                {triadic.map((color, index) => (
                  <ColorSwatch key={index} color={color} onCopy={copyToClipboard} isCopied={color === copiedColor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tetradic" className="mt-0">
              <div className="grid grid-cols-4 gap-4">
                {tetradic.map((color, index) => (
                  <ColorSwatch key={index} color={color} onCopy={copyToClipboard} isCopied={color === copiedColor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shades" className="mt-0">
              <div className="grid grid-cols-5 gap-4">
                {shades.map((color, index) => (
                  <ColorSwatch key={index} color={color} onCopy={copyToClipboard} isCopied={color === copiedColor} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">About Color Harmonies</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2">Complementary</h3>
            <p className="text-sm text-gray-600">
              Colors that are opposite each other on the color wheel. They create a high contrast and vibrant look.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Analogous</h3>
            <p className="text-sm text-gray-600">
              Colors that are next to each other on the color wheel. They create a harmonious and comfortable design.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Monochromatic</h3>
            <p className="text-sm text-gray-600">
              Different shades and tints of the same color. They create a cohesive and elegant look.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Triadic</h3>
            <p className="text-sm text-gray-600">
              Three colors that are evenly spaced on the color wheel. They create a balanced and vibrant design.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Tetradic</h3>
            <p className="text-sm text-gray-600">
              Four colors arranged into two complementary pairs. They offer rich color possibilities.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Shades</h3>
            <p className="text-sm text-gray-600">
              Variations of a color from dark to light. Useful for creating depth and dimension.
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

interface ColorSwatchProps {
  color: string
  onCopy: (color: string) => void
  isCopied: boolean
}

function ColorSwatch({ color, onCopy, isCopied }: ColorSwatchProps) {
  // Determine if the color is light or dark to set text color
  const [_, __, l] = hexToHsl(color)
  const textColor = l > 70 ? "text-gray-800" : "text-white"

  return (
    <button
      className="relative rounded-lg overflow-hidden shadow-sm group h-24 transition-all hover:shadow-md"
      style={{ backgroundColor: color }}
      onClick={() => onCopy(color)}
    >
      <div className={`absolute inset-0 flex flex-col justify-between p-3 ${textColor}`}>
        <div className="flex justify-end">
          {isCopied ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        <div className="text-left">
          <span className="font-mono text-sm">{color.toUpperCase()}</span>
        </div>
      </div>
    </button>
  )
}
