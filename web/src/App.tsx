import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from './config'

const PRIMARY = '#6f0035'
const SECONDARY = '#531a50'

export function App() {
  const [token, setToken] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light'|'dark'>('light')
  const [passphrase, setPassphrase] = useState('')
  const [me, setMe] = useState<any>(null)
  const [lang, setLang] = useState<'ru'|'en'>('ru')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const socket = useMemo(() => token ? io(API_URL, { autoConnect: true, auth: { token } }) : null, [token])

  useEffect(() => {
    if (!socket) return
    socket.on('message', (msg) => {
      console.log('WS message', msg)
    })
    return () => { socket.close() }
  }, [socket])

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
      setMe(data.user)
    } else {
      alert('Ошибка входа')
    }
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
          <section className="card">
            <h2>{t('Привет','Hello')}, {me?.displayName || me?.username}</h2>
            <p>{t('Токен получен, WebSocket подключен. Дальше — экран чатов и профиль.','Token received, WebSocket connected. Next — chats and profile.')}</p>
          </section>
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
        .card { max-width:720px; margin:24px auto; padding:16px; border:1px solid #00000011; border-radius:12px; background: #ffffff10; }
        .row { display:flex; gap:8px; align-items:center; margin-top:8px; }
        input { flex:1; padding:8px; border:1px solid #00000022; border-radius:8px; background:transparent; color:inherit; }
        .secret { background:#00000011; padding:6px 8px; border-radius:6px; }
      `}</style>
    </div>
  )
}
