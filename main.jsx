import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion, Reorder } from 'motion/react'
import * as Icons from 'lucide-react'
import './styles.css'

const PROFILE = {
  name: 'Hardik',
  role: 'AI / ML Engineer • Conversational AI • Full-stack experiments',
  location: 'India',
  bio: 'I build practical AI systems, polished product experiences, and developer tools that turn complex ideas into approachable workflows.',
  email: 'hello@hardik.dev',
  github: 'https://github.com/',
  linkedin: 'https://www.linkedin.com/',
  skills: ['Python', 'PyTorch', 'TensorFlow', 'React', 'LangChain', 'Transformers', 'FastAPI', 'SQL'],
  projects: [
    { id: 'voice-ai', name: 'Voice AI Journey Studio', subtitle: 'Conversational automation', icon: 'Mic2', color: 'violet', desc: 'Voice and chat journeys with API orchestration, prompt engineering, QA and production-minded flows.', tags: ['Voice AI', 'APIs', 'Prompt Engineering'] },
    { id: 'deepfake', name: 'DeepFake Forensics', subtitle: 'Multimedia detection', icon: 'ScanFace', color: 'cyan', desc: 'A unified framework for image and video-level deepfake generation/detection research using transfer learning.', tags: ['PyTorch', 'MobileNetV2', 'Forensics'] },
    { id: 'news', name: 'Indic News Summarizer', subtitle: 'Multilingual NLP', icon: 'Newspaper', color: 'orange', desc: 'Abstractive Hindi news summarization with a lightweight, shareable Gradio interface.', tags: ['IndicBART', 'NLP', 'Gradio'] },
    { id: 'mental', name: 'Mental Health Chatbot', subtitle: 'Safety-focused NLP', icon: 'MessageCircleHeart', color: 'emerald', desc: 'A CLI prototype combining sentiment, crisis detection and response generation into one conversational pipeline.', tags: ['DistilBERT', 'DialoGPT', 'NLP'] }
  ]
}

const DEFAULT_WIDGETS = [
  { id: 'clock', title: 'Clock', enabled: true, size: 'large', type: 'clock', city: 'Mumbai', showSeconds: false },
  { id: 'weather', title: 'Weather', enabled: true, size: 'medium', type: 'weather', city: 'Mumbai', live: true },
  { id: 'github', title: 'GitHub', enabled: true, size: 'medium', type: 'github', handle: 'EasyIce667', live: true },
  { id: 'focus', title: 'Focus', enabled: true, size: 'small', type: 'focus' },
  { id: 'now', title: 'Now Playing', enabled: true, size: 'medium', type: 'now' }
]

const DESKTOP_FILES = [
  { id: 'projects', name: 'Projects', kind: 'folder', icon: 'FolderKanban' },
  { id: 'resume', name: 'Resume', kind: 'file', icon: 'FileText' },
  { id: 'untitled', name: 'Untitled', kind: 'folder', icon: 'FolderOpen' }
]

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', icon: 'Settings2' },
  { id: 'appearance', label: 'Appearance', icon: 'Palette' },
  { id: 'desktop', label: 'Desktop & Dock', icon: 'PanelsTopLeft' },
  { id: 'widgets', label: 'Widgets', icon: 'LayoutGrid' },
  { id: 'menu', label: 'Menu Bar & Control Center', icon: 'Menu' },
  { id: 'keyboard', label: 'Keyboard', icon: 'Command' },
  { id: 'privacy', label: 'Privacy & Security', icon: 'ShieldCheck' },
  { id: 'about', label: 'About This Mac', icon: 'Info' }
]

const APP_META = {
  finder: { title: 'Finder', icon: 'FolderSearch', tint: 'blue' },
  projects: { title: 'Projects', icon: 'FolderKanban', tint: 'violet' },
  resume: { title: 'Resume', icon: 'FileUser', tint: 'orange' },
  notes: { title: 'Notes', icon: 'NotebookPen', tint: 'yellow' },
  terminal: { title: 'Terminal', icon: 'TerminalSquare', tint: 'slate' },
  safari: { title: 'Safari', icon: 'Compass', tint: 'cyan' },
  mail: { title: 'Mail', icon: 'Mail', tint: 'blue' },
  calendar: { title: 'Calendar', icon: 'CalendarDays', tint: 'red' },
  music: { title: 'Music', icon: 'Music2', tint: 'pink' },
  settings: { title: 'System Settings', icon: 'Settings2', tint: 'slate' },
  trash: { title: 'Trash', icon: 'Trash2', tint: 'slate' }
}

const APPS = ['finder', 'projects', 'resume', 'notes', 'terminal', 'safari', 'mail', 'calendar', 'music', 'settings', 'trash']

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}
function saveJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }
function cn(...v) { return v.filter(Boolean).join(' ') }
function Icon({ name, size = 18, strokeWidth = 1.8, className = '' }) {
  const C = Icons[name] || Icons.CircleHelp
  return <C size={size} strokeWidth={strokeWidth} className={className} />
}

function AppIcon({ app, size = 42, glow = true }) {
  const meta = APP_META[app] || APP_META.finder
  return (
    <motion.div whileHover={{ y: -2, scale: 1.035 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }} className={cn('app-icon', `tint-${meta.tint}`, glow && 'app-icon-glow')} style={{ '--icon-size': `${size}px` }}>
      <div className="app-icon-sheen" />
      <Icon name={meta.icon} size={Math.round(size * .48)} strokeWidth={1.85} />
    </motion.div>
  )
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  return now
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => loadJSON(key, fallback))
  useEffect(() => saveJSON(key, value), [key, value])
  return [value, setValue]
}

