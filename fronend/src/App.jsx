import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<h1>หน้า Home (เดี๋ยวมาทำต่อ)</h1>} />
      </Routes>
    </div>
  );
}

export default App;
