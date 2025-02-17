import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import HomePage from './pages/HomePage';
import './App.css'
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Router>
          <Routes>
          <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