function Window({ app, children, rect, onChangeRect, onClose, onMinimize, onFocus, active }) {
  const dragRef = useRef(null)
  const [isMax, setIsMax] = useState(false)
  const meta = APP_META[app]
  const startDrag = (e) => {
    if (e.button !== 0 || isMax) return
    dragRef.current = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top }
    const move = (ev) => {
      if (!dragRef.current) return
      onChangeRect({ ...rect, left: Math.max(4, dragRef.current.left + ev.clientX - dragRef.current.x), top: Math.max(34, dragRef.current.top + ev.clientY - dragRef.current.y) })
    }
    const up = () => { dragRef.current = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  const displayStyle = isMax ? { left: 8, top: 34, width: 'calc(100% - 16px)', height: 'calc(100% - 92px)' } : { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
  return (
    <motion.section layout initial={{ opacity: 0, scale: .97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: 12 }} className={cn('window', active && 'window-active')} style={{ zIndex: rect.z, ...displayStyle }} onPointerDown={onFocus}>
      <div className="window-titlebar" onPointerDown={startDrag}>
        <div className="traffic-lights">
          <button className="traffic close" aria-label="Close" onClick={onClose} />
          <button className="traffic minimize" aria-label="Minimize" onClick={onMinimize} />
          <button className="traffic maximize" aria-label="Maximize" onClick={() => setIsMax(v => !v)} />
        </div>
        <div className="window-title"><AppIcon app={app} size={23} glow={false} /><span>{meta.title}</span></div>
        <div className="window-actions"><button onClick={(e) => { e.stopPropagation(); setIsMax(v => !v) }}><Icon name="Maximize2" size={14} /></button></div>
      </div>
      <div className="window-body">{children}</div>
    </motion.section>
  )
}

function MenuBar({ theme, setTheme, onSpotlight, onControlCenter, focus, toggleFocus, now, battery }) {
  return <header className="menu-bar liquid">
    <div className="menu-left">
      <button className="menu-item apple-menu"><span className="apple-mark">●</span></button>
      <span className="menu-app-name">Finder</span>
      <span className="menu-text">File</span><span className="menu-text">Edit</span><span className="menu-text">View</span><span className="menu-text">Go</span><span className="menu-text">Window</span><span className="menu-text">Help</span>
    </div>
    <div className="menu-right">
      {focus && <span className="focus-pill"><Icon name="MoonStar" size={13} /> Focus</span>}
      <Icon name="Wifi" size={15} />
      <Icon name="BatteryFull" size={16} />
      <button className="menu-icon" onClick={onSpotlight}><Icon name="Search" size={16} /></button>
      <button className="menu-icon" onClick={onControlCenter}><Icon name="SlidersHorizontal" size={16} /></button>
      <button className="menu-clock" onClick={toggleFocus}>{now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: theme.hour12 })}</button>
      <span className="battery-text">{battery}%</span>
    </div>
  </header>
}

function Widget({ widget, now, settings, setSettings }) {
  if (!widget.enabled) return null
  const rotate = () => {
    setSettings(prev => ({ ...prev, widgets: prev.widgets.map(w => w.id === widget.id ? { ...w, size: w.size === 'small' ? 'medium' : w.size === 'medium' ? 'large' : 'small' } : w) }))
  }
  return <motion.div layout className={cn('widget glass-widget', `widget-${widget.size}`)}>
    <div className="widget-top"><span className="widget-label">{widget.title}</span><button className="widget-more" onClick={rotate} title="Resize widget"><Icon name="Ellipsis" size={15} /></button></div>
    {widget.type === 'clock' && <ClockWidget now={now} widget={widget} />}
    {widget.type === 'weather' && <WeatherWidget widget={widget} allowNetwork={settings.allowNetwork} />}
    {widget.type === 'github' && <GithubWidget widget={widget} allowNetwork={settings.allowNetwork} />}
    {widget.type === 'focus' && <FocusWidget />}
    {widget.type === 'now' && <NowPlayingWidget />}
  </motion.div>
}

function ClockWidget({ now, widget }) {
  return <div className="clock-widget"><div className="clock-face"><span>{now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}</span><small>{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</small></div><div className="clock-ring" /></div>
}

function WeatherWidget({ widget, allowNetwork }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!widget.live || !allowNetwork) return
    const ctl = new AbortController()
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(widget.city || 'Mumbai')}&count=1&language=en&format=json`, { signal: ctl.signal })
      .then(r => r.json()).then(g => { const p = g.results?.[0]; if (!p) throw Error('no city'); return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,weather_code&timezone=auto`, { signal: ctl.signal }) })
      .then(r => r.json()).then(setData).catch(() => {})
    return () => ctl.abort()
  }, [widget.city, widget.live])
  return <div className="weather-widget"><div className="weather-temp">{data?.current?.temperature_2m ?? '—'}°</div><div><div className="weather-icon"><Icon name={data ? 'CloudSun' : 'Cloud'} size={34} /></div><strong>{widget.city}</strong><small>{data ? `Live • ${Math.round(data.current.temperature_2m)}°C` : 'Tap widget settings to configure'}</small></div></div>
}

