import logoImage from "@/assets/logo.png"

import BackupPanel from "@/components/BackupPanel"

type Props = {
  onSelectQuizzes: () => void
  onSelectFlashcards: () => void
}

export default function StudyMethodScreen({
  onSelectQuizzes,
  onSelectFlashcards
}: Props) {

  return (
    <main className="
      min-h-screen
      bg-[#09090b]
      p-5
      text-white
    ">
</main>
  )
}
