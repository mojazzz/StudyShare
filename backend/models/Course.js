const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true }, // รหัสวิชา [cite: 15]
  courseName: { type: String, required: true }, // ชื่อรายวิชา [cite: 14]
  category: { 
    type: String, 
    required: true,
    enum: ['วิชาบังคับ', 'วิชาเลือก', 'วิชาเสรี'] // หมวดหมู่ [cite: 16]
  },
  description: String, // รายละเอียด [cite: 18]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);