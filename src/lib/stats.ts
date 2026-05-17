export function loadStats() {

  const raw =
    localStorage.getItem(
      "odontoma_stats"
    )

  if (!raw) {

    return {

      totalAnswered: 0,

      totalCorrect: 0,

      tags: {},

      questions: {}
    }
  }

  return JSON.parse(raw)
}

export function saveStats(stats: any) {

  localStorage.setItem(
    "odontoma_stats",
    JSON.stringify(stats)
  )
}
