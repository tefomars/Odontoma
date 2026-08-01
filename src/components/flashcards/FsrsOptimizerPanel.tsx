import {
  useState
} from "react"

import {
  loadFsrsStorage
} from "@/lib/flashcardStorage"

import {
  clearFsrsParameters,
  loadFsrsParameters,
  saveDesiredRetention,
  saveFsrsParameters
} from "@/lib/fsrsParameters"

import {
  getFsrsOptimizationEligibility,
  MIN_REVIEWS_FOR_OPTIMIZATION
} from "@/lib/fsrsEligibility"

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

  const [, setVersion] =
    useState(0)

  const [isOptimizing, setIsOptimizing] =
    useState(false)

  const [message, setMessage] =
    useState<string | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const storage =
    loadFsrsStorage()

  const parameters =
    loadFsrsParameters()

  const eligibility =
    getFsrsOptimizationEligibility(storage.reviews)

  const { reviewCount, ready } = eligibility

  const statusTitle =
    ready
      ? "Listo"
      : !eligibility.enoughReviews
      ? `Faltan ${eligibility.missingReviews}`
      : "Faltan días distintos"

  const statusDescription =
    ready
      ? "Ya hay suficiente historial para personalizar los intervalos."
      : !eligibility.enoughReviews
      ? `Se necesitan ${MIN_REVIEWS_FOR_OPTIMIZATION} repasos para personalizar los intervalos.`
      : "Repasá alguna tarjeta nuevamente otro día para que FSRS pueda medir el olvido."

  const currentRetention =
    reviewCount > 0
      ? storage.reviews.filter(review =>
          review.rating === "hard" ||
          review.rating === "good" ||
          review.rating === "easy"
        ).length / reviewCount
      : 0

  const desiredRetention =
    parameters?.requestRetention ?? 0.9

  async function handleOptimize() {

    if (!ready || isOptimizing) return

    setIsOptimizing(true)
    setMessage(null)
    setError(null)

    try {
      const {
        optimizeFsrsParameters
      } = await import("@/lib/fsrsOptimizer")

      const nextParameters =
        await optimizeFsrsParameters(storage)

      saveFsrsParameters(nextParameters)
    setVersion(prev => prev + 1)
    setMessage(
      "Tus próximos repasos ya están ajustados a tu historial."
      )
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo completar la optimización."
      )
    } finally {
      setIsOptimizing(false)
    }
  }

  function handleDesiredRetention(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    saveDesiredRetention(
      Number(event.target.value)
    )
    setVersion(prev => prev + 1)
    setMessage(
      "Retención deseada actualizada. Los próximos repasos usarán este objetivo."
    )
    setError(null)
  }

  function handleReset() {

    const confirmed =
      window.confirm("¿Restablecer los ajustes de memoria? Tus repasos se conservarán.")

    if (!confirmed) return

    clearFsrsParameters()
    setVersion(prev => prev + 1)
    setMessage(
      "Parámetros aprendidos eliminados. Se conserva tu retención deseada."
    )
    setError(null)
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
          Usa tus resultados para ajustar cuándo volverá a aparecer cada tarjeta.
        </p>
      </div>

      <div className="
        mb-4
        rounded-2xl
        border
        border-zinc-800
        bg-[#111113]
        p-4
      ">
        <div className="
          flex
          items-end
          justify-between
          gap-4
        ">
          <div>
            <p className="
              text-xs
              font-black
              uppercase
              tracking-[0.18em]
              text-zinc-500
            ">
              Retención deseada
            </p>

            <p className="
              mt-1
              text-sm
              text-zinc-400
            ">
              Un porcentaje mayor programa repasos más frecuentes.
            </p>
          </div>

          <p className="
            text-3xl
            font-black
            text-white
          ">
            {formatPercent(desiredRetention)}
          </p>
        </div>

        <input
          className="mt-4 w-full accent-emerald-400"
          type="range"
          min="0.8"
          max="0.97"
          step="0.01"
          value={desiredRetention}
          onChange={handleDesiredRetention}
          aria-label="Retención deseada"
        />

        <div className="
          mt-1
          flex
          justify-between
          text-xs
          font-bold
          text-zinc-600
        ">
          <span>80%</span>
          <span>97%</span>
        </div>
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
            Repasos registrados
          </p>

          <p className="
            mt-2
            text-3xl
            font-black
            text-white
          ">
            {reviewCount}
          </p>

          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Respuestas disponibles para conocer tu ritmo de memoria.
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
            Retención observada
          </p>

          <p className="
            mt-2
            text-3xl
            font-black
            text-white
          ">
            {formatPercent(currentRetention)}
          </p>

          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Porcentaje de repasos en los que recordaste la respuesta.
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
            {statusTitle}
          </p>

          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {statusDescription}
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
              Ajustados con {parameters.reviewCount || 0} repasos.
            </p>

            <p>
              Fecha: {formatDate(parameters.optimizedAt)}
            </p>

            <p>
              Retención observada: {formatPercent(parameters.stats?.retention)}
            </p>

            <p>
              Retención objetivo: {formatPercent(parameters.stats?.targetRetention)}
            </p>

            <p>
              Datos de entrenamiento: {parameters.stats?.trainingItems || 0}
            </p>

            <p>
              Log loss: {parameters.stats?.logLoss?.toFixed(4) || "—"}
            </p>

            <p>
              RMSE: {parameters.stats?.rmseBins?.toFixed(4) || "—"}
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
          disabled={!ready || isOptimizing}
          className={`
            rounded-2xl
            px-4
            py-3
            text-sm
            font-black

            ${
              ready && !isOptimizing
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
            }
          `}
          onClick={handleOptimize}
        >
          {isOptimizing
            ? "Entrenando…"
            : "Ajustar mis repasos"}
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
          Restablecer ajustes
        </button>
      </div>

      {message && (
        <p className="
          mt-4
          rounded-2xl
          border
          border-emerald-500/30
          bg-emerald-500/10
          p-3
          text-sm
          font-bold
          text-emerald-200
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
          p-3
          text-sm
          font-bold
          text-red-200
        ">
          {error}
        </p>
      )}

      <p className="
        mt-4
        text-xs
        leading-relaxed
        text-zinc-500
      ">
        Los repasos se reparten entre los días disponibles para evitar acumulaciones innecesarias.
      </p>
    </section>
  )
}
