'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ username: '', phoneNumber: '', address: '' });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
        setForm({ 
          username: res.data.username, 
          phoneNumber: res.data.phoneNumber || '',
          address: res.data.address || '' // 🏠 ดึงที่อยู่เดิมมาโชว์
        });
      } catch (error) { router.push('/login'); }
    };
    fetchMe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch(`/users/${user._id}`, form);
      localStorage.setItem('user', JSON.stringify(res.data));
      alert('บันทึกข้อมูลสำเร็จ!');
      window.location.href = '/profile';
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border p-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">📝 แก้ไขข้อมูลส่วนตัว</h1>
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">ชื่อผู้ใช้งาน</label>
            <input type="text" required value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">เบอร์โทรศัพท์</label>
            <input type="tel" value={form.phoneNumber} onChange={(e) => setForm({...form, phoneNumber: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-1">ที่อยู่จัดส่ง / ติดต่อ</label>
            <textarea rows={3} value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล..." />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 uppercase tracking-widest">
            {loading ? 'กำลังบันทึก...' : 'อัปเดตข้อมูล'}
          </button>
        </form>
      </div>
    </div>
  );
}