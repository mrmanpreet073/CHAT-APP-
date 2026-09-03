import React from 'react'
import { Routes, Route } from "react-router-dom";
import Signup from './Pages/Signup.jsx';
import Login from './Pages/Login.jsx';
import ChatPage from './Pages/ChatPage.jsx';
// import Home from './Pages/Home';
const Home = React.lazy(() => import('./Pages/Home'));

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ChatPage" element={<ChatPage />} />
       

        {/* 404 route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </>
  )
}

export default App
