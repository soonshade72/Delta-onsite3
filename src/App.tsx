import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createTodo,
  deleteTodo,
  getTodos,
  login,
  logout,
  me,
  register,
  updateTodo,
} from './lib/api'
import type { Todo, User } from './lib/api'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

type View = 'overview' | 'tasks'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function check() {
      try {
        const current = await me()
        if (!ignore) setUser(current)
      } catch {
        // not logged in
      } finally {
        if (!ignore) setAuthLoading(false)
      }
    }

    void check()

    return () => {
      ignore = true
    }
  }, [])

  if (authLoading) {
    return <p className="status-page">Loading…</p>
  }

  return user === null ? (
    <AuthScreen onAuthed={setUser} />
  ) : (
    <Shell
      user={user}
      onLogout={() => {
        void logout().then(() => setUser(null))
      }}
    />
  )
}

type AuthMode = 'login' | 'register'

function AuthScreen({ onAuthed }: { onAuthed: (user: User) => void }) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const user =
        mode === 'login' ? await login(username, password) : await register(username, password)
      onAuthed(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={(e) => void submit(e)}>
        <h1>Taskwise</h1>
        <p className="auth-sub">
          {mode === 'login' ? 'Log in to your account' : 'Create an account'}
        </p>

        {error !== null && <p className="error-title form-error">{error}</p>}

        <label className="field">
          Username
          <input
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="field">
          Password
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <button
          type="button"
          className="link"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
      </form>
    </main>
  )
}

function Shell({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [view, setView] = useState<View>('overview')

  return (
    <>
      <header className="topbar">
        <nav className="nav">
          <button
            type="button"
            className={view === 'overview' ? 'nav-link active' : 'nav-link'}
            onClick={() => setView('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={view === 'tasks' ? 'nav-link active' : 'nav-link'}
            onClick={() => setView('tasks')}
          >
            Tasks
          </button>
        </nav>
        <span className="user-chip">
          {user.username}
          <button type="button" className="logout" onClick={onLogout}>
            Log out
          </button>
        </span>
      </header>

      {view === 'overview' ? <Overview onNavigate={setView} /> : <Todos />}

      <footer className="site-footer">
        <svg className="icon" role="presentation" aria-hidden="true">
          <use href="/icons.svg#documentation-icon"></use>
        </svg>
        <span>© 2026 Taskwise</span>
        <svg className="icon" role="presentation" aria-hidden="true">
          <use href="/icons.svg#github-icon"></use>
        </svg>
      </footer>
    </>
  )
}

interface OverviewProps {
  onNavigate: (view: View) => void
}

function Overview({ onNavigate }: OverviewProps) {
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Taskwise</h1>
          <p>Plan, track, and ship your team's tasks in one place.</p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Organize</h2>
          <p>Group work by project and keep everyone on the same page.</p>
          <ul>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate('tasks')
                }}
              >
                View tasks
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Collaborate</h2>
          <p>Live status updates for every task, straight from the server.</p>
          <ul>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate('tasks')
                }}
              >
                See what's new
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

function Todos() {
  const [todos, setTodos] = useState<Todo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const list = await getTodos()
        if (!ignore) {
          setTodos(list)
          setError(null)
        }
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : String(err))
      }
    }

    void load()

    return () => {
      ignore = true
    }
  }, [reloadKey])

  async function add(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError(null)
    try {
      await createTodo(trimmed)
      setTitle('')
      setReloadKey((key) => key + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  async function toggle(todo: Todo) {
    try {
      await updateTodo(todo.id, !todo.done)
      setReloadKey((key) => key + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function remove(todo: Todo) {
    try {
      await deleteTodo(todo.id)
      setReloadKey((key) => key + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <section id="dashboard">
      <h1>Your tasks</h1>

      <form className="todos-add" onSubmit={(e) => void add(e)}>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit" className="primary" disabled={busy}>
          Add
        </button>
      </form>

      {error !== null && <p className="error-title form-error">{error}</p>}

      {todos === null ? (
        <p className="status">Loading…</p>
      ) : todos.length === 0 ? (
        <p className="status">No tasks yet. Add one above.</p>
      ) : (
        <ul className="items">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.done ? 'done' : undefined}>
              <label className="todo-toggle">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => void toggle(todo)}
                />
              </label>
              <span className="item-title">{todo.title}</span>
              <button type="button" className="danger" onClick={() => void remove(todo)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default App
