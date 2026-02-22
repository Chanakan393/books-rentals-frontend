'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', phoneNumber: '', address: '' });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
        setForm({ 
          username: res.data.username, 
          email: res.data.email,
          password: '',
          phoneNumber: res.data.phoneNumber || '',
          address: res.data.address || ''
        });
      } catch (error) { router.push('/login'); }
    };
    fetchMe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🚀 1. เช็คชื่อผู้ใช้ (ห้ามเป็นตัวเลขล้วน)
    if (/^\d+$/.test(form.username.trim())) {
      alert('ชื่อผู้ใช้งานต้องมีตัวอักษรผสมอยู่ด้วย ไม่สามารถเป็นตัวเลขล้วนได้');
      return;
    }

    // 2. ล้างช่องว่างและขีดออกให้เหลือแต่ตัวเลข
    const cleanPhone = form.phoneNumber.replace(/[- ]/g, '');

    // 3. เช็คเงื่อนไขอื่นๆ
    const phoneRegex = /^(06|08|09)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert('เบอร์โทรศัพท์ต้องขึ้นด้วย 06, 08, 09 และมี 10 หลักเท่านั้น');
      return;
    }
    if (form.address.trim().length < 10) {
      alert('ที่อยู่ต้องมีความยาวอย่างน้อย 10 ตัวอักษร');
      return;
    }
    if (form.password && (form.password.length < 8 || form.password.length > 20)) {
      alert('รหัสผ่านต้องมีความยาวระหว่าง 8 ถึง 20 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { ...form, phoneNumber: cleanPhone };
      if (!payload.password) {
        delete payload.password;
      }

      const res = await api.patch(`/users/${user._id}`, payload);
      localStorage.setItem('user', JSON.stringify(res.data));
      alert('บันทึกข้อมูลส่วนตัวสำเร็จ!');
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">📝</div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">แก้ไขโปรไฟล์</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest group-focus-within:text-blue-500 transition-colors">ชื่อผู้ใช้งาน (Display Name)</label>
            <input 
              type="text" required maxLength={20}
              value={form.username} 
              onChange={(e) => setForm({...form, username: e.target.value})} 
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
            />
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest group-focus-within:text-blue-500 transition-colors">อีเมล (Email)</label>
            <input 
              type="email" required 
              value={form.email} 
              onChange={(e) => setForm({...form, email: e.target.value})} 
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
            />
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest group-focus-within:text-blue-500 transition-colors">ตั้งรหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</label>
            <input 
              type="password" minLength={8} maxLength={20}
              value={form.password} 
              onChange={(e) => setForm({...form, password: e.target.value})} 
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
              placeholder="•••••••• (8-20 ตัวอักษร)"
            />
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest group-focus-within:text-blue-500 transition-colors">เบอร์โทรศัพท์ติดต่อ (06, 08, 09)</label>
            <input 
              type="tel" required
              value={form.phoneNumber} 
              onChange={(e) => setForm({...form, phoneNumber: e.target.value})} 
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
              placeholder="เช่น 081-234-5678"
            />
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest group-focus-within:text-blue-500 transition-colors">ที่อยู่สำหรับการจัดส่ง / ติดต่อ</label>
            <textarea 
              rows={4} required minLength={10}
              value={form.address} 
              onChange={(e) => setForm({...form, address: e.target.value})} 
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800 resize-none" 
              placeholder="เลขที่บ้าน, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด..." 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 transition shadow-xl shadow-blue-100 uppercase tracking-widest disabled:bg-gray-200 disabled:shadow-none"
            >
              {loading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
            <p className="text-center text-[10px] text-gray-300 font-bold uppercase mt-6 tracking-tighter italic">ระบบจะทำการตรวจสอบข้อมูลหลังบันทึก</p>
          </div>
        </form>
      </div>
    </div>
  );
}