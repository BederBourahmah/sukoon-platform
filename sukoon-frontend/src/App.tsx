import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BlockchainProvider } from './contexts/BlockchainContext';
import HomePage from './pages/HomePage';
import './App.css'

function App() {
  return (
    <BlockchainProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </BlockchainProvider>
  );
}

export default App;
