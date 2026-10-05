import { useLayoutEffect, useRef, useState } from 'react'
import './appearance.css'

type Theme = 'original' | 'light' | 'graphite' | 'midnight' | 'paper'
type Accent = 'original' | 'violet' | 'blue' | 'emerald' | 'rose' | 'amber'
const storageKey = 'odontoma_appearance_v1'
const legacyStorageKey = 'odontoma-demo-appearance-v1'
let fallbackSettings: {theme: Theme; accent: Accent} = {theme:'original',accent:'original'}
const themes: { id: Theme; name: string; detail: string; bg: string; card: string; text: string }[] = [
  { id: 'original', name: 'Original', detail: 'El de siempre', bg: '#09090b', card: '#25212e', text: '#fff' },
  { id: 'light', name: 'Claro', detail: 'Limpio y luminoso', bg: '#f5f5f8', card: '#fff', text: '#252331' },
  { id: 'graphite', name: 'Grafito', detail: 'Grises suaves', bg: '#202226', card: '#303338', text: '#edf0f3' },
  { id: 'midnight', name: 'Medianoche', detail: 'Azul profundo', bg: '#0b1222', card: '#1b2942', text: '#eaf1ff' },
  { id: 'paper', name: 'Papel', detail: 'Cálido y sereno', bg: '#f0e7d7', card: '#fbf5e9', text: '#645642' },
]
const accents: {id: Accent; name: string; color: string; dark: string}[] = [
  {id:'original',name:'Original',color:'#a78bfa',dark:'#7c3aed'},
  {id:'violet',name:'Violeta',color:'#a78bfa',dark:'#7c3aed'},
  {id:'blue',name:'Azul',color:'#60a5fa',dark:'#2563eb'},
  {id:'emerald',name:'Esmeralda',color:'#34d399',dark:'#047857'},
  {id:'rose',name:'Rosa',color:'#f472b6',dark:'#be185d'},
  {id:'amber',name:'Ámbar',color:'#fbbf24',dark:'#92400e'},
]
function readSettings(): {theme: Theme; accent: Accent} {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey) ?? '{}')
    return {
      theme: themes.some(t => t.id === value.theme) ? value.theme : 'original',
      accent: accents.some(a => a.id === value.accent) ? value.accent : 'original',
    }
  } catch { return fallbackSettings }
}
function Gear(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m9 3-.7 2.4-2.4 1L3.7 6 2 9l1.8 1.7v2.6L2 15l1.7 3 2.2-.4 2.4 1L9 21h3l.7-2.4 2.4-1 2.2.4 1.7-3-1.8-1.7v-2.6L19 9l-1.7-3-2.2.4-2.4-1L12 3Z" transform="translate(1.5)"/><circle cx="12" cy="12" r="3"/></svg>}
export default function AppearanceSettings(){
  const [settings,setSettings] = useState(readSettings)
  const [open,setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const selectedTheme = themes.find(t=>t.id===settings.theme)!
  const selectedAccent = accents.find(a=>a.id===settings.accent)!
  useLayoutEffect(()=>{
    const root=document.documentElement
    root.dataset.appearanceTheme=settings.theme
    root.dataset.appearanceAccent=settings.accent
    root.dataset.appearanceLight=String(settings.theme==='light'||settings.theme==='paper')
    const light=settings.theme==='light'||settings.theme==='paper'
    const ink = settings.theme === 'paper' ? '#806546' : '#606775'
    const accentStrength = settings.theme === 'paper' ? 68 : 82
    const solidStrength = settings.theme === 'paper' ? 78 : 90
    root.style.setProperty('--oa-accent',light ? `color-mix(in srgb, ${selectedAccent.dark} ${accentStrength}%, ${ink})` : selectedAccent.color)
    root.style.setProperty('--oa-solid',light ? `color-mix(in srgb, ${selectedAccent.dark} ${solidStrength}%, ${ink})` : selectedAccent.dark)
    root.style.colorScheme=light?'light':'dark'
    fallbackSettings=settings
    try{localStorage.setItem(storageKey,JSON.stringify(settings))}catch{/* El estado sigue disponible en memoria durante esta visita. */}
  },[settings,selectedAccent])
  useLayoutEffect(()=>{
    if(open&&!dialog.current?.open)dialog.current?.showModal()
    if(!open&&dialog.current?.open)dialog.current?.close()
  },[open])
  const close=()=>{setOpen(false);trigger.current?.focus()}
  return <>
    <button ref={trigger} className="oa-trigger" onClick={()=>setOpen(true)} aria-label="Abrir ajustes de apariencia" aria-haspopup="dialog" aria-expanded={open}><Gear/><span>Apariencia</span><i style={{background:settings.accent==='original'?'linear-gradient(135deg,#a78bfa,#34d399,#fbbf24)':selectedAccent.color}}/></button>
    <dialog ref={dialog} className="oa-dialog" aria-labelledby="appearance-title" onCancel={close} onClose={()=>setOpen(false)} onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}}}>
      <div className="oa-heading"><div className="oa-heading-icon"><Gear/></div><div><p>Personaliza Odontoma</p><h2 id="appearance-title">Apariencia</h2></div><button className="oa-close" aria-label="Cerrar ajustes de apariencia" onClick={close}>×</button></div>
      <div className="oa-scroll"><div className="oa-section-heading"><h3>Tema</h3><span>{selectedTheme.name}</span></div><div className="oa-themes" role="group" aria-label="Tema de la aplicación">{themes.map(t=><button key={t.id} className={`oa-theme ${settings.theme===t.id?'is-selected':''}`} aria-pressed={settings.theme===t.id} onClick={()=>setSettings(s=>({...s,theme:t.id}))} aria-label={`Tema ${t.name}`}><div className="oa-mini" style={{background:t.bg,color:t.text}}><div className="oa-mini-title"/><div className="oa-mini-grid">{[0,1,2,3].map(n=><div key={n} style={{background:t.card}}><i style={{background:settings.accent==='original'?['#a78bfa','#34d399','#fbbf24','#60a5fa'][n]:selectedAccent.color}}/><span/></div>)}</div>{settings.theme===t.id&&<b>✓</b>}</div><strong>{t.name}</strong><small>{t.detail}</small></button>)}</div>
      <div className="oa-section-heading"><h3>Color de acento</h3><span>{selectedAccent.name}</span></div><div className="oa-accents" role="group" aria-label="Color de acento">{accents.map(a=><button key={a.id} className={settings.accent===a.id?'is-selected':''} aria-label={`Acento ${a.name}`} aria-pressed={settings.accent===a.id} onClick={()=>setSettings(s=>({...s,accent:a.id}))}><span style={{background:a.id==='original'?'conic-gradient(#a78bfa 0 25%,#34d399 25% 50%,#fbbf24 50% 75%,#60a5fa 75% 100%)':a.color}}>{settings.accent===a.id?'✓':''}</span><small>{a.name}</small></button>)}</div>
      <div className="oa-note"><span>✦</span><p>Los cambios se ven al instante.<br/><small>“Original” conserva los colores de cada sección. Las respuestas correctas e incorrectas mantienen sus colores.</small></p></div></div>
      <div className="oa-footer"><button className="oa-reset" onClick={()=>setSettings({theme:'original',accent:'original'})}>Restablecer original</button><button className="oa-done" onClick={close}>Listo <span>✓</span></button></div><p className="oa-demo-note">Tu preferencia se guarda en este navegador cuando lo permite.</p>
    </dialog>
  </>
}
