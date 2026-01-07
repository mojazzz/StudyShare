const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware (ด่านตรวจคนเข้าเมือง)
app.use(express.json()); // อ่าน JSON ได้
app.use(cors()); // ให้ Frontend เรียกหาได้

// เชื่อมต่อ MongoDB Atlas [cite: 35, 40]
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ Connection Error:', err));

// Test Route (ลองยิงเล่นๆ ดูว่ารอดไหม)
app.get('/', (req, res) => {
  res.send('API is running... StudyShare Backend is Ready!');
});

// Start Server
const PORT = process.env.PORT || 5000;
// Routes
app.use('/api/courses', require('./routes/courses'));
app.use('/api/auth', require('./routes/auth'));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));