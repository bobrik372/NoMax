import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from './config'

const PRIMARY = '#6f0035'
const SECONDARY = '#531a50'

export function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [theme, setTheme] = useState<'light'|'dark'>(localStorage.getItem('theme') as any || 'light')
  const [passphrase, setPassphrase] = useState('')
  const [me, setMe] = useState<any>(null)
  const [lang, setLang] = useState<'ru'|'en'>(localStorage.getItem('lang') as any || 'ru')
  const [inbox, setInbox] = useState<any[]>([])
  const [active, setActive] = useState<string | null>(null) // peer username
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])
  useEffect(() => { localStorage.setItem('lang', lang) }, [lang])

  const socket = useMemo(() => token ? io(API_URL, { autoConnect: true, auth: { token } }) : null, [token])

  useEffect(() => {
    if (!socket) return
    const onMsg = (msg: any) => {
      // refresh inbox
      (async () => {
        if (token) {
          const ih = await fetch(`${API_URL}/api/inbox`, { headers: { Authorization: `Bearer ${token}` } })
          if (ih.ok) setInbox(await ih.json())
        }
      })()
      // if active chat matches, append
      if (active && (msg.senderUsername === active || msg.recipientUsername === active)) {
        setMessages((m:any[]) => [...m, { ...msg, fromMe: false }])
      }
    }
    socket.on('message', onMsg)
    return () => { socket.off('message', onMsg); socket.close() }
  }, [socket, active, token])

  async function register() {
    const r = await fetch(`${API_URL}/api/auth/register`, { method: 'POST' })
    const data = await r.json()
    setPassphrase(data.passphrase)
  }
  async function login() {
    const r = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passphrase }) })
    const data = await r.json()
    if (data.accessToken) {
      setToken(data.accessToken)
      localStorage.setItem('token', data.accessToken)
      setMe(data.user)
    } else {
      alert('Ошибка входа')
    }
  }
  function logout() {
    setToken(null); localStorage.removeItem('token'); setMe(null); setInbox([]); setActive(null); setMessages([])
  }

  // load me + inbox when authorized
  useEffect(() => {
    if (!token) return
    ;(async () => {
      const mh = await fetch(`${API_URL}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
      if (mh.ok) setMe(await mh.json())
      const ih = await fetch(`${API_URL}/api/inbox`, { headers: { Authorization: `Bearer ${token}` } })
      if (ih.ok) setInbox(await ih.json())
    })()
  }, [token])

  // open chat and load messages
  async function openChat(username: string) {
    setActive(username)
    const r = await fetch(`${API_URL}/api/messages?with=${encodeURIComponent(username)}&limit=50`, { headers: { Authorization: `Bearer ${token}` } })
    if (r.ok) setMessages(await r.json())
  }

  // send message
  async function send() {
    if (!text.trim() || !active) return
    const r = await fetch(`${API_URL}/api/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ to: active, type: 'text', text }) })
    if (r.ok) {
      const msg = await r.json();
      setMessages((m)=>[...m, { ...msg, fromMe: true }]);
      setText('')
      // refresh inbox ordering
      const ih = await fetch(`${API_URL}/api/inbox`, { headers: { Authorization: `Bearer ${token}` } })
      if (ih.ok) setInbox(await ih.json())
    }
  }

  // search user
  async function doSearch(q: string) {
    setSearch(q)
    if (!q) { setResults([]); return }
    const r = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } })
    if (r.ok) setResults(await r.json())
  }

  const t = (ru: string, en: string) => lang === 'ru' ? ru : en

  return (
    <div className="app">
      <header>
        <h1>Anubis</h1>
        <div className="spacer" />
        <select value={lang} onChange={e=>setLang(e.target.value as any)}>
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? t('Тёмная','Dark') : t('Светлая','Light')}
        </button>
      </header>
      <main>
        {!token ? (
          <section className="card">
            <h2>{t('Вход','Login')}</h2>
            <div className="row">
              <input value={passphrase} onChange={e=>setPassphrase(e.target.value)} placeholder={t('пароль-фраза','passphrase')} />
              <button onClick={login}>{t('Войти','Login')}</button>
            </div>
            <div className="row">
              <button onClick={register}>{t('Зарегистрироваться','Register')}</button>
              {passphrase && <code className="secret">{passphrase}</code>}
            </div>
          </section>
        ) : (
          <div className="layout">
            <aside>
              <div className="me">
                <div className="name">{me?.displayName || me?.username}</div>
                <button className="ghost" onClick={logout}>{t('Выйти','Logout')}</button>
              </div>
              <div className="search">
                <input value={search} onChange={e=>doSearch(e.target.value)} placeholder={t('Поиск @имени или !ника','Search @username or !nick')} />
                {!!results.length && (
                  <div className="dropdown">
                    {results.map((u)=> (
                      <div key={u.username} className="dropdown-item" onClick={()=>{ openChat(u.username); setResults([]); setSearch('') }}>
                        <b>@{u.username}</b> <span>{u.displayName}</span> <i>{u.nickname}</i>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="list">
                {inbox.map((c)=> (
                  <div key={c.chatId} className={`chat ${active===c.peer.username?'active':''}`} onClick={()=>openChat(c.peer.username)}>
                    <div className="title">{c.peer.displayName || c.peer.username}</div>
                    <div className="last">{c.lastMessage?.text || c.lastMessage?.type}</div>
                  </div>
                ))}
              </div>
            </aside>
            <section className="conversation">
              {active ? (
                <>
                  <div className="conv-header">@{active}</div>
                  <div className="messages">
                    {messages.map((m)=> (
                      <div key={m.id} className={`msg ${m.fromMe ? 'me' : 'peer'}`}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <div className="composer">
                    <input value={text} onChange={e=>setText(e.target.value)} placeholder={t('Сообщение...','Message...')} onKeyDown={(e)=>{ if(e.key==='Enter') send() }} />
                    <button onClick={send}>{t('Отправить','Send')}</button>
                  </div>
                </>
              ) : (
                <div className="empty">{t('Выберите чат или найдите пользователя','Pick a chat or search a user')}</div>
              )}
            </section>
          </div>
        )}
      </main>
      <style>{`
        :root { --primary: ${PRIMARY}; --secondary: ${SECONDARY}; --bg: #ffffff; --fg: #111; }
        :root[data-theme="dark"] { --bg: #0f0f12; --fg: #eee; }
        * { box-sizing: border-box; }
        body, html, #root { margin:0; height:100%; }
        .app { min-height:100%; background: var(--bg); color: var(--fg); font-family: Inter, system-ui, Arial; }
        header { display:flex; align-items:center; gap:12px; padding:12px 16px; border-bottom:1px solid #00000011; }
        h1 { font-size:20px; color: var(--primary); }
        .spacer { flex:1; }
        button { background: var(--primary); color:#fff; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; }
        button.ghost { background: transparent; color: var(--fg); border:1px solid #00000022; }
        .card { max-width:720px; margin:24px auto; padding:16px; border:1px solid #00000011; border-radius:12px; background: #ffffff10; }
        .row { display:flex; gap:8px; align-items:center; margin-top:8px; }
        input { flex:1; padding:8px; border:1px solid #00000022; border-radius:8px; background:transparent; color:inherit; }
        .secret { background:#00000011; padding:6px 8px; border-radius:6px; }
        .layout { display:flex; height: calc(100vh - 58px); }
        aside { width: 320px; border-right:1px solid #00000011; display:flex; flex-direction:column; }
        .me { display:flex; align-items:center; gap:8px; padding:8px; justify-content:space-between; }
        .search { padding:8px; position:relative; }
        .dropdown { position:absolute; left:8px; right:8px; top:45px; background:#fff; color:#000; border:1px solid #00000022; border-radius:8px; max-height:240px; overflow:auto; z-index:10; }
        :root[data-theme="dark"] .dropdown { background:#1e1e24; color:#fff; }
        .dropdown-item { padding:8px; cursor:pointer; border-bottom:1px solid #00000011; }
        .dropdown-item:hover { background:#0000000a; }
        .list { overflow:auto; }
        .chat { padding:10px 12px; border-bottom:1px solid #00000011; cursor:pointer; }
        .chat.active { background:#00000008; }
        .title { font-weight:600; }
        .last { font-size:12px; opacity:0.7; }
        .conversation { flex:1; display:flex; flex-direction:column; }
        .conv-header { padding:10px 12px; border-bottom:1px solid #00000011; }
        .messages { flex:1; overflow:auto; display:flex; flex-direction:column; gap:6px; padding:12px; }
        .msg { max-width:70%; padding:8px 10px; border-radius:12px; background:#00000010; align-self:flex-start; }
        .msg.me { background: var(--secondary); color:#fff; align-self:flex-end; }
        .composer { display:flex; gap:8px; padding:8px; border-top:1px solid #00000011; }
        .empty { margin:auto; opacity:0.7; }
      `}</style>
    </div>
  )
}
