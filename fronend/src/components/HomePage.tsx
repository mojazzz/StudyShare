import { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react'; 
import axios from 'axios';
import { Course } from '../data/mockData'; 
import CourseCard from './CourseCard';
import Navbar from './Navbar';

// ✅ แก้ไข 1: ลบ reviews และ onAddReview ออกจาก Interface
interface HomePageProps {
  onLogout: () => void;
}

// ✅ แก้ไข 2: ลบ props ที่ไม่ใช้ออกจากการรับค่า
export default function HomePage({ onLogout }: HomePageProps) {
  const [courses, setCourses] = useState<Course[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [creditFilter, setCreditFilter] = useState<string>('All');

  // ฟังก์ชันหลอกๆ สำหรับ Navbar (ถ้า Navbar ยังต้องการ prop นี้อยู่)
  const handleDummyAddReview = () => {
     console.log("Create Review from Home is disabled");
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('https://studyshare-g48x.onrender.com/api/courses');
        
        const mappedCourses = res.data.map((c: any) => ({
          id: c._id,                 
          name: c.courseName,       
          code: c.courseCode,        
          category: c.category,
          description: c.description || 'No description',
          credits: c.credits || 3,   
          fullDescription: c.description || 'No detail description',
          instructor: c.instructor || 'TBA',
          averageRating: c.averageRating || 0,
          totalReviews: c.reviews ? c.reviews.length : 0 // แก้ตรงนี้ให้ดึงจำนวนรีวิวจริง
        }));

        setCourses(mappedCourses);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesCredits = creditFilter === 'All' || course.credits.toString() === creditFilter;

    return matchesSearch && matchesCategory && matchesCredits;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ แก้ไข 3: ส่งฟังก์ชันหลอกๆ ไปให้ Navbar แทน (หรือถ้า Navbar เป็น Optional ก็ลบ prop นี้ทิ้งได้เลย) */}
      <Navbar onLogout={onLogout} onAddReview={handleDummyAddReview as any} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h2 className="text-slate-900 font-bold text-xl">Find Your Courses</h2>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course name, code, or description..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-2 font-medium">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="วิชาศึกษาทั่วไป">วิชาศึกษาทั่วไป</option>
                <option value="วิชาเลือก">วิชาเลือก</option>
                <option value="วิชาเสรี">วิชาเสรี</option>
                <option value="วิชาบังคับ">วิชาบังคับ</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-2 font-medium">Credits</label>
              <select
                value={creditFilter}
                onChange={(e) => setCreditFilter(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
              >
                <option value="All">All Credits</option>
                <option value="1">1 Credit</option>
                <option value="2">2 Credits</option>
                <option value="3">3 Credits</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-slate-600">
            Found <span className="text-indigo-600 font-bold">{filteredCourses.length}</span> {filteredCourses.length === 1 ? 'course' : 'courses'}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
           <div className="text-center py-12">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
             <p className="text-slate-500">Loading courses...</p>
           </div>
        ) : (
          /* Course List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-600 mb-2 font-medium">No courses found</h3>
            <p className="text-slate-500">Try adjusting your search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}