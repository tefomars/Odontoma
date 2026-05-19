import { useMemo } from "react"

import {
  loadFsrsStorage
} from "@/lib/flashcardStorage"

import {
  loadFsrsParameters
} from "@/lib/fsrsParameters"

const MIN_REVIEWS_FOR_OPTIMIZATION =
  100

export default function FsrsOptimizerPanel() {

  const storage =
    useMemo(
      () => loadFsrsStorage(),
      []
    )

  const parameters =
    useMemo(
      () => loadFsrsParameters(),
      []
    )

  const reviewCount =
    storage.reviews.length

  const ready =
    reviewCount >= MIN_REVIEWS_FOR_OPTIMIZATION

  return (
    <section className="
      rounded-[1.75rem]
      border
      border-zinc-800
      bg-zinc-950
      p-5
    ">
      <div className="
        mb-5
      ">
        <p className="
          text-xs
          font-black
          uppercase
          tracking-[0.2em]
          text-emerald-300
        ">
          FSRS
        </p>

        <h2 className="
          mt-2
          text-2xl
          font-black
          text-white
        ">
          Optimizar memoria
        </h2>

        <p className="
          mt-2
          text-sm
          leading-relaxed
          text-zinc-400
        ">
          Ajusta el algoritmo a tu historial de respuestas para que los intervalos se adapten mejor a vos.
        </p>
      </div>

      <div className="
        grid
        gap-3
        sm:grid-cols-2
      ">
        <div className="
          rounded-2xl
          border
          border-zinc-800
          bg-[#111113]
          p-4
        ">
          <p className="
            text-xs
            font-black
            uppercase
            tracking-[0.18em]
            text-zinc-500
          ">
            Reviews guardadas
          </p>

          <p className="
            mt-2
            text-3xl
            font-black
            text-white
          ">
            {reviewCount}
          </p>
        </div>

        <div className="
          rounded-2xl
          border
          border-zinc-800
          bg-[#111113]
          p-4
        ">
          <p className="
            text-xs
            font-black
            uppercase
            tracking-[0.18em]
            text-zinc-500
          ">
            Estado
          </p>

          <p className={`
            mt-2
            text-lg
            font-black
            ${ready ? "text-emerald-300" : "text-amber-300"}
          `}>
            {ready
              ? "Listo para optimizar"
              : `Faltan ${MIN_REVIEWS_FOR_OPTIMIZATION - reviewCount} reviews`}
          </p>
        </div>
      </div>

      {parameters?.optimizedAt && (
        <div className="
          mt-4
          rounded-2xl
          border
          border-violet-500/30
          bg-violet-500/10
          p-4
        ">
          <p className="
            text-sm
            font-black
            text-violet-200
          ">
            Parámetros personalizados activos
          </p>

          <p className="
            mt-1
            text-xs
            text-zinc-400
          ">
            Optimizados con {parameters.reviewCount || 0} reviews.
          </p>
        </div>
      )}

      <div className="
        mt-5
      ">
        <button
          type="button"
          disabled={!ready}
          className={`
            w-full
            rounded-2xl
            px-4
            py-3
            text-sm
            font-black

            ${
              ready
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
            }
          `}
          onClick={() => {
            alert(
              "FSRS está activo. Tus respuestas ya ajustan los próximos repasos automáticamente."
            )
          }}
        >
          Optimizar memoria
        </button>
      </div>

      <p className="
        mt-4
        text-xs
        leading-relaxed
        text-zinc-500
      ">
        Recomendación: optimizar después de acumular suficientes repasos reales. Con pocos datos, los parámetros pueden ser inestables.
      </p>
    </section>
  )
}
