export type BuilderTheme = {
  enabled: boolean
  primaryBackground: string
  primaryForeground: string
  primaryBorder: string
  outlineBackground: string
  outlineForeground: string
  outlineBorder: string
  borderWidth: number
  radius: number
  shadow: number
  fontWeight: number
  focusColor: string
  focusWidth: number
}

export function renderBuilderCss(theme: BuilderTheme) {
  if (!theme.enabled) {
    return "/* El tema visual local está desactivado. */\n"
  }

  const appButton = `html[data-odontoma-app="true"] :where(
  button.rounded-xl,
  button.rounded-2xl,
  [data-slot="button"]
)`

  const neutralPrimaryButton = `${appButton}:is(
  [data-variant="default"],
  [class*="bg-white"],
  [class*="bg-black"],
  [class*="bg-zinc-"]
):not([class*="border-zinc-"])`

  const neutralOutlineButton = `${appButton}:is(
  [data-variant="outline"],
  [class*="border-zinc-"]
)`

  return `/* Generado desde builder.html. */
/* Solo se activa en la app; la interfaz del editor queda fuera. */
${appButton} {
  border-width: ${theme.borderWidth}px !important;
  border-radius: ${theme.radius}px !important;
  box-shadow: 0 ${Math.round(theme.shadow / 3)}px ${theme.shadow}px rgb(0 0 0 / 35%) !important;
  font-weight: ${theme.fontWeight} !important;
}

/* Los colores semánticos (correcto, parcial, incorrecto) se conservan. */
${neutralPrimaryButton} {
  background: ${theme.primaryBackground} !important;
  color: ${theme.primaryForeground} !important;
  border-color: ${theme.primaryBorder} !important;
}

${neutralOutlineButton} {
  background: ${theme.outlineBackground} !important;
  color: ${theme.outlineForeground} !important;
  border-color: ${theme.outlineBorder} !important;
}

${appButton}:focus-visible {
  outline: ${theme.focusWidth}px solid ${theme.focusColor} !important;
  outline-offset: 3px !important;
}
`
}
