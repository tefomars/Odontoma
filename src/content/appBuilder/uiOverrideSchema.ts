export type UiOverride = {
  id: string
  screenKey: string
  selector: string
  label: string
  text?: string
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  borderRadius?: number
  hidden?: boolean
  cloneOf?: string
}

export function isValidUiOverride(value: unknown): value is UiOverride {
  if (!value || typeof value !== "object") return false
  const item = value as Partial<UiOverride>
  const validColor = (color?: string) => color === undefined || /^#[0-9a-f]{6}$/i.test(color)

  return typeof item.id === "string" && item.id.length > 0 && item.id.length <= 200 &&
    typeof item.screenKey === "string" && item.screenKey.length > 0 && item.screenKey.length <= 240 &&
    typeof item.selector === "string" && item.selector.length > 0 && item.selector.length <= 1200 &&
    typeof item.label === "string" && item.label.length > 0 && item.label.length <= 240 &&
    (item.text === undefined || (typeof item.text === "string" && item.text.length <= 4000)) &&
    validColor(item.textColor) &&
    validColor(item.backgroundColor) &&
    validColor(item.borderColor) &&
    (item.hidden === undefined || typeof item.hidden === "boolean") &&
    (item.cloneOf === undefined ||
      (typeof item.cloneOf === "string" && item.cloneOf.length > 0 && item.cloneOf.length <= 1200)) &&
    (item.borderRadius === undefined ||
      (Number.isFinite(item.borderRadius) && item.borderRadius >= 0 && item.borderRadius <= 120))
}

export function validateUiOverrides(value: unknown): value is UiOverride[] {
  return Array.isArray(value) && value.length <= 2000 && value.every(isValidUiOverride)
}
