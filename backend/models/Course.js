const mongoose = require('mongoose');

// Schema ย่อย: รีวิว
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  postedAt: { type: Date, default: Date.now }
});

// Schema หลัก: รายวิชา
const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  
  // เพิ่มฟิลด์ให้ครบตาม UI
  credits: { type: Number, default: 3 },
  instructor: { type: String, default: 'Staff' },
  fullDescription: String,
  
  averageRating: { type: Number, default: 0 },

  reviews: [reviewSchema], // เก็บรีวิว

  // เก็บไฟล์สรุป
  files: [{
    fileName: String,
    filePath: String,
    fileType: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);