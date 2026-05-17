import { useMemo, useState } from "react"

import HomeScreen from "./components/HomeScreen"
import SetupScreen from "./components/SetupScreen"
import QuizScreen from "./components/QuizScreen"
import ResultsScreen from "./components/ResultsScreen"
import WeakTopicsScreen from "./components/WeakTopicsScreen"

import { questions } from "@/content/histologia"

import {
  loadStats,
  saveStats
} from "@/lib/stats"

import {
  shuffleArray,
  shuffleQuestion
} from "@/lib/shuffleQuestion"

export default function App() {

  const [selectedSubject, setSelectedSubject] =
    useState<string | null>(null)

  const [started, setStarted] =
    useState(false)

  const [finished, setFinished] =
    useState(false)

  const [showMastery, setShowMastery] =
    useState(false)

  const [current, setCurrent] =
    useState(0)

  const [score, setScore] =
    useState(0)

  const [stats, setStats] =
    useState(() => loadStats())

  const [selectedChapters, setSelectedChapters] =
    useState<string[]>([])

  const [selectedDifficulties, setSelectedDifficulties] =
    useState<string[]>([
      "easy",
      "medium",
      "hard"
    ])

  const [questionCount, setQuestionCount] =
    useState(10)

  const [practiceMode, setPracticeMode] =
    useState("smart")

  const [sessionQuestions, setSessionQuestions] =
    useState<any[]>([])

  const [hasPausedSession, setHasPausedSession] =
    useState(() =>
      Boolean(
        localStorage.getItem("odontoma_paused_session")
      )
    )

  const availableQuestions =
    useMemo(() => {

      return questions.filter((question: any) => {

        const chapterMatch =
          selectedChapters.length > 0 &&
          selectedChapters.includes(question.chapter)

        const difficultyMatch =
          selectedDifficulties.length === 0 ||
          selectedDifficulties.includes(question.difficulty)

        const questionStats =
          stats.questions?.[question.id]

        const modeMatch =
          practiceMode === "all" ||
          (
            practiceMode === "new" &&
            !questionStats
          ) ||
          (
            practiceMode === "incorrect" &&
            questionStats?.incorrect > 0
          ) ||
          (
            practiceMode === "correct" &&
            questionStats?.correct > 0
          ) ||
          (
            practiceMode === "failed" &&
            questionStats?.incorrect > 0
          ) ||
          practiceMode === "smart"

        return (
          chapterMatch &&
          difficultyMatch &&
          modeMatch
        )
      })

    }, [
      selectedChapters,
      selectedDifficulties,
      practiceMode,
      stats
    ])

  const modeCounts =
    useMemo(() => {

      const base =
        questions.filter((question: any) => {

          const chapterMatch =
            selectedChapters.length > 0 &&
            selectedChapters.includes(question.chapter)

          const difficultyMatch =
            selectedDifficulties.length === 0 ||
            selectedDifficulties.includes(question.difficulty)

          return chapterMatch && difficultyMatch
        })

      return {
        new:
          base.filter((question: any) =>
            !stats.questions?.[question.id]
          ).length,

        incorrect:
          base.filter((question: any) =>
            stats.questions?.[question.id]?.incorrect > 0
          ).length,

        correct:
          base.filter((question: any) =>
            stats.questions?.[question.id]?.correct > 0
          ).length,

        failed:
          base.filter((question: any) =>
            stats.questions?.[question.id]?.incorrect > 0
          ).length,

        all:
          base.length
      }

    }, [
      selectedChapters,
      selectedDifficulties,
      stats
    ])

  function buildSmartPool(pool: any[]) {

    const newQuestions =
      pool.filter((question: any) =>
        !stats.questions?.[question.id]
      )

    const incorrectQuestions =
      pool.filter((question: any) =>
        stats.questions?.[question.id]?.incorrect > 0
      )

    const correctQuestions =
      pool.filter((question: any) =>
        stats.questions?.[question.id]?.correct > 0
      )

    return [
      ...shuffleArray(incorrectQuestions),
      ...shuffleArray(newQuestions),
      ...shuffleArray(correctQuestions)
    ]
  }

  function buildFailedPool(pool: any[]) {

    return [...pool].sort((a: any, b: any) => {

      const aIncorrect =
        stats.questions?.[a.id]?.incorrect || 0

      const bIncorrect =
        stats.questions?.[b.id]?.incorrect || 0

      return bIncorrect - aIncorrect
    })
  }

  function startPractice() {

    const pool =
      practiceMode === "smart"
        ? buildSmartPool(availableQuestions)
        : practiceMode === "failed"
        ? buildFailedPool(availableQuestions)
        : shuffleArray(availableQuestions)

    const selected =
      pool
        .slice(0, questionCount)
        .map(shuffleQuestion)

    setSessionQuestions(selected)
    setCurrent(0)
    setScore(0)
    setFinished(false)
    setStarted(true)
    setHasPausedSession(false)

    localStorage.removeItem(
      "odontoma_paused_session"
    )
  }

  function restart() {

    setStarted(false)
    setFinished(false)
    setCurrent(0)
    setScore(0)
    setSessionQuestions([])
    setHasPausedSession(false)

    localStorage.removeItem(
      "odontoma_paused_session"
    )
  }

  function pauseSession() {

    const pausedSession = {
      sessionQuestions,
      current,
      score,
      finished: false,
      selectedChapters,
      selectedDifficulties,
      questionCount,
      practiceMode
    }

    localStorage.setItem(
      "odontoma_paused_session",
      JSON.stringify(pausedSession)
    )

    setHasPausedSession(true)
    setStarted(false)
  }

  function continuePausedSession() {

    const raw =
      localStorage.getItem(
        "odontoma_paused_session"
      )

    if (!raw) {
      setHasPausedSession(false)
      return
    }

    try {

      const pausedSession =
        JSON.parse(raw)

      if (
        !pausedSession.sessionQuestions ||
        pausedSession.sessionQuestions.length === 0
      ) {
        localStorage.removeItem(
          "odontoma_paused_session"
        )

        setHasPausedSession(false)
        return
      }

      setSessionQuestions(
        pausedSession.sessionQuestions
      )

      setCurrent(
        pausedSession.current || 0
      )

      setScore(
        pausedSession.score || 0
      )

      setSelectedChapters(
        pausedSession.selectedChapters || []
      )

      setSelectedDifficulties(
        pausedSession.selectedDifficulties || [
          "easy",
          "medium",
          "hard"
        ]
      )

      setQuestionCount(
        pausedSession.questionCount || 10
      )

      setPracticeMode(
        pausedSession.practiceMode || "smart"
      )

      setFinished(false)
      setStarted(true)
      setHasPausedSession(false)

      localStorage.removeItem(
        "odontoma_paused_session"
      )

    } catch {

      localStorage.removeItem(
        "odontoma_paused_session"
      )

      setHasPausedSession(false)
    }
  }

  function clearPausedSession() {

    localStorage.removeItem(
      "odontoma_paused_session"
    )

    setHasPausedSession(false)
    setStarted(false)
    setFinished(false)
    setCurrent(0)
    setScore(0)
    setSessionQuestions([])
  }

  function updateStats(question: any, correct: boolean) {

    const nextStats = {
      ...stats,
      totalAnswered:
        (stats.totalAnswered || 0) + 1,
      totalCorrect:
        (stats.totalCorrect || 0) + (correct ? 1 : 0),
      tags: {
        ...(stats.tags || {})
      },
      questions: {
        ...(stats.questions || {})
      }
    }

    for (const tag of question.tags || []) {

      if (!nextStats.tags[tag]) {

        nextStats.tags[tag] = {
          correct: 0,
          incorrect: 0
        }
      }

      if (correct) {
        nextStats.tags[tag].correct += 1
      } else {
        nextStats.tags[tag].incorrect += 1
      }
    }

    if (!nextStats.questions[question.id]) {

      nextStats.questions[question.id] = {
        correct: 0,
        incorrect: 0
      }
    }

    if (correct) {
      nextStats.questions[question.id].correct += 1
    } else {
      nextStats.questions[question.id].incorrect += 1
    }

    setStats(nextStats)
    saveStats(nextStats)
  }

  function handleCorrect() {

    const question =
      sessionQuestions[current]

    setScore(prev => prev + 1)

    updateStats(question, true)
  }

  function handleIncorrect() {

    const question =
      sessionQuestions[current]

    updateStats(question, false)
  }

  function handleNext() {

    if (current + 1 >= sessionQuestions.length) {

      setFinished(true)
      return
    }

    setCurrent(prev => prev + 1)
  }

  const question =
    sessionQuestions[current]

  if (showMastery) {

    return (

      <WeakTopicsScreen
        stats={stats}
        onBack={() => setShowMastery(false)}
      />

    )
  }


  if (!selectedSubject) {

    return (

      <HomeScreen
        onSelectSubject={(subject) => {
          setSelectedSubject(subject)
        }}
      />

    )
  }

  if (!started) {

    return (

      <SetupScreen
        selectedChapters={selectedChapters}
        setSelectedChapters={setSelectedChapters}
        selectedDifficulties={selectedDifficulties}
        setSelectedDifficulties={setSelectedDifficulties}
        questionCount={questionCount}
        setQuestionCount={setQuestionCount}
        practiceMode={practiceMode}
        setPracticeMode={setPracticeMode}
        availableQuestionsCount={availableQuestions.length}
        modeCounts={modeCounts}
        hasPausedSession={hasPausedSession && sessionQuestions.length > 0 && !finished}
        onBackHome={() => {
          setSelectedSubject(null)
        }}
        onStart={startPractice}
        onMastery={() => setShowMastery(true)}
        onContinueSession={continuePausedSession}
        onClearSession={clearPausedSession}
      />

    )
  }

  if (finished) {

    return (

      <ResultsScreen
        score={score}
        total={sessionQuestions.length}
        onRestart={restart}
      />

    )
  }

  if (!question) {

    return (

      <main className="
        min-h-screen
        bg-[#09090b]
        text-white
        flex
        items-center
        justify-center
      ">
        Generando quiz...
      </main>

    )
  }

  return (

    <QuizScreen
      key={question.id}
      question={question}
      current={current}
      total={sessionQuestions.length}
      score={score}
      onBack={pauseSession}
      onCorrect={handleCorrect}
      onIncorrect={handleIncorrect}
      onNext={handleNext}
    />

  )
}
