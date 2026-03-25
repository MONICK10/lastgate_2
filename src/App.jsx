import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import UserInfoOverlay from "./components/UserInfoOverlay";

import Home from "./pages/Home";
import Intro from "./pages/Intro";
import Task1 from "./pages/Task1";
import Task2 from "./pages/Task2";
import Complete from "./pages/Complete";
import PixelTown from "./pages/PixelTown";
import NetworkingScreen from "./pages/NetworkingScreen";
import MissionNetworking from "./pages/MissionNetworking";
import Caesar from "./pages/caeser";
import Debug from "./pages/debug";

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <UserInfoOverlay />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/intro" element={<Intro />} />

          <Route path="/mission/task1" element={<Task1 />} />
          <Route path="/caesar" element={<Caesar />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/mission/task2" element={<Task2 />} />
          <Route path="/networking" element={<NetworkingScreen />} />
          <Route path="/missionnetworking" element={<MissionNetworking />} />
          <Route path="/complete" element={<Complete />} />
          <Route path="/pixel-town" element={<PixelTown />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
