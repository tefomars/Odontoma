import {
  useMemo,
  useState
} from "react"

import {
  loadFsrsStorage
} from "@/lib/flashcardStorage"

import {
  clearFsrsParameters,
  loadFsrsParameters,
  saveFsrsParameters
} from "@/lib/fsrsParameters"

import {
  optimizeFsrsParameters
} from "@/lib/fsrsOptimizer"

const MIN_REVIEWS_FOR_OPTIMIZATION =
  100

function formatPercent(
  value?: number
) {
  if (typeof value !== "number") return "—"

  return `${Math.round(value * 100)}%`
}

function formatDate(
  value?: string
) {
  if (!value) return "—"

  return new Date(value).toLocaleString()
}

export default function FsrsOptimizerPanel() {

  const [version, setVersion] =
    useState(0)

  const storage =
    useMemo(
      () => loadFsrsStorage(),
      [version]
    )

  const parameters =
    useMemo(
      () => loadFsrsParameters(),
      [version]
    )

  const reviewCount =
    storage.reviews.length

  const ready =
    reviewCount >= MIN_REVIEWS_FOR_OPTIMIZATION

  const currentRetention =
    reviewCount > 0
      ? storage.reviews.filter(review =>
          review.rating === "hard" ||
          review.rating === "good" ||
          review.rating === "easy"
        ).length / reviewCount
      : 0

  function handleOptimize() {

    if (!ready) return

    const nextParameters =
      optimizeFsrsParameters(storage)

    saveFsrsParameters(nextParameters)

    setVersion(prev => prev + 1)

    alert(
      `Optimización aplicada. Retención real: ${formatPercent(nextParameters.stats.retention)}. Escala de intervalo: ${nextParameters.stats.intervalScale}.`
    )
  }

  function handleReset() {

    const confirmed =
      window.confirm("¿Resetear parámetros personalizados FSRS? Tus reviews se conservan.")

    if (!confirmed) return

    clearFsrsParameters()
    setVersion(prev => prev + 1)
  }

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
          Ajusta los parámetros FSRS usando tu historial real de respuestas. Después de optimizar, los próximos intervalos se calculan con esos parámetros personalizados.
        </p>
      </div>

      <div className="
        grid
        gap-3
        sm:grid-cols-3
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
            Retención actual
          </p>

          <p className="
            mt-2
            text-3xl
            font-black
            text-white
          ">
            {formatPercent(currentRetention)}
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
              ? "Listo"
              : `Faltan ${MIN_REVIEWS_FOR_OPTIMIZATION - reviewCount}`}
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

          <div className="
            mt-2
            grid
            gap-2
            text-xs
            text-zinc-400
            sm:grid-cols-2
          ">
            <p>
              Optimizados con {parameters.reviewCount || 0} reviews.
            </p>

            <p>
              Fecha: {formatDate(parameters.optimizedAt)}
            </p>

            <p>
              Retención usada: {formatPercent(parameters.stats?.retention)}
            </p>

            <p>
              Retención objetivo: {formatPercent(parameters.stats?.targetRetention)}
            </p>

            <p>
              Escala de intervalo: {parameters.stats?.intervalScale || "—"}
            </p>

            <p>
              Request retention: {parameters.requestRetention || "—"}
            </p>
          </div>
        </div>
      )}

      <div className="
        mt-5
        grid
        gap-3
        sm:grid-cols-2
      ">
        <button
          type="button"
          disabled={!ready}
          className={`
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
          onClick={handleOptimize}
        >
          Optimizar memoria
        </button>

        <button
          type="button"
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900
            px-4
            py-3
            text-sm
            font-black
            text-zinc-300
            hover:bg-zinc-800
          "
          onClick={handleReset}
        >
          Resetear parámetros
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
