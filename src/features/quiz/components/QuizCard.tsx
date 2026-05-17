import { Question } from "../../../types/quiz"

type Props = {
  question: Question
  onAnswer: (index: number) => void
}

export default function QuizCard({
  question,
  onAnswer
}: Props) {

  return (

    <div className="bg-slate-800 rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-6">
        {question.question}
      </h2>

      <div className="flex flex-col gap-3">

        {question.options.map((option, index) => (

          <button
            key={index}
            onClick={() => onAnswer(index)}
            className="bg-slate-700 hover:bg-slate-600 transition p-4 rounded-xl text-left"
          >
            {option}
          </button>

        ))}

      </div>

    </div>
  )
}
