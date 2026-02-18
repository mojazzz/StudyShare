import { useState } from 'react';
import { Mail, Lock, GraduationCap, User, AlertCircle } from 'lucide-react';
import axios from 'axios'; // อย่าลืม import ตัวนี้!

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // State สำหรับเก็บข้อมูล
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // State สำหรับ Error และ Loading
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันสลับหน้า Login <-> Register แล้วเคลียร์ค่า
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const backendUrl = 'http://localhost:5000/api/auth'; // ตรวจสอบ Port Backend ดีๆ นะ

      if (isLogin) {
        // --- LOGIC: LOGIN ---
        const res = await axios.post(`${backendUrl}/login`, {
          email,
          password
        });

        // ได้ Token มาแล้ว เก็บใส่กระเป๋า (Local Storage)
        localStorage.setItem('token', res.data.token);
        // เก็บข้อมูล User ไว้โชว์เท่ๆ (ถ้าต้องการ)
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // บอก App ว่า Login ผ่านแล้ว
        onLogin();

      } else {
        // --- LOGIC: REGISTER ---
        // 1. สมัครสมาชิกก่อน
        await axios.post(`${backendUrl}/register`, {
          name,
          email,
          password
        });

        // 2. สมัครเสร็จ ล็อกอินให้อัตโนมัติเลย ไม่ต้องให้ user กรอกใหม่
        const loginRes = await axios.post(`${backendUrl}/login`, {
          email,
          password
        });

        localStorage.setItem('token', loginRes.data.token);
        localStorage.setItem('user', JSON.stringify(loginRes.data.user));
        onLogin();
      }

    } catch (err: any) {
      // ดักจับ Error จาก Backend (เช่น รหัสผิด, อีเมลซ้ำ)
      const msg = err.response?.data?.msg || err.response?.data?.error || 'Something went wrong';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">StudyShare</h1>
          <p className="text-slate-600">All course reviews, study notes, and quizzes in one place.</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-600">
              {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
            </p>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={toggleMode}
                className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}