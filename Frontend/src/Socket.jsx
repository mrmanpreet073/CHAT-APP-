import { createContext, useContext } from "react";
import io from "socket.io-client";

const SocketContext = createContext();
const getSocket = () => useContext(SocketContext);

const accessToken = localStorage.getItem("accessToken");

// ✅ created once, at module load — not inside the component
const socket = io("https://chatapp-qnbg.onrender.com", {
  transports: ["websocket"],
  auth: { token: accessToken },
  withCredentials: true,
});

const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, getSocket };