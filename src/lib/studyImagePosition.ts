/** Keep the capsule visible in wide cards. A replacement chosen in Builder
 * retains the normal centered crop instead of inheriting this photo's focal point. */
export function studyImagePosition(src?: string): string {
  return src === "/media/materiales-dentales/ionomeros.jpg" ? "center bottom" : "center"
}
