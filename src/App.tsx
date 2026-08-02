import { useMemo, useState, type ReactNode } from "react"
import { useSwipeBack } from "@/hooks/useSwipeBack"

import HomeScreen from "./components/HomeScreen"
import StudyMethodScreen from "./components/StudyMethodScreen"
import QuizModeScreen from "./components/QuizModeScreen"
import SetupScreen from "./components/SetupScreen"
import QuizScreen from "./components/QuizScreen"
import ResultsScreen from "./components/ResultsScreen"
import WeakTopicsScreen from "./components/WeakTopicsScreen"
import FlashcardReviewScreen from "./components/flashcards/FlashcardReviewScreen"
import FlashcardSelectScreen from "./components/flashcards/FlashcardSelectScreen"
import FlashcardSubjectScreen from "./components/flashcards/FlashcardSubjectScreen"
import MyFlashcardTopicsScreen from "./components/flashcards/MyFlashcardTopicsScreen"
import UserTopicScreen from "./components/flashcards/UserTopicScreen"
import UserDeckMenuScreen from "./components/flashcards/UserDeckMenuScreen"
import SuspendedFlashcardsScreen from "./components/flashcards/SuspendedFlashcardsScreen"
import MyQuizDecksScreen from "./components/MyQuizDecksScreen"
import UserQuizDeckScreen from "./components/UserQuizDeckScreen"
import UserQuizDeckMenuScreen from "./components/UserQuizDeckMenuScreen"
import OpenQuizDecksScreen from "./components/OpenQuizDecksScreen"
import OpenQuizSessionScreen from "./components/OpenQuizSessionScreen"
import QuizHistoryScreen from "./components/QuizHistoryScreen"
import QuizReviewScreen from "./components/QuizReviewScreen"
import CustomPageScreen from "./components/CustomPageScreen"
import { customPages, type CustomPageDestination } from "@/content/appBuilder/customPages"

import packageJson from "../package.json"

import {
  questions as histologiaQuestions,
  questionCountsByChapter as histologiaQuestionCountsByChapter
} from "@/content/histologia"

import {
  chapters as histologiaChapters
} from "@/content/histologia/chapters"

import {
  questions as hayekQuestions,
  questionCountsByChapter as hayekQuestionCountsByChapter
} from "@/content/filosofia-de-hayek"

import {
  chapters as hayekChapters
} from "@/content/filosofia-de-hayek/chapters"

import {
  loadStats,
  saveStats
} from "@/lib/stats"

import {
  shuffleArray,
  shuffleQuestion
} from "@/lib/shuffleQuestion"

import {
  buildSmartQuizPool
} from "@/lib/smartQuizPool"

import {
  refreshPausedQuizQuestions
} from "@/lib/pausedQuizSession"

import {
  openQuizClasses,
  openQuizDecks
} from "@/content/openQuizzes"

import type {
  FlashcardSource
} from "@/lib/flashcardDecks"

import {
  saveQuizAttempt,
  type QuizAttempt,
  type QuizResponseRecord
} from "@/lib/quizHistory"

function VersionBadge() {
  return (
    <div className="app-version-badge hidden lg:block">
      Odontoma v{packageJson.version}
    </div>
  )
}

function ScreenTransition({
  children,
  screenKey
}: {
  children: ReactNode
  screenKey: string
}) {
  return (
    <div
      key={screenKey}
      className="screen-transition"
      data-screen-key={screenKey}
    >
      <div className="screen-transition-inner">
        {children}
      </div>

      <div className="hidden lg:block">
        <VersionBadge />
      </div>
    </div>
  )
}

function AppVersion() {
  return (
    <div className="
      hidden
      lg:block
      fixed
      bottom-2
      right-3
      z-50
      rounded-full
      border
      border-zinc-800
      bg-black/40
      px-2.5
      py-1
      text-[10px]
      font-black
      tracking-wide
      text-zinc-500
      backdrop-blur
      pointer-events-none
    ">
      v{packageJson.version}
    </div>
  )
}

