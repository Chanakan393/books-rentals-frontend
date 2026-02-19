// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ยิง API ไปที่หลังบ้าน (รองรับทั้ง username และ email ในช่อง account)
      const res = await api.post('/auth/login', { account, password });
      
      // เก็บ Token และข้อมูล User ลงเครื่อง
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      alert('เข้าสู่ระบบสำเร็จ!');
      window.location.href = '/'; // กลับหน้าแรกและรีเฟรช Navbar
    } catch (error: any) {
      alert(error.response?.data?.message || 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">เข้าสู่ระบบ</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username หรือ Email</label>
            <input 
              type="text" required value={account} onChange={(e) => setAccount(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition mt-2">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}