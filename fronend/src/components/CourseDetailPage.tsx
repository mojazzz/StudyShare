import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Download, FileText, User, Calendar, Award, Trash2, PlusCircle } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';
import CreateReviewModal from './CreateReviewModal';
import { toast } from "sonner";

interface FileData {
  _id: string;
  fileName: string;
  filePath: string;
  uploadedBy: any;
  uploadedAt: string;
}

export default function CourseDetailPage({ onLogout }: { onLogout: () => void }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // State Modal Review
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // ✅ แก้จุดที่ 1: กันพังถ้า LocalStorage เน่า (ใช้ try-catch)
  let currentUser: any = {};
  try {
    currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    console.error("User data corrupted, please login again");
    // อาจจะสั่ง logout หรือปล่อยว่างไว้
  }

  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(res.data);
    } catch (err) {
      console.error("Error loading course:", err);
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCourseData();
  }, [id]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return toast.warning("กรุณาเลือกไฟล์ก่อนครับ!");

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/courses/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });
      toast.success("อัปโหลดเสร็จแล้วจ้า!");
      setSelectedFile(null);
      fetchCourseData();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "อัปโหลดพัง!");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (filePath: string) => {
    if (!filePath) return; // กันพังถ้าไม่มี path
    const cleanPath = filePath.replace(/^uploads[\\/]/, '');
    const url = `http://localhost:5000/uploads/${cleanPath}`;
    window.open(url, '_blank');
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("แน่ใจนะว่าจะลบไฟล์นี้? ลบแล้วกู้ไม่ได้นะ!")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/courses/${id}/files/${fileId}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success("ลบไฟล์เรียบร้อยแล้ว!");
      fetchCourseData();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "ลบไม่ได้! คุณอาจไม่ใช่เจ้าของไฟล์นี้");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("จะลบรีวิวจริงๆ เหรอ?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/courses/${id}/reviews/${reviewId}`, {
        headers: { 'x-auth-token': token }
      });
      fetchCourseData();
    } catch (err) {
      console.error(err);
      toast.error("ลบไม่ได้! คุณอาจไม่ใช่เจ้าของรีวิวนี้");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!course) return <div className="p-10 text-center">Course not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogout={onLogout} />

      <CreateReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSuccess={() => {
          fetchCourseData();
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" /> Back to Courses
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.courseName || "No Name"}</h1>
          <p className="text-indigo-600 font-bold mb-4">{course.courseCode}</p>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center gap-2 text-slate-600"><Award className="w-5 h-5 text-indigo-600" />{course.credits} Credits</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">{course.category}</span>
            <span className="flex items-center gap-2 text-slate-600"><User className="w-5 h-5 text-indigo-600" />Instructor: {course.instructor}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`w-5 h-5 ${star <= Math.round(Number(course.averageRating) || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
              ))}
            </div>
            <span className="text-slate-700 font-bold">{course.averageRating ? Number(course.averageRating).toFixed(1) : "0.0"}</span>
            <span className="text-slate-500 text-sm">({course.reviews?.length || 0} reviews)</span>
          </div>
          <hr className="my-6 border-slate-100" />
          <p className="text-slate-600 leading-relaxed">{course.fullDescription || course.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-slate-900 font-bold text-xl flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" /> Reviews
              </h2>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" /> Write Review
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {course.reviews && course.reviews.length > 0 ? (
                // ✅ แก้จุดที่ 2: .filter((r: any) => r) เพื่อกรองข้อมูลที่เป็น Null ทิ้ง กันหน้าขาว
                course.reviews.filter((r: any) => r).map((r: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        {/* ✅ ใช้ Optional Chaining (?.) กันพัง */}
                        <span className="font-bold text-slate-700 text-sm">
                          {r.user?.name || "Unknown User"}
                        </span>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mb-2">{r.comment}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>{r.postedAt ? new Date(r.postedAt).toLocaleDateString() : "-"}</span>
                      </div>
                      {/* ✅ เช็ค ID เจ้าของแบบปลอดภัย */}
                      {currentUser && currentUser.id === (r.user?._id || r.user) && (
                        <button
                          onClick={() => handleDeleteReview(r._id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="mb-2">ยังไม่มีรีวิว...</p>
                  <button onClick={() => setIsReviewModalOpen(true)} className="text-indigo-600 font-medium hover:underline">
                    เป็นคนแรกที่รีวิวสิ!
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Study Files Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
            <h2 className="text-slate-900 font-bold text-xl mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" /> Study Materials
            </h2>
            <form onSubmit={handleFileUpload} className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="text-indigo-900 font-bold mb-3 text-sm">Upload Summary Note</h3>
              <div className="mb-4">
                <input
                  type="file"
                  accept=".pdf, image/*"
                  onChange={(e) => { if (e.target.files) setSelectedFile(e.target.files[0]); }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
              </div>
              <button type="submit" disabled={uploading} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm">
                {uploading ? 'Uploading...' : 'Upload Now'}
              </button>
            </form>
            <div className="space-y-3">
              {course.files && course.files.length > 0 ? (
                // ✅ แก้จุดที่ 3: .filter((f: any) => f) กรองไฟล์เสียทิ้ง
                course.files.filter((f: any) => f).map((file: FileData) => (
                  <div key={file._id} className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-red-50 p-2 rounded-lg shrink-0"><FileText className="w-5 h-5 text-red-500" /></div>
                      <div className="min-w-0">
                        <p className="text-slate-900 font-medium truncate text-sm">{file.fileName}</p>
                        <p className="text-xs text-slate-500">
                          {/* ✅ ใช้ Optional Chaining (?.) */}
                          Uploaded by {file.uploadedBy?.name || "User"} • {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownload(file.filePath)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      {/* ✅ เช็ค ID เจ้าของแบบปลอดภัย */}
                      {currentUser && currentUser.id === (file.uploadedBy?._id || file.uploadedBy) && (
                        <button
                          onClick={() => handleDeleteFile(file._id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete File"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-6 text-sm">ยังไม่มีไฟล์สรุป... แบ่งปันเพื่อนหน่อยสิ!</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}