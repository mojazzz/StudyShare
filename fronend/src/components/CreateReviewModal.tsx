import { useState, useEffect } from 'react';
import { X, Star, CheckCircle, Upload } from 'lucide-react';
import axios from 'axios';
import { Course } from '../data/mockData';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ส่งฟังก์ชันมาอัปเดตหน้าจอทันทีที่โพสต์เสร็จ
  onReviewSuccess?: () => void; 
}

export default function CreateReviewModal({ isOpen, onClose, onReviewSuccess }: CreateReviewModalProps) {
  // State สำหรับ Form
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  // State สถานะ
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. โหลดรายวิชาทั้งหมดมาใส่ Dropdown (จะได้เลือกวิชาที่จะรีวิวถูก)
  useEffect(() => {
    if (isOpen) {
      axios.get('https://studyshare-g48x.onrender.com/api/courses')
        .then(res => {
            // Map ข้อมูลให้ตรงกับ format ที่เราใช้
            const mappedCourses = res.data.map((c: any) => ({
                id: c._id, 
                name: c.courseName,
                code: c.courseCode
            }));
            setCourses(mappedCourses);
        })
        .catch(err => console.error("Load courses failed", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('กรุณา Login ก่อนรีวิวนะครับ!');
        return;
      }

      // 2. ยิง API ส่งรีวิว (ต้องไปทำ Route นี้ใน Backend ด้วยนะ!)
      // สมมติว่า Backend รับ POST /api/courses/:id/reviews
      await axios.post(
        `https://studyshare-g48x.onrender.com/api/courses/${selectedCourseId}/reviews`,
        {
          rating: rating,
          comment: reviewText
        },
        {
          headers: { 'x-auth-token': token } // ส่ง Token ไปยืนยันตัวตน
        }
      );

      // สำเร็จ! โชว์หน้าเขียวๆ
      setShowSuccess(true);
      
      // อีก 2 วิ ปิด Modal เอง
      setTimeout(() => {
        resetForm();
        onClose();
        if (onReviewSuccess) onReviewSuccess();
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.msg || 'ส่งรีวิวไม่ผ่าน! Server พังหรือเปล่า?');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCourseId('');
    setRating(5);
    setReviewText('');
    setShowSuccess(false);
    setError('');
  };

  const handleClose = () => {
    if (!showSuccess) {
      resetForm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          // --- หน้าจอ Success ---
          <div className="p-8 text-center animate-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Submitted!</h2>
            <p className="text-slate-600">ขอบคุณที่แบ่งปันข้อมูลนะครับ!</p>
          </div>
        ) : (
          // --- หน้าจอ Form ---
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Create Course Review</h2>
              <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {error && <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                
                {/* เลือกวิชา */}
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">
                    Choose Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="">-- Select a Course --</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* ให้ดาว */}
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-10 h-10 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} transition-colors`} />
                      </button>
                    ))}
                    <span className="ml-2 text-slate-600 font-medium">{rating} / 5</span>
                  </div>
                </div>

                {/* เขียนรีวิว */}
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="วิชานี้เป็นยังไง? อาจารย์ใจดีไหม? ข้อสอบยากเปล่า? เล่ามาให้หมด!"
                    required
                  />
                </div>
              </div>

              {/* ปุ่ม Submit */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
                <button type="button" onClick={handleClose} className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !selectedCourseId}
                  className={`flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isLoading ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}