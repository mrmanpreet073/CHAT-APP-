import React from 'react'
import { Routes, Route } from "react-router-dom";
import Signup from './Pages/Signup.jsx';
import Login from './Pages/Login.jsx';
import ChatPage from './Pages/ChatPage.jsx';
import { SocketProvider } from './Socket.jsx';
// import Home from './Pages/Home';
const Home = React.lazy(() => import('./Pages/Home'));

const App = () => {
  return (
    <>
      <SocketProvider >
        <Routes >
          <Route path="/" element={<Home />} />
          <Route path="/ChatPage" element={<ChatPage />} />

        </Routes>
      </SocketProvider>
      <Routes>

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

      </Routes>
    </>
  )
}

export default App
