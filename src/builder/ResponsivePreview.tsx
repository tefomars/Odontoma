import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

export const previewDevices = { desktop: { width: 1280, height: 900 }, tablet: { width: 768, height: 1024 }, phone: { width: 390, height: 844 } } as const

export default function ResponsivePreview({ device, children }: { device: keyof typeof previewDevices; children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null)
  const [availableWidth, setAvailableWidth] = useState(0)
  const [root, setRoot] = useState<HTMLElement | null>(null)
  const viewport = previewDevices[device]
  useLayoutEffect(() => {
    const element = host.current
    if (!element) return
    const observer = new ResizeObserver(entries => setAvailableWidth(entries[0]?.contentRect.width || 0))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const scale = Math.min(1, (availableWidth || viewport.width) / viewport.width)
  return <div ref={host} className="responsive-preview">
    <p className="responsive-preview-label">{viewport.width} × {viewport.height} px · Vista real al {Math.round(scale * 100)}% · Podés hacer scroll dentro de la pantalla.</p>
    <div className="responsive-preview-stage" style={{ height: viewport.height * scale }}>
      <iframe title={`Vista editable ${device}`} src="/builder-preview.html" onLoad={e => setRoot(e.currentTarget.contentDocument?.getElementById("studio-preview-root") || null)} style={{ width: viewport.width, height: viewport.height, transform: `scale(${scale})`, left: availableWidth > viewport.width ? (availableWidth - viewport.width) / 2 : 0 }}/>
    </div>
    {root && createPortal(children, root)}
  </div>
}