function GithubWidget({ widget, allowNetwork }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!widget.live || !widget.handle || !allowNetwork) return
    fetch(`https://api.github.com/users/${encodeURIComponent(widget.handle)}`).then(r => r.ok ? r.json() : null).then(setData).catch(() => {})
  }, [widget.handle, widget.live])
  return <div className="github-widget"><div className="git-avatar"><Icon name="Github" size={28} /></div><div className="git-copy"><strong>{data?.name || widget.handle}</strong><small>{data ? `${data.public_repos} public repos • ${data.followers} followers` : 'GitHub activity'}</small><div className="sparkline"><span/><span/><span/><span/><span/><span/><span/></div></div></div>
}
function FocusWidget() { return <div className="focus-widget"><div className="focus-orb"><Icon name="MoonStar" size={23} /></div><div><strong>Deep Work</strong><small>Stay in flow</small></div><button className="mini-toggle"><span /></button></div> }
function NowPlayingWidget() { return <div className="now-playing"><div className="album-art"><Icon name="Music2" size={22} /></div><div><strong>Build mode</strong><small>Portfolio session</small></div><div className="music-bars"><i/><i/><i/><i/></div></div> }

function Desktop({ now, settings, setSettings, openApp, openSpotlight, onControlCenter, focus, toggleFocus }) {
  return <main className="desktop-stage">
    <div className="aurora aurora-a"/><div className="aurora aurora-b"/><div className="aurora aurora-c"/>
    <div className="grain"/>
    <div className="hero-copy">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="hero-eyebrow"><span className="status-dot"/> Available for thoughtful builds</motion.div>
      <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .85 }}>Hey, I’m <span>{PROFILE.name}.</span></motion.h1>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16, duration: .85 }}>{PROFILE.role}</motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24, duration: .85 }} className="hero-actions"><button onClick={() => openApp('finder')} className="hero-btn primary"><Icon name="FolderSearch" size={16}/> Explore workspace</button><button onClick={() => openApp('resume')} className="hero-btn"><Icon name="FileUser" size={16}/> View resume</button></motion.div>
    </div>
    {settings.showDesktopFiles && <div className="desktop-file-column">
      {DESKTOP_FILES.map((file, index) => <motion.button key={file.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .32 + index * .08 }} className="desktop-file" onDoubleClick={() => openApp(file.id === 'projects' ? 'projects' : file.id === 'resume' ? 'resume' : 'finder')}><div className="desktop-file-icon"><Icon name={file.icon} size={46} strokeWidth={1.65}/></div><span>{file.name}</span></motion.button>)}
    </div>}
    <Reorder.Group axis="x" values={settings.widgets.filter(w => w.enabled)} onReorder={(next) => setSettings(prev => ({ ...prev, widgets: next.concat(prev.widgets.filter(w => !w.enabled)) }))} className="widgets-row" aria-label="Desktop widgets">
      {settings.widgets.filter(w => w.enabled).map(w => <Reorder.Item value={w} key={w.id} className="widget-shell"><Widget widget={w} now={now} settings={settings} setSettings={setSettings}/></Reorder.Item>)}
    </Reorder.Group>
    <div className="desktop-shortcut-hint"><kbd>⌘</kbd><span>+</span><kbd>K</kbd> Spotlight <span className="dot-sep">•</span> <kbd>⌘</kbd><span>+</span><kbd>1</kbd> Finder</div>
  </main>
}

function AppContent({ app, openApp, settings, setSettings, notes, setNotes }) {
  if (app === 'finder') return <Finder openApp={openApp}/>
  if (app === 'projects') return <Projects openApp={openApp}/>
  if (app === 'resume') return <Resume />
  if (app === 'notes') return <Notes notes={notes} setNotes={setNotes}/>
  if (app === 'terminal') return <Terminal openApp={openApp}/>
  if (app === 'safari') return <Safari />
  if (app === 'mail') return <Mail />
  if (app === 'calendar') return <Calendar />
  if (app === 'music') return <Music />
  if (app === 'settings') return <SettingsApp settings={settings} setSettings={setSettings} />
  if (app === 'trash') return <Trash />
  return null
}

