import { useRef, useState } from "react"

import {
  exportOdontomaBackup,
  importOdontomaBackup
} from "@/lib/backup"

type Props = {
  compact?: boolean
}

export default function BackupPanel({
  compact = false
}: Props) {

  const inputRef =
    useRef<HTMLInputElement | null>(null)

  const [message, setMessage] =
    useState<string | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const [showBackupHelp, setShowBackupHelp] =
    useState(false)

  async function handleImport(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0]

    if (!file) return

    try {

      await importOdontomaBackup(file)

      setError(null)
      setMessage(
        "Backup importado. Recargá la app para ver los cambios."
      )

    } catch {

      setMessage(null)
      setError(
        "No se pudo importar este archivo."
      )

    } finally {

      event.target.value = ""
    }
  }

  return (
    <section className={`
      rounded-[1.5rem]
      border
      border-zinc-800
      bg-zinc-950
      ${compact ? "p-4" : "p-5"}
    `}>

      <div className="
        mb-4
      ">
        <p className="
          text-xs
          font-black
          uppercase
          tracking-[0.2em]
          text-violet-300
        ">
          Backup
        </p>

        <div className="
          mt-2
          flex
          items-start
          justify-between
          gap-3
        ">
          <h2 className={`
            font-black
            text-white
            ${compact ? "text-xl" : "text-2xl"}
          `}>
            Guardar o recuperar progreso
          </h2>

          <div className="
            relative
            shrink-0
          ">
            <button
              type="button"
              onClick={() => setShowBackupHelp(prev => !prev)}
              className="
                inline-flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-amber-500/30
                bg-amber-500/10
                text-sm
                font-black
                text-amber-200
                hover:bg-amber-500/20
              "
              aria-label="Información sobre backup"
            >
              ?
            </button>

            {showBackupHelp && (
              <div className="
                fixed
                inset-0
                z-[999]
                flex
                items-center
                justify-center
                bg-black/70
                px-4
                py-6
              ">
                <div className="
                  w-full
                  max-w-md
                  rounded-3xl
                  border
                  border-amber-500/30
                  bg-zinc-950
                  p-5
                  text-left
                  shadow-2xl
                  shadow-black/60
                ">
                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  ">
                    <p className="
                      text-base
                      font-black
                      text-amber-200
                    ">
                      ¿Dónde se guarda?
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowBackupHelp(false)}
                      className="
                        inline-flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-zinc-700
                        bg-zinc-900
                        text-sm
                        font-black
                        text-zinc-300
                        hover:bg-zinc-800
                      "
                      aria-label="Cerrar información"
                    >
                      ×
                    </button>
                  </div>

                  <p className="
                    mt-3
                    text-sm
                    leading-relaxed
                    text-zinc-300
                  ">
                    Tu progreso se guarda localmente en este navegador/dispositivo.
                  </p>

                  <p className="
                    mt-3
                    text-sm
                    leading-relaxed
                    text-zinc-400
                  ">
                    Para evitar perderlo si borrás datos del navegador, cambiás de dispositivo o reinstalás la app, conviene exportar un backup cada cierto tiempo.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowBackupHelp(false)}
                    className="
                      mt-5
                      w-full
                      rounded-2xl
                      bg-amber-500
                      px-4
                      py-3
                      text-sm
                      font-black
                      text-black
                      hover:bg-amber-400
                    "
                  >
                    Entendido
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="
          mt-2
          text-sm
          leading-relaxed
          text-zinc-400
        ">
          Exporta quizzes, mastery, FSRS, sesiones y futuros datos guardados de Odontoma.
        </p>
      </div>

      <div className="
        grid
        gap-3
        sm:grid-cols-2
      ">
        <button
          type="button"
          onClick={exportOdontomaBackup}
          className="
            rounded-2xl
            bg-white
            px-4
            py-3
            text-sm
            font-black
            text-black
            hover:bg-zinc-200
          "
        >
          Exportar backup
        </button>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="
            rounded-2xl
            border
            border-zinc-700
            bg-zinc-900
            px-4
            py-3
            text-sm
            font-black
            text-zinc-200
            hover:bg-zinc-800
          "
        >
          Importar backup
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImport}
        className="hidden"
      />

      {message && (
        <p className="
          mt-4
          rounded-2xl
          border
          border-emerald-500/30
          bg-emerald-500/10
          px-4
          py-3
          text-sm
          font-black
          text-emerald-300
        ">
          {message}
        </p>
      )}

      {error && (
        <p className="
          mt-4
          rounded-2xl
          border
          border-red-500/30
          bg-red-500/10
          px-4
          py-3
          text-sm
          font-black
          text-red-300
        ">
          {error}
        </p>
      )}

    </section>
  )
}
