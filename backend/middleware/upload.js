const multer = require('multer');
const path = require('path');

// ตั้งค่าการจัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // เก็บในโฟลเดอร์ uploads ที่เพิ่งสร้าง
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ใหม่กันซ้ำ: file-เวลาปัจจุบัน.นามสกุลเดิม
    // เช่น file-170999999.pdf
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ตัวกรองไฟล์ (เอาเฉพาะ PDF กับรูปภาพ)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('รับเฉพาะไฟล์ PDF หรือรูปภาพเท่านั้น!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // จำกัดขนาด 5MB
  fileFilter: fileFilter
});

module.exports = upload;