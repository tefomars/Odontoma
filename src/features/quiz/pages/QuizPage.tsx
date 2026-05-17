import { useState } from "react"

import QuizCard from "../components/QuizCard"

import { questions } from "../../../data/questions"

export default function QuizPage() {

  const [currentQuestion, setCurrentQuestion] = useState(0)

  const [score, setScore] = useState(0)

  const [finished, setFinished] = useState(false)

  const question = questions[currentQuestion]

  function handleAnswer(index: number) {

    if (index === question.correctAnswer) {
      setScore(score + 1)
    }

    const next = currentQuestion + 1

    if (next >= questions.length) {
      setFinished(true)
    } else {
      setCurrentQuestion(next)
    }
  }

  if (finished) {

    return (

      <div className="bg-slate-800 rounded-2xl p-8 text-center">

        <h2 className="text-4xl font-bold mb-4">
          Quiz terminado
        </h2>

        <p className="text-2xl">
          Score: {score}/{questions.length}
        </p>

      </div>
    )
  }

  return (

    <div className="flex flex-col gap-4">

      <div className="flex justify-between">

        <p className="text-slate-300">
          Pregunta {currentQuestion + 1}
        </p>

        <p className="text-slate-300">
          Score: {score}
        </p>

      </div>

      <QuizCard
        question={question}
        onAnswer={handleAnswer}
      />

    </div>
  )
}
