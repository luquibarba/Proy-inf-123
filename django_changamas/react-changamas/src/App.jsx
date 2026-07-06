import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import WorkerHome from "./pages/WorkerHome/WorkerHome";
import ClientHome from "./pages/ClientHome/ClientHome";
import ChatList from "./pages/ChatList/ChatList";
import ChatRoom from "./pages/ChatRoom/ChatRoom";
import WorkerProfile from "./pages/WorkerProfile/WorkerProfile";
import ClientProfile from "./pages/ClientProfile/ClientProfile";
import ClientPublicaciones from "./pages/ClientPublicaciones/ClientPublicaciones";
import WorkerPublicaciones from "./pages/WorkerPublicaciones/WorkerPublicaciones";
import UserProfile from "./pages/UserProfile/UserProfile";
import Presentation from "./pages/Presentation/Presentation";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Presentation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/worker" element={<WorkerHome />} />
        <Route path="/client" element={<ClientHome />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chat/:id" element={<ChatRoom />} />
        <Route path="/worker/perfil" element={<WorkerProfile />} />
        <Route path="/client/perfil" element={<ClientProfile />} />
        <Route path="/client/publicaciones" element={<ClientPublicaciones />} />
        <Route path="/worker/publicaciones" element={<WorkerPublicaciones />} />
        <Route path="/perfil/usuario/:id" element={<UserProfile />} />
        <Route path="/presentation" element={<Presentation />} />
        
      </Routes>
    </AnimatePresence>
  );
}

export default App;