import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Star, FileText, Calendar, BookOpen, LogOut } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';

export default function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': token }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
        // ถ้า Token หมดอายุ ให้ดีดออก
        onLogout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [onLogout, navigate]);

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-10 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onLogout={onLogout} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-center gap-6 border border-slate-100">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <User className="w-12 h-12 text-indigo-600" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{profile.user.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 mb-4">
              <Mail className="w-4 h-4" />
              <span>{profile.user.email}</span>
            </div>
            
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-2xl font-bold text-indigo-600">{profile.stats.reviewCount}</p>
                <p className="text-xs text-slate-500 font-medium">Reviews</p>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-2xl font-bold text-emerald-600">{profile.stats.fileCount}</p>
                <p className="text-xs text-slate-500 font-medium">Files Uploaded</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* My Reviews */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              My Recent Reviews
            </h2>
            {profile.myReviews.length > 0 ? (
              profile.myReviews.map((review: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div onClick={() => navigate(`/course/${review.courseId}`)} className="cursor-pointer hover:text-indigo-600">
                      <h3 className="font-bold text-slate-800">{review.courseCode}</h3>
                      <p className="text-xs text-slate-500">{review.courseName}</p>
                    </div>
                    <div className="flex bg-amber-50 px-2 py-1 rounded-md">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                      <span className="text-amber-700 font-bold text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">"{review.comment}"</p>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(review.postedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200 text-slate-500">
                You haven't written any reviews yet.
              </div>
            )}
          </div>

          {/* My Files */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              My Uploaded Files
            </h2>
            {profile.myFiles.length > 0 ? (
              profile.myFiles.map((file: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-red-50 p-2 rounded-lg shrink-0">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{file.fileName}</p>
                      <p 
                        onClick={() => navigate(`/course/${file.courseId}`)}
                        className="text-xs text-indigo-600 cursor-pointer hover:underline truncate"
                      >
                        {file.courseCode}: {file.courseName}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200 text-slate-500">
                You haven't uploaded any files yet.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}