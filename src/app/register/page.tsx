// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '', email: '', password: '', phoneNumber: '', address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/register', form);
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      router.push('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-10">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">สมัครสมาชิก</h1>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
            <input type="text" name="username" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (Email)</label>
            <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน (Password)</label>
            <input type="password" name="password" required minLength={6} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <input type="tel" name="phoneNumber" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่จัดส่ง</label>
            <textarea name="address" required onChange={handleChange} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition mt-2">
            สมัครสมาชิก
          </button>
        </form>
      </div>
    </div>
  );
}