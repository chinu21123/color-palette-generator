import ColorPaletteGenerator from "@/components/color-palette-generator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Color Palette Generator</h1>
        <p className="mb-8 text-gray-600">
          Select a base color to generate harmonious color palettes. Click on any color to copy its hex code.
        </p>
        <ColorPaletteGenerator />
      </div>
    </main>
  )
}
