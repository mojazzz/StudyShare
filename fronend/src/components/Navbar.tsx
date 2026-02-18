import { useState, useEffect } from 'react';
import { GraduationCap, LogOut, PlusCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateReviewModal from './CreateReviewModal';

interface NavbarProps {
  onLogout: () => void;
  onAddReview?: (review: any) => void;
}

export default function Navbar({ onLogout, onAddReview }: NavbarProps) {
  const navigate = useNavigate();
  const [isCreateReviewOpen, setIsCreateReviewOpen] = useState(false);
  
  // สร้าง State เก็บชื่อ (ค่าเริ่มต้นเป็น "My Profile" เผื่อหาไม่เจอ)
  const [userName, setUserName] = useState("My Profile");

  // ดึงชื่อจาก LocalStorage ตอนเปิด Navbar ขึ้นมา
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // ถ้ามีชื่อ ให้เอามาใส่ State (ตัดให้เหลือแค่ชื่อแรกก็ได้ถ้าชื่อยาวไป)
        if (user.name) {
            setUserName(user.name);
        }
      } catch (e) {
        console.error("หาชื่อไม่เจอ ใช้ค่าเริ่มต้นแทน");
      }
    }
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => navigate('/home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-indigo-900 tracking-tight">StudyShare</h1>
              </div>
            </button>

            {/* Menu Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateReviewOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Create Review</span>
              </button>

              {/* ✅ จุดที่แก้: โชว์ชื่อ User แทนคำว่า My Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{userName}</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <CreateReviewModal 
        isOpen={isCreateReviewOpen}
        onClose={() => setIsCreateReviewOpen(false)}
        onReviewSuccess={() => window.location.reload()}
      />
    </>
  );
}