function Finder({ openApp }) {
  const [path, setPath] = useState('Desktop')
  const items = path === 'Projects' ? PROFILE.projects.map(p => ({ id: p.id, name: p.name, kind: 'project', icon: p.icon })) : DESKTOP_FILES
  return <div className="finder-app"><aside className="finder-sidebar"><div className="finder-section"><small>Favorites</small>{['Desktop','Projects','Resume','Untitled'].map(x => <button className={path === x ? 'active' : ''} key={x} onClick={() => setPath(x)}><Icon name={x === 'Desktop' ? 'Monitor' : x === 'Projects' ? 'FolderKanban' : 'FileText'} size={16}/>{x}</button>)}</div><div className="finder-section"><small>Tags</small><button><span className="tag-dot purple"/>Priority</button><button><span className="tag-dot blue"/>Work</button><button><span className="tag-dot green"/>Personal</button></div></aside><div className="finder-main"><div className="finder-toolbar"><button><Icon name="ChevronLeft"/></button><button><Icon name="ChevronRight"/></button><div className="finder-breadcrumb"><Icon name="Folder" size={14}/>{path}</div><div className="finder-spacer"/><button onClick={() => openApp('settings')}><Icon name="SlidersHorizontal"/></button></div><div className="finder-content"><div className="finder-heading"><div><span className="eyebrow">My Mac</span><h2>{path}</h2></div><button className="subtle-button"><Icon name="Grid2X2" size={15}/></button></div><div className="finder-grid">{items.map(item => <button key={item.id} className="finder-card" onDoubleClick={() => item.kind === 'folder' && setPath(item.name === 'Projects' ? 'Projects' : item.name)}><div className="file-icon-card"><Icon name={item.icon} size={40} strokeWidth={1.6}/></div><strong>{item.name}</strong><small>{item.kind === 'project' ? 'Project' : item.kind}</small></button>)}</div></div></div></div>
}
function Projects({ openApp }) { const [selected,setSelected]=useState(null); const p=PROFILE.projects.find(x=>x.id===selected); return <div className="projects-app">{p ? <div className="project-detail"><button className="subtle-button" onClick={()=>setSelected(null)}><Icon name="ChevronLeft" size={15}/> All projects</button><div className={cn('project-icon', `p-${p.color}`)}><Icon name={p.icon} size={29}/></div><span className="project-subtitle">{p.subtitle}</span><h2>{p.name}</h2><p className="project-detail-copy">{p.desc}</p><div className="detail-panels"><div><span>What I built</span><p>Problem framing, implementation, evaluation and a clear user-facing workflow treated as one system.</p></div><div><span>Stack</span><div className="project-tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div></div><div><span>Engineering note</span><p>Modular, observable and easy to iterate. The case study surface is intentionally editable for your exact metrics and links.</p></div></div></div> : <><div className="section-header"><div><span className="eyebrow">Case studies</span><h2>Projects</h2><p>Selected systems, prototypes and experiments.</p></div><button className="subtle-button" onClick={() => openApp('finder')}><Icon name="FolderSearch" size={15}/> Finder</button></div><div className="project-cards">{PROFILE.projects.map(p => <motion.button key={p.id} whileHover={{ y: -5 }} onClick={() => setSelected(p.id)} className="project-card"><div className={cn('project-icon', `p-${p.color}`)}><Icon name={p.icon} size={25}/></div><span className="project-subtitle">{p.subtitle}</span><h3>{p.name}</h3><p>{p.desc}</p><div className="project-tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div></motion.button>)}</div><div className="project-footer"><span>Built with curiosity.</span><span>{PROFILE.projects.length} selected projects</span></div></>}</div> }
function Resume() { return <div className="resume-app"><div className="resume-top"><div><span className="eyebrow">Curriculum vitae</span><h2>{PROFILE.name}</h2><p>{PROFILE.role}</p></div><button className="hero-btn primary" onClick={() => downloadResume()}><Icon name="Download" size={15}/> Export</button></div><div className="resume-grid"><section><h3>Experience</h3><article className="resume-item"><div className="resume-dot"/><div><strong>Implementation Trainee</strong><span>Engagely.ai • May 2026 — Present</span><p>Conversational AI implementation, API integration, journey configuration and QA of UAT products.</p></div></article><article className="resume-item"><div className="resume-dot muted"/><div><strong>AI / ML Intern</strong><span>Microsoft × Edunet Foundation • 2025</span><p>Worked across ML, deep learning and generative AI workflows on Azure.</p></div></article></section><section><h3>Stack</h3><div className="skill-cloud">{PROFILE.skills.map(s => <span key={s}>{s}</span>)}</div><h3 className="resume-gap">About</h3><p className="body-copy">{PROFILE.bio}</p></section></div></div> }
function downloadResume() { const text = `${PROFILE.name}\n${PROFILE.role}\n\n${PROFILE.bio}\n\nSkills: ${PROFILE.skills.join(', ')}`; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = 'Hardik-Resume.txt'; a.click() }
function Notes({ notes, setNotes }) { const [selected, setSelected] = useState(notes[0]?.id || 'welcome'); const [query, setQuery] = useState(''); const current = notes.find(n => n.id === selected); return <div className="notes-app"><aside className="notes-sidebar"><div className="notes-search"><Icon name="Search" size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search"/></div>{notes.filter(n => !query || (n.title+n.body).toLowerCase().includes(query.toLowerCase())).map(n => <button key={n.id} className={selected===n.id?'active':''} onClick={() => setSelected(n.id)}><strong>{n.title}</strong><small>{n.body.slice(0,48)}</small></button>)}<button className="add-note" onClick={() => { const id = `${Date.now()}`; setNotes([...notes, { id, title: 'New note', body: '' }]); setSelected(id) }}><Icon name="Plus" size={16}/> New note</button></aside><div className="note-editor">{current && <><input className="note-title" value={current.title} onChange={e => setNotes(notes.map(n => n.id===current.id ? {...n,title:e.target.value}:n))}/><textarea value={current.body} onChange={e => setNotes(notes.map(n => n.id===current.id ? {...n,body:e.target.value}:n))} placeholder="Start writing…"/><div className="note-footer"><span>Saved locally</span><span>{current.body.length} characters</span></div></>}</div></div> }
function Terminal() { const [lines, setLines] = useState(['Last login: interactive portfolio', 'hardik@mac ~ % whoami', 'hardik', 'hardik@mac ~ % ls', 'Applications  Projects  Resume  Untitled']); const [value, setValue] = useState(''); const submit = (e) => { e.preventDefault(); const cmd=value.trim(); if(!cmd)return; let out=''; if(cmd==='help')out='Available: whoami, skills, projects, clear, date'; else if(cmd==='skills')out=PROFILE.skills.join('  ·  '); else if(cmd==='projects')out=PROFILE.projects.map(p=>p.name).join('\n'); else if(cmd==='date')out=new Date().toString(); else if(cmd==='clear'){setLines([]);setValue('');return} else out=`zsh: command not found: ${cmd}`; setLines(l=>[...l,`hardik@mac ~ % ${cmd}`,out]);setValue('')}; return <div className="terminal-app"><div className="terminal-traffic"><i/><i/><i/><span>zsh — hardik</span></div><div className="terminal-output">{lines.map((l,i)=><div key={i} className={l.startsWith('hardik@')?'cmdline':''}>{l}</div>)}</div><form onSubmit={submit} className="terminal-form"><span>›</span><input autoFocus value={value} onChange={e=>setValue(e.target.value)}/></form></div> }
function Safari(){ return <div className="browser-app"><div className="browser-bar"><Icon name="Lock" size={13}/><input defaultValue="hardik.dev / selected work"/><button><Icon name="RefreshCw" size={14}/></button></div><div className="browser-page"><span className="eyebrow">Safari preview</span><h2>Designing systems that feel human.</h2><p>A calm reading surface for project stories, notes and ideas—inside the portfolio OS itself.</p><div className="browser-cards"><div/><div/><div/></div></div></div> }
function Mail(){ return <div className="mail-app"><aside><div className="mail-user"><div className="avatar">H</div><div><strong>Hardik</strong><small>Inbox</small></div></div>{['Inbox','Starred','Drafts','Sent'].map((x,i)=><button className={i===0?'active':''} key={x}><Icon name={i===0?'Inbox':i===1?'Star':'FileEdit'} size={15}/>{x}<span>{i===0?'3':''}</span></button>)}</aside><div className="mail-list">{['A thoughtful project needs a good story','Portfolio feedback','Welcome to the workspace'].map((x,i)=><article key={x}><div className="mail-line"><strong>{['You','Design Notes','System'][i]}</strong><span>{i===0?'09:42':'Yesterday'}</span></div><h4>{x}</h4><p>{['Your case study surface is ready for a deeper pass…','A few ideas to push the glass treatment further.','The workspace has been configured with local preferences.'][i]}</p></article>)}</div></div> }
function Calendar(){ const days = Array.from({length: 35},(_,i)=>i-2); return <div className="calendar-app"><div className="calendar-header"><div><span className="eyebrow">October 2026</span><h2>Calendar</h2></div><div className="calendar-actions"><button><Icon name="ChevronLeft"/></button><button><Icon name="ChevronRight"/></button></div></div><div className="calendar-grid head">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><span key={d}>{d}</span>)}</div><div className="calendar-grid">{days.map((d,i)=><div key={i} className={cn('calendar-cell', d===7 && 'today')}>{d>0&&d<=31?<>{d}{d===9&&<small>Sync meeting</small>}</>:null}</div>)}</div></div> }
function Music(){ return <div className="music-app"><div className="music-hero"><div className="album-big"><Icon name="Music2" size={52}/></div><div><span className="eyebrow">Now playing</span><h2>Build Mode</h2><p>Focus mix · 42 min remaining</p><div className="progress"><span/></div></div></div><div className="music-list">{['Glow in the Code','Quiet Architecture','Midnight Merge','Ship It'].map((x,i)=><button key={x}><span>{i+1}</span><strong>{x}</strong><small>{['Lo-fi','Ambient','Electronic','Instrumental'][i]}</small><Icon name={i===0?'Volume2':'MoreHorizontal'} size={15}/></button>)}</div></div> }
function Trash(){ return <div className="empty-app"><div className="empty-icon"><Icon name="Trash2" size={34}/></div><h2>Trash is Empty</h2><p>Your deleted portfolio files will appear here.</p></div> }

