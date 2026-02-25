'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    zipcode: ''
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
        setForm({
          username: res.data.username || '',
          email: res.data.email || '',
          password: '',
          phoneNumber: res.data.phoneNumber || '',
          address: res.data.address || '',
          zipcode: res.data.zipcode || ''
        });
      } catch (error) { router.push('/login'); }
    };
    fetchMe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🚀 1. เช็คชื่อผู้ใช้ (ห้ามเป็นตัวเลขล้วน + ห้ามอักษรพิเศษ)
    const trimmedUser = form.username.trim();
    if (/^\d+$/.test(trimmedUser)) {
      alert('ชื่อผู้ใช้งานต้องมีตัวอักษรผสมอยู่ด้วย ไม่สามารถเป็นตัวเลขล้วนได้');
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9ก-ฮะ-์]+$/;
    if (!usernameRegex.test(trimmedUser)) {
      alert('ชื่อผู้ใช้งานห้ามมีอักขระพิเศษหรือช่องว่าง');
      return;
    }

    // 2. ล้างช่องว่างและขีดเบอร์โทร
    const cleanPhone = form.phoneNumber.replace(/[- ]/g, '');
    const phoneRegex = /^(06|08|09)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert('เบอร์โทรศัพท์ต้องขึ้นด้วย 06, 08, 09 และมี 10 หลักเท่านั้น');
      return;
    }

    // 3. เช็คที่อยู่ (ต้องมีตัวหนังสือ และห้ามอักษรพิเศษยกเว้น / . และช่องว่าง)
    const addr = form.address.trim();
    if (addr.length < 10) {
      alert('ที่อยู่ต้องมีความยาวอย่างน้อย 10 ตัวอักษร');
      return;
    }
    if (!/[a-zA-Zก-ฮ]/.test(addr)) {
      alert('ที่อยู่ต้องมีตัวอักษรประกอบด้วย (ห้ามกรอกแค่ตัวเลข)');
      return;
    }
    const addressRegex = /^[a-zA-Z0-9ก-ฮะ-์\s./]+$/;
    if (!addressRegex.test(addr)) {
      alert('ที่อยู่ห้ามมีอักษรพิเศษ (อนุญาตเฉพาะ . และ / เท่านั้น)');
      return;
    }

    // 4. เช็ครหัสไปรษณีย์ 5 หลัก
    if (!/^\d{5}$/.test(form.zipcode)) {
      alert('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลักเท่านั้น');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { ...form, username: trimmedUser, phoneNumber: cleanPhone };
      if (!payload.password) delete payload.password;

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

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. Username (บนสุด!) */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">ชื่อผู้ใช้งาน (Username)</label>
            <input
              type="text" required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
            />
          </div>

          {/* 2. Email */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">อีเมล (Email)</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
            />
          </div>

          {/* 3. Password */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">ตั้งรหัสผ่านใหม่ (ระบุเมื่อต้องการเปลี่ยนเท่านั้น)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
              placeholder="•••••••• (8-20 ตัวอักษร)"
            />
          </div>

          {/* 4. Phone Number */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">เบอร์โทรศัพท์ติดต่อ</label>
            <input
              type="tel" required
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
              placeholder="08X-XXX-XXXX"
            />
          </div>

          {/* 5. Address */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">ที่อยู่จัดส่ง</label>
            <textarea
              rows={3} required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800 resize-none"
              placeholder="เลขที่บ้าน, ถนน, ตำบล, อำเภอ..."
            />
          </div>

          {/* 6. Zipcode (ล่างสุด!) */}
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">รหัสไปรษณีย์</label>
            <input
              type="text" required maxLength={5}
              value={form.zipcode}
              onChange={(e) => setForm({ ...form, zipcode: e.target.value })}
              className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
              placeholder="5XXXX"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 transition shadow-xl shadow-blue-100 uppercase tracking-widest disabled:bg-gray-200"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}