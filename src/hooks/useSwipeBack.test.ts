import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useSwipeBack } from "./useSwipeBack"

const state = vi.hoisted(() => ({ cleanup: undefined as (() => void) | undefined }))
vi.mock("react", () => ({
  useRef: (current: unknown) => ({ current }),
  useEffect: (effect: () => (() => void) | undefined) => { state.cleanup = effect() },
}))
class ElementStub { constructor(private interactive = false) {} closest() { return this.interactive ? this : null } }
let surface: EventTarget
function touch(type: string, x: number, y: number, interactive = false) {
  const event = new Event(type)
  Object.defineProperties(event, { touches: { value: [{ clientX: x, clientY: y }] }, target: { value: new ElementStub(interactive) } })
  surface.dispatchEvent(event)
}
describe("swipe-back gesture boundaries", () => {
  beforeEach(() => {
    surface = new EventTarget()
    vi.stubGlobal("HTMLElement", ElementStub)
    vi.stubGlobal("window", Object.assign(surface, { innerWidth: 390, setTimeout: vi.fn() }))
    vi.stubGlobal("document", { documentElement: { classList: { add: vi.fn(), remove: vi.fn() }, style: { setProperty: vi.fn() } } })
  })
  afterEach(() => { state.cleanup?.(); state.cleanup = undefined; vi.unstubAllGlobals() })
  it("accepts a natural diagonal right swipe and only goes back once", () => {
    const back = vi.fn(); useSwipeBack({ onBack: back })
    touch("touchstart", 20, 100); touch("touchmove", 140, 170); touch("touchend", 140, 170); touch("touchend", 140, 170)
    expect(back).toHaveBeenCalledTimes(1)
  })
  it.each(["vertical", "control", "center", "short", "cancel"])("does not navigate on %s interactions", kind => {
    const back = vi.fn(); useSwipeBack({ onBack: back })
    touch("touchstart", kind === "center" ? 180 : 20, 100, kind === "control")
    touch("touchmove", kind === "short" ? 70 : kind === "vertical" ? 35 : 140, kind === "vertical" ? 230 : 130)
    touch(kind === "cancel" ? "touchcancel" : "touchend", 140, 130)
    expect(back).not.toHaveBeenCalled()
  })
})
