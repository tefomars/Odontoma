export default function StudyImage({ src, alt = "Imagen de estudio", maxHeight }: { src?: string; alt?: string; maxHeight?: string }) {
  if (!src || !/^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|\/(src|assets|media)\/)/.test(src)) return null
  return <figure className="my-4 w-full"><a href={src} target="_blank" rel="noreferrer" aria-label="Abrir imagen completa"><img src={src} alt={alt} loading="lazy" style={{ maxHeight }} className="mx-auto max-h-[40vh] max-w-full rounded-2xl object-contain" /></a></figure>
}
