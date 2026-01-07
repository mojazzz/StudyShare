const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true // ตัดช่องว่างหน้าหลังให้อัตโนมัติ
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // ห้ามซ้ำ! ใครสมัครซ้ำตีมือหัก
  },
  password: { 
    type: String, 
    required: true 
    // ตรงนี้เราจะเก็บ Hash ที่อ่านไม่รู้เรื่อง ห้ามเก็บ "123456" ตรงๆ
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);