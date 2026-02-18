import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'; // <--- 1. อย่าลืม import axios
import { Toaster } from './components/ui/sonner';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import CourseDetailPage from './components/CourseDetailPage';
import ProfilePage from './components/ProfilePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบ Token เมื่อเปิดเว็บ
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');

      // ถ้าไม่มี Token เลย ก็จบข่าว ให้ Login ใหม่
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // ยิงไปเช็คกับ Backend ว่า Token นี้ยังใช้ได้ไหม?
        // (เราใช้ Route /me เพราะมันต้องใช้ Token ในการเข้าถึง)
        await axios.get('https://studyshare-g48x.onrender.com/api/auth/me', {
          headers: { 'x-auth-token': token }
        });

        // ถ้าผ่าน (ไม่ Error) แสดงว่า Token ยังดีอยู่
        setIsAuthenticated(true);
      } catch (error) {
        // ถ้า Error (เช่น 401 Unauthorized) แสดงว่า Token หมดอายุหรือปลอม
        console.error("Token invalid or expired");
        localStorage.removeItem('token'); // ลบทิ้งไปเลย
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // โหลดเสร็จแล้ว
      }
    };

    checkToken();
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/home" 
            element={isAuthenticated ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <ProfilePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/course/:id" 
            element={isAuthenticated ? <CourseDetailPage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}

export default App;