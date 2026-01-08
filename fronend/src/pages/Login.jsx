import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ฟังก์ชันเวลาพิมพ์ในช่อง Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันเวลากดปุ่ม Login
  const handleSubmit = async (e) => {
    e.preventDefault(); // ห้ามรีเฟรชหน้าจอ
    try {
      // ยิง API ไปที่ Backend ของเรา (Port 5000)
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // ถ้าสำเร็จ:
      console.log('ได้ Token มาแล้ว!', res.data.token);
      
      // 1. เก็บ Token ลงในเครื่อง (Local Storage)
      localStorage.setItem('token', res.data.token);
      
      // 2. เด้งไปหน้า Home (เดี๋ยวค่อยสร้าง)
      alert('Login สำเร็จ! ยินดีต้อนรับ ' + res.data.user.name);
      navigate('/'); // สั่งให้เปลี่ยนหน้า

    } catch (err) {
      // ถ้าพัง:
      setError(err.response?.data?.msg || 'Login ไม่ผ่าน! เช็คดีๆ');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Welcome Back!</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px' }}
            required 
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px' }}
            required 
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#646cff', color: 'white', border: 'none' }}>
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;