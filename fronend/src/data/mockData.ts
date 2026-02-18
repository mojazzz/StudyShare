export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  category: string;
  description: string;
  fullDescription: string;
  instructor: string;
  averageRating: number;
  totalReviews: number;
}

export interface Review {
  id: string;
  courseId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

// ข้อมูลจำลอง (Mock) เอาไว้กัน Error เวลา Backend ยังไม่ส่งข้อมูลมา
export const courses: Course[] = [];
export const reviews: Review[] = [];