import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Documentation from './pages/DocumentationComplete'
import RegisterTool from './pages/RegisterTool'
import ToolsListing from './pages/ToolsListing'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/register" element={<RegisterTool />} />
        <Route path="/tools" element={<ToolsListing />} />
      </Routes>
    </Router>
  )
}

export default App
