import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Intro from "./pages/Intro";
import Task1 from "./pages/Task1";
import Task2 from "./pages/Task2";
import Task3 from "./pages/Task3";
import Complete from "./pages/Complete";
import PixelTown from "./pages/PixelTown";
import NetworkingScreen from "./pages/NetworkingScreen";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intro" element={<Intro />} />

        <Route path="/mission/task1" element={<Task1 />} />
        <Route path="/mission/task2" element={<Task2 />} />
        <Route path="/mission/task3" element={<Task3 />} />
        <Route path="/networking" element={<NetworkingScreen />} />
        <Route path="/complete" element={<Complete />} />
        <Route path="/pixel-town" element={<PixelTown />} />
      </Routes>
    </BrowserRouter>
  );
}
