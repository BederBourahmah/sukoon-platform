import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import HomePage from './pages/HomePage';
import './App.css'

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;
