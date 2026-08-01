import { useMemo, useState, type ReactNode } from "react"
import { useSwipeBack } from "@/hooks/useSwipeBack"

import HomeScreen from "./components/HomeScreen"
import StudyMethodScreen from "./components/StudyMethodScreen"
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
  openQuizDecks
} from "@/content/openQuizzes"

import type {
  FlashcardSource
} from "@/lib/flashcardDecks"

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

  const [selectedSubject, setSelectedSubject] =
    useState<string | null>(null)

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
      quizSubject: selectedSubject,
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

  function handleNext() {

    if (current + 1 >= sessionQuestions.length) {

      setFinished(true)
      return
    }

    setCurrent(prev => prev + 1)
  }

  function goToMainMenu() {

    setSelectedStudyMethod(null)
    setSelectedSubject(null)

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
  }

  function goBack() {

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

      if (selectedSubject) {
        setSelectedSubject(null)
        return
      }

      setSelectedStudyMethod(null)
      return
    }

    goToMainMenu()
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


  if (!selectedStudyMethod) {

    return (

      <ScreenTransition screenKey="study-method">
        <>
          <StudyMethodScreen
            onSelectQuizzes={() => setSelectedStudyMethod("quizzes")}
            onSelectFlashcards={() => setSelectedStudyMethod("flashcards")}
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
            onSelectSubject={(subject) => setSelectedFlashcardSubject(subject)}
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

  if (!selectedSubject) {

    return (

      <ScreenTransition screenKey="home">
        <HomeScreen
          onMainMenu={goToMainMenu}
          onSelectMyQuizzes={() => {
            setSelectedSubject("my-quizzes")
            setActiveUserQuizDeckId(null)
          }}
          onSelectOpenQuizzes={() => {
            setSelectedSubject("open-quizzes")
            setActiveOpenQuizDeckId(null)
          }}
          onSelectSubject={(subject) => {
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
          />
        </ScreenTransition>
      )
    }

    return (
      <ScreenTransition screenKey="open-quiz-decks">
        <OpenQuizDecksScreen
          decks={openQuizDecks}
          onBack={() => setSelectedSubject(null)}
          onMainMenu={goToMainMenu}
          onStart={setActiveOpenQuizDeckId}
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

        <UserQuizDeckScreen
          deckId={editingUserQuizDeckId}
          onBack={() => setEditingUserQuizDeckId(null)}
          onMainMenu={goToMainMenu}
          onReview={startUserQuiz}
        />

      )
    }

    if (activeUserQuizDeckId) {

      return (

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

      )
    }

    return (

      <MyQuizDecksScreen
        onBack={() => setSelectedSubject(null)}
        onMainMenu={goToMainMenu}
        onSelectDeck={(deckId) => setActiveUserQuizDeckId(deckId)}
      />

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
        onBack={pauseSession}
        onMainMenu={goToMainMenu}
        onCorrect={handleCorrect}
        onIncorrect={handleIncorrect}
        onNext={handleNext}
      />
    </ScreenTransition>

  )
}