export default function App() {

  useSwipeBack({
    onBack: goBack,
    enabled: true,
    minDistance: 90,
    maxVerticalDrift: 80
  })



  const [selectedStudyMethod, setSelectedStudyMethod] =
    useState<"quizzes" | "flashcards" | null>(null)

  const [selectedCustomPageId, setSelectedCustomPageId] =
    useState<string | null>(null)

  const [selectedSubject, setSelectedSubject] =
    useState<string | null>(null)

  const [selectedQuizMode, setSelectedQuizMode] =
    useState<"multiple-choice" | "open-ended" | "my-quizzes" | "history" | null>(null)

  const [selectedFlashcardSubject, setSelectedFlashcardSubject] =
    useState<string | null>(null)

  const [selectedFlashcardTopic, setSelectedFlashcardTopic] =
    useState<string | null>(null)

  const [selectedFlashcardSubtopic, setSelectedFlashcardSubtopic] =
    useState<string | null>(null)

  const [selectedFlashcardSource, setSelectedFlashcardSource] =
    useState<FlashcardSource>("default")

  const [showMyFlashcardTopics, setShowMyFlashcardTopics] =
    useState(false)

  const [activeUserTopicId, setActiveUserTopicId] =
    useState<string | null>(null)

  const [editingUserTopicId, setEditingUserTopicId] =
    useState<string | null>(null)

  const [showSuspendedFlashcards, setShowSuspendedFlashcards] =
    useState(false)

  const [activeUserQuizDeckId, setActiveUserQuizDeckId] =
    useState<string | null>(null)

  const [editingUserQuizDeckId, setEditingUserQuizDeckId] =
    useState<string | null>(null)

  const [activeOpenQuizDeckId, setActiveOpenQuizDeckId] =
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

  const [sessionResponses, setSessionResponses] =
    useState<QuizResponseRecord[]>([])

  const [completedAttempt, setCompletedAttempt] =
    useState<QuizAttempt | null>(null)

  const [reviewingAttempt, setReviewingAttempt] =
    useState<QuizAttempt | null>(null)

  const [hasPausedSession, setHasPausedSession] =
    useState(() => {

      const raw =
        localStorage.getItem(
          "odontoma_paused_session"
        )

      if (!raw || raw === "true") return false

      try {

        const pausedSession =
          JSON.parse(raw)

        return Boolean(
          pausedSession.sessionQuestions &&
          pausedSession.sessionQuestions.length > 0
        )

      } catch {

        return false
      }
    })

  const quizQuestions =
    selectedSubject === "filosofia-de-hayek"
      ? hayekQuestions
      : histologiaQuestions

  const quizChapters =
    selectedSubject === "filosofia-de-hayek"
      ? hayekChapters
      : histologiaChapters

  const quizQuestionCountsByChapter =
    selectedSubject === "filosofia-de-hayek"
      ? hayekQuestionCountsByChapter
      : histologiaQuestionCountsByChapter

  const quizTitle =
    selectedSubject === "filosofia-de-hayek"
      ? "Filosofía de Hayek"
      : "Histología"

  const availableQuestions =
    useMemo(() => {

      return quizQuestions.filter((question: any) => {

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
      quizQuestions,
      selectedChapters,
      selectedDifficulties,
      practiceMode,
      stats
    ])

  const modeCounts =
    useMemo(() => {

      const base =
        quizQuestions.filter((question: any) => {

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
      quizQuestions,
      selectedChapters,
      selectedDifficulties,
      stats
    ])

  function buildSmartPool(pool: any[]) {
    return buildSmartQuizPool(
      pool,
      stats.questions || {}
    )
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
    setSessionResponses([])
    setCompletedAttempt(null)
    setReviewingAttempt(null)
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
    setSessionResponses([])
    setCompletedAttempt(null)
    setReviewingAttempt(null)
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
      quizSubject: selectedSubject,
      finished: false,
      selectedChapters,
      selectedDifficulties,
      questionCount,
      practiceMode,
      sessionResponses
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

    if (!raw || raw === "true") {

      localStorage.removeItem(
        "odontoma_paused_session"
      )

      setHasPausedSession(false)
      return
    }

    try {

      const pausedSession =
        JSON.parse(raw)

      const savedQuestions =
        pausedSession.sessionQuestions || []
      const pausedSubject =
        pausedSession.quizSubject || "histologia"
      const currentQuestionBank =
        pausedSubject === "filosofia-de-hayek"
          ? hayekQuestions
          : histologiaQuestions
      const restoredQuestions =
        pausedSubject === "my-quizzes"
          ? savedQuestions
          : refreshPausedQuizQuestions(
              savedQuestions,
              currentQuestionBank
            )

      if (restoredQuestions.length === 0) {

        localStorage.removeItem(
          "odontoma_paused_session"
        )

        setHasPausedSession(false)
        return
      }

      setSelectedSubject(pausedSubject)

      setSessionQuestions(restoredQuestions)

      setCurrent(
        Math.min(
          pausedSession.current || 0,
          restoredQuestions.length - 1
        )
      )

      setScore(pausedSession.score || 0)
      setSessionResponses(pausedSession.sessionResponses || [])

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
    setSessionResponses([])
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

      const currentTag =
        nextStats.tags[tag] || {
          correct: 0,
          incorrect: 0
        }

      nextStats.tags[tag] = {
        correct:
          currentTag.correct + (correct ? 1 : 0),
        incorrect:
          currentTag.incorrect + (correct ? 0 : 1)
      }
    }

    const currentQuestion =
      nextStats.questions[question.id] || {
        correct: 0,
        incorrect: 0
      }

    nextStats.questions[question.id] = {
      correct:
        currentQuestion.correct + (correct ? 1 : 0),
      incorrect:
        currentQuestion.incorrect + (correct ? 0 : 1)
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

  function handleAnswered(response: QuizResponseRecord) {
    setSessionResponses(currentResponses => [
      ...currentResponses.filter(item => item.questionId !== response.questionId),
      response
    ])
  }

  function handleNext() {

    if (current + 1 >= sessionQuestions.length) {
      const attempt: QuizAttempt = {
        id: `quiz-attempt-${Date.now()}-${crypto.randomUUID()}`,
        title:
          selectedSubject === "my-quizzes"
            ? "My quizzes"
            : quizTitle,
        subject: selectedSubject || "histologia",
        completedAt: new Date().toISOString(),
        score,
        total: sessionQuestions.length,
        mode: "multiple-choice",
        responses: sessionQuestions
          .map(sessionQuestion =>
            sessionResponses.find(response => response.questionId === sessionQuestion.id)
          )
          .filter((response): response is QuizResponseRecord => Boolean(response))
      }

      saveQuizAttempt(attempt)
      setCompletedAttempt(attempt)
      setHasPausedSession(false)
      localStorage.removeItem("odontoma_paused_session")
      setFinished(true)
      return
    }

    setCurrent(prev => prev + 1)
  }

  function goToMainMenu() {

    setSelectedStudyMethod(null)
    setSelectedCustomPageId(null)
    setSelectedSubject(null)
    setSelectedQuizMode(null)

    setSelectedFlashcardSubject(null)
    setSelectedFlashcardTopic(null)
    setSelectedFlashcardSubtopic(null)
    setSelectedFlashcardSource("default")
    setShowMyFlashcardTopics(false)
    setActiveUserTopicId(null)
    setEditingUserTopicId(null)
    setShowSuspendedFlashcards(false)
    setActiveUserQuizDeckId(null)
    setActiveOpenQuizDeckId(null)

    setStarted(false)
    setFinished(false)
    setCurrent(0)
    setScore(0)
    setSessionResponses([])
    setCompletedAttempt(null)
    setReviewingAttempt(null)
  }

  function goBack() {

    if (selectedCustomPageId) {
      setSelectedCustomPageId(null)
      return
    }

    if (reviewingAttempt) {
      setReviewingAttempt(null)
      return
    }

    if (showMastery) {
      setShowMastery(false)
      return
    }

    if (selectedStudyMethod === "flashcards") {

      if (showSuspendedFlashcards) {
        setShowSuspendedFlashcards(false)
        return
      }

      if (editingUserTopicId) {
        setEditingUserTopicId(null)
        return
      }

      if (activeUserTopicId) {
        setActiveUserTopicId(null)
        return
      }

      if (showMyFlashcardTopics) {
        setShowMyFlashcardTopics(false)
        setSelectedFlashcardSubject(null)
        return
      }

      if (selectedFlashcardTopic) {
        if (selectedFlashcardSource === "user") {
          setActiveUserTopicId(selectedFlashcardTopic)
          setShowMyFlashcardTopics(true)
        }

        setSelectedFlashcardTopic(null)
        setSelectedFlashcardSubtopic(null)
        return
      }

      if (selectedFlashcardSubject) {
        setSelectedFlashcardSubject(null)
        return
      }

      setSelectedStudyMethod(null)
      return
    }

    if (selectedStudyMethod === "quizzes") {

      if (started) {
        pauseSession()
        return
      }

      if (editingUserQuizDeckId) {
        setEditingUserQuizDeckId(null)
        return
      }

      if (activeUserQuizDeckId) {
        setActiveUserQuizDeckId(null)
        return
      }

      if (activeOpenQuizDeckId) {
        setActiveOpenQuizDeckId(null)
        return
      }

      if (selectedQuizMode === "history") {
        setSelectedQuizMode(null)
        return
      }

      if (selectedSubject) {
        setSelectedSubject(null)

        if (
          selectedQuizMode === "open-ended" ||
          selectedQuizMode === "my-quizzes"
        ) {
          setSelectedQuizMode(null)
        }

        return
      }

      if (selectedQuizMode) {
        setSelectedQuizMode(null)
        return
      }

      setSelectedStudyMethod(null)
      return
    }

    goToMainMenu()
  }

  function navigateToBuilderDestination(destination: CustomPageDestination | string) {
    if (destination.startsWith("custom-page:")) {
      setSelectedCustomPageId(destination.slice("custom-page:".length))
      return
    }

    setSelectedCustomPageId(null)
    if (destination === "home") return goToMainMenu()
    if (destination === "quizzes") {
      setSelectedStudyMethod("quizzes")
      setSelectedQuizMode(null)
      setSelectedSubject(null)
      return
    }
    if (destination === "flashcards") {
      setSelectedStudyMethod("flashcards")
      setSelectedFlashcardSubject(null)
      return
    }
    if (destination === "multiple-choice") {
      setSelectedStudyMethod("quizzes")
      setSelectedQuizMode("multiple-choice")
      setSelectedSubject(null)
      return
    }
    if (destination === "open-ended") {
      setSelectedStudyMethod("quizzes")
      setSelectedQuizMode("open-ended")
      setSelectedSubject("open-quizzes")
      setActiveOpenQuizDeckId(null)
      return
    }
    if (destination === "my-quizzes") {
      setSelectedStudyMethod("quizzes")
      setSelectedQuizMode("my-quizzes")
      setSelectedSubject("my-quizzes")
      setActiveUserQuizDeckId(null)
    }
  }

  const question =
    sessionQuestions[current]

  const selectedCustomPage = customPages.find(page => page.id === selectedCustomPageId)

  if (selectedCustomPage) {
    return (
      <ScreenTransition screenKey={`custom-page-${selectedCustomPage.id}`}>
        <CustomPageScreen
          page={selectedCustomPage}
          onBack={() => setSelectedCustomPageId(null)}
          onMainMenu={goToMainMenu}
          onNavigate={navigateToBuilderDestination}
        />
      </ScreenTransition>
    )
  }

  if (reviewingAttempt) {
    return (
      <ScreenTransition screenKey={`quiz-review-${reviewingAttempt.id}`}>
        <QuizReviewScreen
          attempt={reviewingAttempt}
          onBack={() => setReviewingAttempt(null)}
          onMainMenu={goToMainMenu}
        />
      </ScreenTransition>
    )
  }

  if (showMastery) {

    return (

      <ScreenTransition screenKey="weak-topics">
        <WeakTopicsScreen
          stats={stats}
          onBack={() => setShowMastery(false)}
        />
      </ScreenTransition>

    )
  }


  if (!selectedStudyMethod) {

    return (

      <ScreenTransition screenKey="study-method">
        <>
          <StudyMethodScreen
            onSelectQuizzes={() => setSelectedStudyMethod("quizzes")}
            onSelectFlashcards={() => setSelectedStudyMethod("flashcards")}
            onSelectDestination={navigateToBuilderDestination}
          />
          <AppVersion />
        </>
      </ScreenTransition>

    )
  }

  if (selectedStudyMethod === "flashcards") {

    if (!selectedFlashcardSubject) {

      return (

        <ScreenTransition screenKey="flashcard-subject">
          <FlashcardSubjectScreen
            onBack={() => setSelectedStudyMethod(null)}
            onSelectMyDecks={() => {
              setSelectedFlashcardSubject("my")
              setShowMyFlashcardTopics(true)
            }}
            onSelectSubject={(subject) => {
              if (subject.startsWith("custom-page:")) navigateToBuilderDestination(subject)
              else setSelectedFlashcardSubject(subject)
            }}
          />
        </ScreenTransition>

      )
    }

    if (showSuspendedFlashcards) {

      return (

        <ScreenTransition screenKey="suspended-flashcards">
          <SuspendedFlashcardsScreen
            onBack={() => setShowSuspendedFlashcards(false)}
            onMenu={goToMainMenu}
          />
        </ScreenTransition>

      )
    }

    if (editingUserTopicId) {

      return (

        <ScreenTransition screenKey={`edit-user-topic-${editingUserTopicId}`}>
          <UserTopicScreen
            topicId={editingUserTopicId}
            onBack={() => setEditingUserTopicId(null)}
            onMenu={goToMainMenu}
            onReview={() => {
              setSelectedFlashcardSource("user")
              setSelectedFlashcardTopic(editingUserTopicId)
              setSelectedFlashcardSubtopic(null)
              setEditingUserTopicId(null)
              setShowMyFlashcardTopics(false)
            }}
          />
        </ScreenTransition>

      )
    }

    if (activeUserTopicId) {

      return (

        <ScreenTransition screenKey={`user-deck-menu-${activeUserTopicId}`}>
          <UserDeckMenuScreen
            topicId={activeUserTopicId}
            onBack={() => setActiveUserTopicId(null)}
            onMenu={goToMainMenu}
            onEdit={() => {
              setEditingUserTopicId(activeUserTopicId)
              setActiveUserTopicId(null)
            }}
            onReview={() => {
              setSelectedFlashcardSource("user")
              setSelectedFlashcardTopic(activeUserTopicId)
              setSelectedFlashcardSubtopic(null)
              setActiveUserTopicId(null)
              setShowMyFlashcardTopics(false)
            }}
          />
        </ScreenTransition>

      )
    }

    if (showMyFlashcardTopics) {

      return (

        <ScreenTransition screenKey="my-flashcard-topics">
          <MyFlashcardTopicsScreen
            onBack={() => {
              setShowMyFlashcardTopics(false)
              setSelectedFlashcardSubject(null)
            }}
            onMenu={goToMainMenu}
            onSelectTopic={(topicId) => setActiveUserTopicId(topicId)}
          />
        </ScreenTransition>

      )
    }

    if (!selectedFlashcardTopic) {

      return (

        <ScreenTransition screenKey="flashcard-select">
          <FlashcardSelectScreen
            subject={selectedFlashcardSubject || "histologia"}
            onBack={() => setSelectedFlashcardSubject(null)}
            onShowSuspended={() => setShowSuspendedFlashcards(true)}
            onSelectTopic={(topic, source) => {
              setSelectedFlashcardTopic(topic)
              setSelectedFlashcardSubtopic(null)
              setSelectedFlashcardSource(source)
            }}
            onSelectSubtopic={(topic, subtopic, source) => {
              setSelectedFlashcardTopic(topic)
              setSelectedFlashcardSubtopic(subtopic)
              setSelectedFlashcardSource(source)
            }}
          />
        </ScreenTransition>

      )
    }

    return (

      <ScreenTransition
        screenKey={`flashcard-review-${selectedFlashcardTopic}-${selectedFlashcardSubtopic || "all"}`}
      >
        <FlashcardReviewScreen
          selectedTopic={selectedFlashcardTopic}
          selectedSubtopic={selectedFlashcardSubtopic || undefined}
          source={selectedFlashcardSource}
          onMenu={goToMainMenu}
          onBack={() => {

            if (selectedFlashcardSource === "user") {
              setActiveUserTopicId(selectedFlashcardTopic)
              setShowMyFlashcardTopics(true)
            }

            setSelectedFlashcardTopic(null)
            setSelectedFlashcardSubtopic(null)
          }}
        />
      </ScreenTransition>

    )
  }

  if (!selectedQuizMode && !selectedSubject) {

    return (

      <ScreenTransition screenKey="quiz-mode">
        <QuizModeScreen
          onBack={() => setSelectedStudyMethod(null)}
          onMainMenu={goToMainMenu}
          onSelectMultipleChoice={() => {
            setSelectedQuizMode("multiple-choice")
            setSelectedSubject(null)
          }}
          onSelectOpenEnded={() => {
            setSelectedQuizMode("open-ended")
            setSelectedSubject("open-quizzes")
            setActiveOpenQuizDeckId(null)
          }}
          onSelectMyQuizzes={() => {
            setSelectedQuizMode("my-quizzes")
            setSelectedSubject("my-quizzes")
            setActiveUserQuizDeckId(null)
          }}
          onSelectDestination={navigateToBuilderDestination}
        />
      </ScreenTransition>

    )
  }

  if (selectedQuizMode === "history") {
    return (
      <ScreenTransition screenKey="quiz-history">
        <QuizHistoryScreen
          onBack={() => setSelectedQuizMode(null)}
          onMainMenu={goToMainMenu}
          onReview={setReviewingAttempt}
        />
      </ScreenTransition>
    )
  }

  if (selectedQuizMode === "multiple-choice" && !selectedSubject) {

    return (

      <ScreenTransition screenKey="home">
        <HomeScreen
          onBack={() => setSelectedQuizMode(null)}
          onMainMenu={goToMainMenu}
          onSelectSubject={(subject) => {
            if (subject.startsWith("custom-page:")) {
              navigateToBuilderDestination(subject)
              return
            }
            setSelectedSubject(subject)
            setSelectedChapters([])
            setQuestionCount(10)
            setPracticeMode("smart")
          }}
        />
      </ScreenTransition>

    )
  }

  if (selectedSubject === "open-quizzes") {

    const activeDeck =
      openQuizDecks.find(deck => deck.id === activeOpenQuizDeckId)

    if (activeDeck) {
      return (
        <ScreenTransition screenKey={`open-quiz-${activeDeck.id}`}>
          <OpenQuizSessionScreen
            deck={activeDeck}
            onBack={() => setActiveOpenQuizDeckId(null)}
            onMainMenu={goToMainMenu}
            onHistory={() => {
              setActiveOpenQuizDeckId(null)
              setSelectedQuizMode("history")
            }}
          />
        </ScreenTransition>
      )
    }

    return (
      <ScreenTransition screenKey="open-quiz-decks">
        <OpenQuizDecksScreen
          classes={openQuizClasses}
          decks={openQuizDecks}
          onBack={() => {
            setSelectedSubject(null)
            setSelectedQuizMode(null)
          }}
          onMainMenu={goToMainMenu}
          onStart={setActiveOpenQuizDeckId}
          onHistory={() => setSelectedQuizMode("history")}
        />
      </ScreenTransition>
    )
  }

  if (selectedSubject === "my-quizzes" && !started) {

    function startUserQuiz(quizQuestions: any[]) {

      const selected =
        shuffleArray(quizQuestions)
          .map(shuffleQuestion)

      setSessionQuestions(selected)
      setSessionResponses([])
      setCompletedAttempt(null)
      setReviewingAttempt(null)
      setCurrent(0)
      setScore(0)
      setFinished(false)
      setStarted(true)
      setHasPausedSession(false)
      setActiveUserQuizDeckId(null)
      setEditingUserQuizDeckId(null)

      localStorage.removeItem(
        "odontoma_paused_session"
      )
    }

    if (editingUserQuizDeckId) {

      return (

        <ScreenTransition screenKey={`edit-user-quiz-${editingUserQuizDeckId}`}>
          <UserQuizDeckScreen
            deckId={editingUserQuizDeckId}
            onBack={() => setEditingUserQuizDeckId(null)}
            onMainMenu={goToMainMenu}
            onReview={startUserQuiz}
          />
        </ScreenTransition>

      )
    }

    if (activeUserQuizDeckId) {

      return (

        <ScreenTransition screenKey={`user-quiz-menu-${activeUserQuizDeckId}`}>
          <UserQuizDeckMenuScreen
            deckId={activeUserQuizDeckId}
            onBack={() => setActiveUserQuizDeckId(null)}
            onMainMenu={goToMainMenu}
            onReview={startUserQuiz}
            onEdit={() => {
              setEditingUserQuizDeckId(activeUserQuizDeckId)
              setActiveUserQuizDeckId(null)
            }}
          />
        </ScreenTransition>

      )
    }

    return (

      <ScreenTransition screenKey="my-quiz-decks">
        <MyQuizDecksScreen
          onBack={() => {
            setSelectedSubject(null)
            setSelectedQuizMode(null)
          }}
          onMainMenu={goToMainMenu}
          onSelectDeck={(deckId) => setActiveUserQuizDeckId(deckId)}
        />
      </ScreenTransition>

    )
  }

  if (!started) {

    return (

      <ScreenTransition screenKey="setup">
        <SetupScreen
          title={quizTitle}
          chapters={quizChapters}
          questionCountsByChapter={quizQuestionCountsByChapter}
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
          onMainMenu={goToMainMenu}
          onStart={startPractice}
          onMastery={
            selectedSubject === "histologia"
              ? () => setShowMastery(true)
              : undefined
          }
          onContinueSession={continuePausedSession}
          onClearSession={clearPausedSession}
        />
      </ScreenTransition>

    )
  }

  if (finished) {

    return (

      <ScreenTransition screenKey="results">
        <ResultsScreen
          score={score}
          total={sessionQuestions.length}
          onReview={() => {
            if (completedAttempt) setReviewingAttempt(completedAttempt)
          }}
          onHistory={() => {
            setFinished(false)
            setStarted(false)
            setSelectedSubject(null)
            setSelectedQuizMode("history")
          }}
          onRestart={restart}
          onMainMenu={goToMainMenu}
        />
      </ScreenTransition>

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

    <ScreenTransition screenKey={`quiz-${question.id}`}>
      <QuizScreen
        key={question.id}
        question={question}
        current={current}
        total={sessionQuestions.length}
        score={score}
        previousResponse={sessionResponses.find(response => response.questionId === question.id)}
        onBack={pauseSession}
        onMainMenu={goToMainMenu}
        onCorrect={handleCorrect}
        onIncorrect={handleIncorrect}
        onAnswered={handleAnswered}
        onNext={handleNext}
      />
    </ScreenTransition>

  )
}
