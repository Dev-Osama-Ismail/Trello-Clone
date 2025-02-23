import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AppRouter from "./routers/AppRouter.tsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
<div className="min-h-screen bg-gray-100">
      <AppRouter />
    </div>

    </>
  )
}

export default App
