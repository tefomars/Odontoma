import { useState } from "react"
import type { OpenQuizContent } from "@/content/openQuizzes/types"
import { groupWrittenDecks, removeWrittenCategory, setWrittenCategories } from "@/content/openQuizzes/categories"

export default function WrittenCategoriesEditor({ content, subject, onChange }: { content: OpenQuizContent; subject: string; onChange: (value: OpenQuizContent) => void }) {
  const [name, setName] = useState("")
  const categories = groupWrittenDecks(content.decks.filter(deck => deck.subject === subject), content.classes?.find(item => item.name === subject)?.categories).categories.map(({ id, name }) => ({ id, name }))
  const duplicate = categories.some(item => item.name.trim().toLocaleLowerCase("es") === name.trim().toLocaleLowerCase("es"))
  function move(index: number, direction: number) {
    const next = [...categories]
    ;[next[index], next[index + direction]] = [next[index + direction], next[index]]
    onChange(setWrittenCategories(content, subject, next))
  }
  return <details className="written-categories"><summary>Categorías y orden</summary>
    <p>Creá carpetas como Año 1, Parcial 10 o Unidad clínica. Su orden será el mismo en la app. Quitar una categoría no borra sus cuestionarios.</p>
    {categories.map((category, index) => <div className="written-category-row" key={category.id}>
      <input aria-label={`Nombre de categoría ${index + 1}`} maxLength={120} value={category.name} onChange={event => onChange(setWrittenCategories(content, subject, categories.map(item => item.id === category.id ? { ...item, name: event.target.value } : item)))}/>
      <div className="written-order-buttons">
        <button type="button" aria-label={`Subir categoría ${category.name}`} disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
        <button type="button" aria-label={`Bajar categoría ${category.name}`} disabled={index === categories.length - 1} onClick={() => move(index, 1)}>↓</button>
        <button type="button" aria-label={`Quitar categoría ${category.name}`} onClick={() => { if (window.confirm(`¿Quitar «${category.name}»? Sus cuestionarios pasarán a Sin categoría. No se borrará ninguna pregunta.`)) onChange(removeWrittenCategory(content, subject, category.id)) }}>×</button>
      </div>
    </div>)}
    <input aria-label="Nueva categoría" placeholder="Ej. Año 1 o Parcial 10" maxLength={120} value={name} onChange={event => setName(event.target.value)}/>
    <button type="button" disabled={!name.trim() || duplicate || categories.length >= 200} onClick={() => { onChange(setWrittenCategories(content, subject, [...categories, { id: `category-${crypto.randomUUID()}`, name: name.trim() }])); setName("") }}>+ Agregar categoría</button>
    {duplicate && <p role="status">Ya existe una categoría con ese nombre.</p>}
  </details>
}