function SettingsApp({ settings, setSettings }) {
  const [section, setSection] = useState('general')
  const [search, setSearch] = useState('')
  const sections = SETTINGS_SECTIONS.filter(s => s.label.toLowerCase().includes(search.toLowerCase()))
  const update = (patch) => setSettings(prev => ({...prev,...patch}))
  return <div className="settings-app"><aside className="settings-sidebar"><div className="settings-profile"><div className="settings-avatar">H</div><div><strong>Hardik</strong><small>Apple Account</small></div></div><div className="settings-search"><Icon name="Search" size={14}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search"/></div>{sections.map(s=> <button className={section===s.id?'active':''} key={s.id} onClick={()=>setSection(s.id)}><span className="settings-list-icon"><Icon name={s.icon} size={15}/></span>{s.label}</button>)}</aside><div className="settings-main"><AnimatePresence mode="wait"><motion.div key={section} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.18}}>{section==='general'&&<GeneralSettings settings={settings} update={update}/>} {section==='appearance'&&<AppearanceSettings settings={settings} update={update}/>} {section==='desktop'&&<DesktopSettings settings={settings} update={update}/>} {section==='widgets'&&<WidgetSettings settings={settings} update={update}/>} {section==='menu'&&<MenuSettings settings={settings} update={update}/>} {section==='keyboard'&&<KeyboardSettings/>} {section==='privacy'&&<PrivacySettings settings={settings} update={update}/>} {section==='about'&&<AboutSettings/>}</motion.div></AnimatePresence></div></div>
}
function SettingHeader({ eyebrow='Settings', title, subtitle }) { return <div className="settings-header"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div> }
function SettingRow({ title, desc, children }) { return <div className="setting-row"><div><strong>{title}</strong><p>{desc}</p></div>{children}</div> }
function Toggle({ on, setOn }) { return <button className={cn('toggle',on&&'on')} onClick={()=>setOn(!on)}><span/></button> }
function GeneralSettings({settings,update}) { return <div><SettingHeader title="General" subtitle="Name, language, clock and workspace preferences."/><div className="setting-group"><SettingRow title="Portfolio name" desc="Shown in the menu bar and welcome surface."><input className="settings-input" value={settings.portfolioName} onChange={e=>update({portfolioName:e.target.value})}/></SettingRow><SettingRow title="Reduced motion" desc="Tone down large transitions and hover motion."><Toggle on={settings.reducedMotion} setOn={v=>update({reducedMotion:v})}/></SettingRow><SettingRow title="24-hour clock" desc="Use a 24-hour format in the system clock."><Toggle on={!settings.hour12} setOn={v=>update({hour12:!v})}/></SettingRow></div></div> }
function AppearanceSettings({settings,update}) { return <div><SettingHeader title="Appearance" subtitle="Glass, wallpaper, icons and accent color."/><div className="setting-group"><SettingRow title="Appearance" desc="Choose how the portfolio workspace looks."><div className="segmented">{['light','dark','system'].map(t=><button key={t} className={settings.theme===t?'active':''} onClick={()=>update({theme:t})}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div></SettingRow><SettingRow title="Accent color" desc="Changes controls, selection and glow treatments."><div className="accent-row">{['#7c83ff','#33b5ff','#18c68a','#ff9d45','#ff5f8f'].map(c=><button key={c} style={{background:c}} className={settings.accent===c?'accent-selected':''} onClick={()=>update({accent:c})}/>)}</div></SettingRow><SettingRow title="Liquid Glass intensity" desc="Tune translucency and surface depth."><input className="range" type="range" min="0" max="100" value={settings.glassIntensity} onChange={e=>update({glassIntensity:+e.target.value})}/></SettingRow><SettingRow title="Wallpaper" desc="Switch between the built-in abstract Aurora scenes."><select className="settings-select" value={settings.wallpaper} onChange={e=>update({wallpaper:e.target.value})}><option value="aurora">Aurora</option><option value="midnight">Midnight</option><option value="sunrise">Sunrise</option></select></SettingRow></div></div> }
function DesktopSettings({settings,update}) { return <div><SettingHeader title="Desktop & Dock" subtitle="Make the desktop feel like your own workspace."/><div className="setting-group"><SettingRow title="Dock magnification" desc="Enlarge icons as your cursor approaches them."><Toggle on={settings.dockMagnify} setOn={v=>update({dockMagnify:v})}/></SettingRow><SettingRow title="Auto-hide Dock" desc="Keep the bottom edge distraction-free until needed."><Toggle on={settings.dockAutohide} setOn={v=>update({dockAutohide:v})}/></SettingRow><SettingRow title="Dock size" desc="Adjust the scale of application icons."><input className="range" type="range" min="52" max="86" value={settings.dockSize} onChange={e=>update({dockSize:+e.target.value})}/></SettingRow><SettingRow title="Desktop files" desc="Show the Projects, Resume and Untitled shortcuts."><Toggle on={settings.showDesktopFiles} setOn={v=>update({showDesktopFiles:v})}/></SettingRow></div></div> }
function WidgetSettings({settings,update}) { return <div><SettingHeader title="Widgets" subtitle="Configure live cards and drag them into your favorite order."/><div className="widget-settings-list">{settings.widgets.map((w,index)=><div key={w.id} className="widget-setting-card"><div className="widget-setting-icon"><Icon name={w.type==='clock'?'Clock3':w.type==='weather'?'CloudSun':w.type==='github'?'Github':w.type==='focus'?'MoonStar':'Music2'} size={19}/></div><div className="widget-setting-main"><strong>{w.title}</strong><small>{w.type==='weather'?`Location: ${w.city}`:w.type==='github'?`Account: ${w.handle}`:'Interactive desktop widget'}</small></div><div className="widget-setting-actions"><button onClick={()=>update({widgets:settings.widgets.map(x=>x.id===w.id?{...x,size:x.size==='small'?'medium':x.size==='medium'?'large':'small'}:x)})}>{w.size}</button>{w.type==='weather'&&<input className="widget-config-input" value={w.city||''} onChange={e=>update({widgets:settings.widgets.map(x=>x.id===w.id?{...x,city:e.target.value}:x)})} placeholder="City"/>}{w.type==='github'&&<input className="widget-config-input" value={w.handle||''} onChange={e=>update({widgets:settings.widgets.map(x=>x.id===w.id?{...x,handle:e.target.value}:x)})} placeholder="GitHub handle"/>}{(w.type==='weather'||w.type==='github')&&<Toggle on={w.live!==false} setOn={v=>update({widgets:settings.widgets.map(x=>x.id===w.id?{...x,live:v}:x)})}/>}<Toggle on={w.enabled} setOn={v=>update({widgets:settings.widgets.map(x=>x.id===w.id?{...x,enabled:v}:x)})}/></div></div>)}<button className="add-widget-button" onClick={()=>{const id=`custom-${Date.now()}`;update({widgets:[...settings.widgets,{id,title:'Custom Widget',enabled:true,size:'medium',type:'focus'}]})}}><Icon name="Plus" size={15}/> Add a widget</button></div></div> }
function MenuSettings({settings,update}) { return <div><SettingHeader title="Menu Bar & Control Center" subtitle="Pick the system chrome you want to see."/><div className="setting-group"><SettingRow title="Liquid menu bar" desc="Apply the transparent glass surface to the top bar."><Toggle on={settings.liquidMenuBar} setOn={v=>update({liquidMenuBar:v})}/></SettingRow><SettingRow title="Battery percentage" desc="Show the current battery level beside the status icons."><Toggle on={settings.showBattery} setOn={v=>update({showBattery:v})}/></SettingRow><SettingRow title="Status icons" desc="Show Wi-Fi, battery, search and Control Center affordances."><Toggle on={settings.showStatusIcons} setOn={v=>update({showStatusIcons:v})}/></SettingRow></div></div> }
function KeyboardSettings(){ return <div><SettingHeader title="Keyboard" subtitle="Useful shortcuts built into the portfolio OS."/><div className="shortcut-grid">{[['⌘ K','Spotlight'],['⌘ 1','Finder'],['⌘ 2','Notes'],['⌘ 3','Projects'],['⌘ ,','Settings'],['Esc','Close panels']].map(([k,v])=><div key={v}><kbd>{k}</kbd><span>{v}</span></div>)}</div></div> }
function PrivacySettings({settings,update}) { return <div><SettingHeader title="Privacy & Security" subtitle="Control what external data sources the portfolio may use."/><div className="setting-group"><SettingRow title="Live widgets" desc="Allow Weather and GitHub widgets to request public API data."><Toggle on={settings.allowNetwork} setOn={v=>update({allowNetwork:v})}/></SettingRow><SettingRow title="Location for weather" desc="Use browser location only when you opt into it."><Toggle on={settings.useLocation} setOn={v=>update({useLocation:v})}/></SettingRow></div></div> }
function AboutSettings(){ return <div><SettingHeader eyebrow="About This Mac" title="Hardik’s Mac" subtitle="An interactive portfolio, built to feel like a place you can explore."/><div className="about-card"><AppIcon app="settings" size={74}/><div><h3>macOS Portfolio</h3><p>React 19.3 · Vite 8 · Tailwind CSS 4 · Motion · Lucide React</p></div></div><div className="system-stats"><span>Memory <b>8 GB</b></span><span>Graphics <b>Liquid Surface Engine</b></span><span>Version <b>2.0.0</b></span></div></div> }

function Spotlight({ open, close, openApp }) { const [q,setQ]=useState(''); const items=useMemo(()=>[{name:'Finder',desc:'Browse workspace',icon:'finder',action:()=>openApp('finder')},{name:'Projects',desc:'Open case studies',icon:'projects',action:()=>openApp('projects')},{name:'Resume',desc:'View CV',icon:'resume',action:()=>openApp('resume')},{name:'Notes',desc:'Write locally',icon:'notes',action:()=>openApp('notes')},{name:'Settings',desc:'Customize workspace',icon:'settings',action:()=>openApp('settings')},{name:'Terminal',desc:'Try shell commands',icon:'terminal',action:()=>openApp('terminal')}].filter(x=>(x.name+x.desc).toLowerCase().includes(q.toLowerCase())).slice(0,6),[q,openApp]); return <AnimatePresence>{open&&<motion.div className="spotlight-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>e.target===e.currentTarget&&close()}><motion.div initial={{opacity:0,scale:.96,y:-12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.96,y:-8}} className="spotlight-modal liquid"><div className="spotlight-top"><Icon name="Search" size={21}/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search apps, files, commands…" onKeyDown={e=>{if(e.key==='Escape')close();if(e.key==='Enter'&&items[0]){items[0].action();close()}}}/><kbd>ESC</kbd></div><div className="spotlight-items">{items.map((x,i)=><button key={x.name} className={i===0?'selected':''} onClick={()=>{x.action();close()}}><AppIcon app={x.icon} size={35}/><span><strong>{x.name}</strong><small>{x.desc}</small></span><Icon name="ArrowUpRight" size={14}/></button>)}</div><div className="spotlight-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span></div></motion.div></motion.div>}</AnimatePresence> }

function ControlCenter({ open, close, settings, setSettings, focus, toggleFocus }) { return <AnimatePresence>{open&&<motion.aside initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:24}} className="control-center liquid"><div className="cc-header"><strong>Control Center</strong><button onClick={close}><Icon name="X" size={16}/></button></div><div className="cc-grid"><button className={cn('cc-tile',settings.wifi&&'active')} onClick={()=>setSettings(s=>({...s,wifi:!s.wifi}))}><Icon name="Wifi" size={20}/><span>Wi-Fi</span><small>{settings.wifi?'Connected':'Off'}</small></button><button className={cn('cc-tile',settings.bluetooth&&'active')} onClick={()=>setSettings(s=>({...s,bluetooth:!s.bluetooth}))}><Icon name="Bluetooth" size={20}/><span>Bluetooth</span><small>{settings.bluetooth?'On':'Off'}</small></button><button className={cn('cc-tile',focus&&'active')} onClick={toggleFocus}><Icon name="MoonStar" size={20}/><span>Focus</span><small>{focus?'On':'Off'}</small></button><button className="cc-tile"><Icon name="Airplay" size={20}/><span>Display</span><small>Built-in</small></button></div><label className="slider-row"><span>Brightness</span><input type="range" value={settings.brightness} onChange={e=>setSettings(s=>({...s,brightness:+e.target.value}))}/></label><label className="slider-row"><span>Volume</span><input type="range" value={settings.volume} onChange={e=>setSettings(s=>({...s,volume:+e.target.value}))}/></label><button className="cc-settings" onClick={()=>{close();window.dispatchEvent(new CustomEvent('open-app',{detail:'settings'}))}}><Icon name="Settings2" size={15}/> System Settings</button></motion.aside>}</AnimatePresence> }

function Dock({ openApp, settings, setSettings, windows }) { return <motion.nav className={cn('dock',settings.dockAutohide&&'dock-autohide')} style={{'--dock-size':`${settings.dockSize}px`}} onMouseEnter={e=>e.currentTarget.classList.add('dock-hover')} onMouseLeave={e=>e.currentTarget.classList.remove('dock-hover')}>
  {APPS.map(app => <button key={app} className={cn('dock-item', windows[app] ? 'running':'')} onClick={()=>openApp(app)} title={APP_META[app].title}><AppIcon app={app} size={settings.dockMagnify ? 50 : 44}/>{windows[app]&&<i/>}</button>)}
</motion.nav> }

function Toasts({ toasts }) { return <div className="toast-stack">{toasts.map(t=><motion.div key={t.id} initial={{opacity:0,y:12,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:12}} className="toast liquid"><Icon name="Sparkles" size={16}/><span>{t.text}</span></motion.div>)}</div> }

function App() {
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const [settings,setSettings] = usePersistentState('hardik-macos-settings', { theme:'dark', accent:'#7c83ff', glassIntensity:78, wallpaper:'aurora', portfolioName:'Hardik', reducedMotion:false, hour12:true, dockMagnify:true, dockAutohide:false, dockSize:64, showDesktopFiles:true, liquidMenuBar:true, showBattery:true, showStatusIcons:true, allowNetwork:true, useLocation:false, brightness:82, volume:64, wifi:true, bluetooth:true, widgets:DEFAULT_WIDGETS })
  const [notes,setNotes] = usePersistentState('hardik-macos-notes', [{id:'welcome',title:'Welcome',body:'Welcome to my portfolio OS.\n\nTry Finder, drag the widgets, open Settings, or hit ⌘K.'},{id:'ideas',title:'Ideas',body:'— Make every interaction feel intentional.\n— Keep the glass subtle.\n— Tell stories through case studies.'}])
  const [windows,setWindows] = useState({})
  const [spotlightOpen,setSpotlightOpen] = useState(false)
  const [controlOpen,setControlOpen] = useState(false)
  const [focus,setFocus] = useState(false)
  const [toasts,setToasts] = useState([])
  const [battery] = useState(97)
  const now=useClock()

  const theme = settings.theme === 'system' ? systemTheme : settings.theme
  useEffect(()=>{ document.documentElement.dataset.theme=theme; document.documentElement.style.setProperty('--accent',settings.accent); document.documentElement.style.setProperty('--glass-intensity',settings.glassIntensity/100); document.documentElement.style.setProperty('--brightness',settings.brightness/82); document.body.dataset.wallpaper=settings.wallpaper },[theme,settings])

  const toast=useCallback(text=>{const id=Date.now();setToasts(t=>[...t,{id,text}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),2500)},[])
  const openApp=useCallback(app=>{ setWindows(w=>{ const z=Math.max(10,...Object.values(w).map(x=>x.z||10))+1; const existing=w[app]; return {...w,[app]: existing ? {...existing,z,minimized:false} : {left:70+(Object.keys(w).length%4)*34,top:72+(Object.keys(w).length%3)*28,width:app==='settings'?900:app==='finder'?920:app==='notes'?860:760,height:app==='settings'?610:app==='terminal'?520:560,z,minimized:false} } }); window.dispatchEvent(new CustomEvent('portfolio-toast',{detail:`Opened ${APP_META[app]?.title||app}`})) },[])
  const closeApp=app=>setWindows(w=>{const n={...w};delete n[app];return n})
  const minimizeApp=app=>setWindows(w=>({...w,[app]:{...w[app],minimized:true}}))
  const focusApp=app=>setWindows(w=>{const z=Math.max(10,...Object.values(w).map(x=>x.z||10))+1;return {...w,[app]:{...w[app],z,minimized:false}}})
  useEffect(()=>{ const on=e=>toast(e.detail); const onOpen=e=>openApp(e.detail); window.addEventListener('portfolio-toast',on); window.addEventListener('open-app',onOpen); return()=>{window.removeEventListener('portfolio-toast',on);window.removeEventListener('open-app',onOpen)} },[openApp,toast])
  useEffect(()=>{ const handler=e=>{ const cmd=e.metaKey||e.ctrlKey; if(cmd&&e.key.toLowerCase()==='k'){e.preventDefault();setSpotlightOpen(true)} if(cmd&&e.key==='1'){e.preventDefault();openApp('finder')} if(cmd&&e.key==='2'){e.preventDefault();openApp('notes')} if(cmd&&e.key==='3'){e.preventDefault();openApp('projects')} if(cmd&&e.key===','){e.preventDefault();openApp('settings')} if(e.key==='Escape'){setSpotlightOpen(false);setControlOpen(false)} }; window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[openApp])
  return <div className={cn('portfolio-os',settings.reducedMotion&&'reduced-motion')}>
    <MenuBar theme={settings} onSpotlight={()=>setSpotlightOpen(true)} onControlCenter={()=>setControlOpen(v=>!v)} focus={focus} toggleFocus={()=>{setFocus(v=>!v);toast(!focus?'Focus is on':'Focus is off')}} now={now} battery={battery}/>
    <Desktop now={now} settings={settings} setSettings={setSettings} openApp={openApp} openSpotlight={()=>setSpotlightOpen(true)} onControlCenter={()=>setControlOpen(v=>!v)} focus={focus} toggleFocus={()=>setFocus(v=>!v)}/>
    {settings.showDesktopFiles===false && null}
    <AnimatePresence>{Object.entries(windows).map(([app,rect])=>!rect.minimized&&<Window key={app} app={app} rect={rect} active={Math.max(...Object.values(windows).map(x=>x.z||10))===rect.z} onFocus={()=>focusApp(app)} onClose={()=>closeApp(app)} onMinimize={()=>minimizeApp(app)} onChangeRect={next=>setWindows(w=>({...w,[app]:next}))}><AppContent app={app} openApp={openApp} settings={settings} setSettings={setSettings} notes={notes} setNotes={setNotes}/></Window>)}</AnimatePresence>
    <Dock openApp={openApp} settings={settings} setSettings={setSettings} windows={windows}/>
    <Spotlight open={spotlightOpen} close={()=>setSpotlightOpen(false)} openApp={openApp}/>
    <ControlCenter open={controlOpen} close={()=>setControlOpen(false)} settings={settings} setSettings={setSettings} focus={focus} toggleFocus={()=>setFocus(v=>!v)}/>
    <Toasts toasts={toasts}/>
  </div>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
