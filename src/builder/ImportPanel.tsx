import { useEffect, useMemo, useState } from "react"
import ImportGuide from "./ImportGuide"
import { analyzeImport, detectColumns, importFields, readImport, type ColumnMapping, type ImportedItem, type ImportDocument } from "./contentImport"
import { formatNames, type ImportKind } from "./contentFormats"

export default function ImportPanel({ kind: initialKind, existing, onConfirm, destination, incomingText }: { kind: ImportKind; existing: string[]; onConfirm: (items: ImportedItem[]) => void | boolean; destination: string; incomingText?: string }) {
  const [kind, setKind] = useState(initialKind)
  const [text, setText] = useState("")
  const [document, setDocument] = useState<ImportDocument | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [header, setHeader] = useState(false)
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [skipErrors, setSkipErrors] = useState(false)
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState("")
  const result = useMemo(() => {
    if (!document) return { rows: [], error: "" }
    try { return { rows: analyzeImport(document, kind, existing, mapping, header), error: "" } } catch (e) { return { rows: [], error: String(e) } }
  }, [document, kind, existing, mapping, header])
  const errors = result.rows.filter(r => r.error)
  const duplicates = result.rows.filter(r => r.duplicate)
  const accepted = result.rows.filter(r => r.item && (!skipDuplicates || !r.duplicate))
  const pageCount = Math.max(1, Math.ceil(result.rows.length / 20))
  const currentPage = Math.min(page, pageCount - 1)
  function parse(value = text) {
    try {
      const doc = readImport(value, kind)
      const auto = doc.table ? detectColumns(doc.table, kind) : { mapping: {}, hasHeader: false }
      setDocument(doc); setMapping(auto.mapping); setHeader(auto.hasHeader); setPage(0); setSkipErrors(false); setStatus("")
    } catch (e) { setDocument(null); setStatus(String(e)) }
  }
  // Toolbar file selection feeds the same importer, not a separate format parser.
  useEffect(() => { if (incomingText) { setText(incomingText); parse(incomingText) } }, [incomingText]) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  return <section className="studio-import-panel"><h3>Importar a {destination}</h3><p>Solo se agrega al destino indicado. Nada se aplica a la app hasta Guardar en Odontoma.</p>{(initialKind === "multiple-choice" || initialKind === "true-false") && <label>Formato de este lote<select value={kind} onChange={e => { setKind(e.target.value as ImportKind); setDocument(null) }}><option value="multiple-choice">Opción múltiple (también JSON mixto con V/F)</option><option value="true-false">Verdadero / Falso</option></select></label>}<details><summary>Formato y prompt para AI · {formatNames[kind]}</summary><ImportGuide key={kind} initialKind={kind}/></details><label>Archivo JSON, CSV, TSV o TXT<input type="file" accept=".json,.csv,.tsv,.txt,.odontoma-quiz" onChange={e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 20000000) { setStatus("El archivo supera 20 MB."); return }; void file.text().then(value => { setText(value); parse(value) }).catch(e => setStatus(String(e))); e.target.value = "" }}/></label><label>Pegar contenido<textarea rows={7} value={text} onChange={e => { setText(e.target.value); setDocument(null) }} placeholder="Pegá el JSON de tu AI o filas copiadas de Excel."/></label><button disabled={!text.trim()} onClick={() => parse()}>Revisar importación</button><p role="status">{status || result.error}</p>{document?.table && <details open><summary>Columnas del archivo</summary><label><input type="checkbox" checked={header} onChange={e => { setHeader(e.target.checked); setPage(0) }}/> La primera fila contiene encabezados</label><div className="studio-column-grid">{importFields(kind).map(([field, label]) => <label key={field}>{label}<select value={mapping[field] ?? -1} onChange={e => setMapping(m => ({ ...m, [field]: Number(e.target.value) }))}><option value={-1}>No importar esta columna</option>{Array.from({ length: Math.max(0, ...document.table!.map(r => r.length)) }, (_, i) => <option key={i} value={i}>Col. {i + 1}: {(document.table![0]?.[i] || "").slice(0, 50)}</option>)}</select></label>)}</div></details>}{document && <><p>{result.rows.length} elementos · {errors.length} con errores · {duplicates.length} posibles duplicados · {accepted.length} para agregar.</p><label><input type="checkbox" checked={skipDuplicates} onChange={e => setSkipDuplicates(e.target.checked)}/> Omitir duplicados por pregunta/frente (incluye repetidos dentro del archivo)</label>{errors.length > 0 && <label><input type="checkbox" checked={skipErrors} onChange={e => setSkipErrors(e.target.checked)}/> Omitir explícitamente {errors.length === 1 ? "la fila con error" : `las ${errors.length} filas con errores`}; no importarlas</label>}<div className="studio-import-rows">{result.rows.slice(currentPage * 20, currentPage * 20 + 20).map(r => <article key={r.row} className={r.error ? "studio-import-error" : ""}><strong>Fila {r.row}{r.duplicate ? " · Posible duplicado" : ""}</strong>{r.error ? <p role="alert">{r.error}</p> : <><p>{r.item?.question || r.item?.front || r.item?.prompt}</p>{r.item?.options?.map((o, i) => <p key={i}>{String.fromCharCode(65 + i)}. {o}{r.item?.correctAnswers?.includes(i) ? " ✓" : ""}</p>)}<p>Respuesta: {r.item?.back || r.item?.modelAnswer || r.item?.correctAnswers?.map(i => r.item?.options?.[i]).join("; ")}</p>{r.item?.explanation && <p>Explicación: {r.item.explanation}</p>}</>}</article>)}</div><nav aria-label="Páginas de importación"><button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Anterior</button><span> {currentPage + 1} / {pageCount} </span><button disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Siguiente</button></nav><button className="studio-primary" disabled={!accepted.length || !!result.error || (!!errors.length && !skipErrors)} onClick={() => { if (onConfirm(accepted.map(r => r.item!)) === false) { setStatus("No se agregó el lote. Corregí los errores indicados en el editor; la vista previa se conserva."); return }; setDocument(null); setText(""); setStatus(`Se agregaron ${accepted.length} elementos al borrador. Podés deshacer o seguir editando antes de guardar.`) }}>Agregar {accepted.length} al borrador</button><button onClick={() => setDocument(null)}>Cancelar importación</button></>}</section>
}
