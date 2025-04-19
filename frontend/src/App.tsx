import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Graph from "./Graph";
import "./App.css";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: 8 }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/graph">Graph</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/graph" element={<Graph />} />
      </Routes>
    </Router>
  );
}
