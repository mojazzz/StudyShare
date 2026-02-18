import { Star, BookOpen, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Course } from '../data/mockData';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-slate-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-1">{course.name}</h3>
          <p className="text-slate-600 font-medium">{course.code}</p>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-amber-700 font-bold">{course.averageRating}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
          {course.category}
        </span>
      </div>

      <p className="text-slate-600 mb-4 line-clamp-2 text-sm">{course.description}</p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1 text-slate-500">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm">{course.totalReviews} reviews</span>
        </div>
        <button
          onClick={() => navigate(`/course/${course.id}`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
}