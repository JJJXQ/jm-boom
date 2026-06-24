import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

function App() {
  const [greetMsg, setGreetMsg] = useState('')
  const [name, setName] = useState('')

  async function greet() {
    setGreetMsg(await invoke('greet', { name }))
  }

  return (
    <main className="flex flex-col gap-2">
      <h1 className="text-xl font-bold">Welcome to Tauri + React</h1>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>
      <form
        className="row"
        onSubmit={e => {
          e.preventDefault()
          greet()
        }}
      >
        <input
          id="greet-input"
          onChange={e => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit" className="border bg-amber-500">
          Greet
        </button>
      </form>
      <p>{greetMsg}</p>
    </main>
  )
}

export default App
