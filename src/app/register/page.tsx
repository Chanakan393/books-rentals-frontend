'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    username: '', email: '', password: '', phoneNumber: ''
  });

  const [addressForm, setAddressForm] = useState({
    details: '', houseNo: '', moo: '', soi: '', road: '', subDistrict: '', district: '', province: '', zipcode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🚀 1. เช็คชื่อผู้ใช้ (ห้ามเป็นตัวเลขล้วน)
    if (/^\d+$/.test(form.username.trim())) {
      alert('ชื่อผู้ใช้งานต้องมีตัวอักษรผสมอยู่ด้วย ไม่สามารถเป็นตัวเลขล้วนได้');
      return;
    }

    // 2. คลีนเบอร์โทร
    const cleanPhone = form.phoneNumber.replace(/[- ]/g, '');
    const phoneRegex = /^(06|08|09)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert('เบอร์โทรศัพท์ต้องขึ้นด้วย 06, 08, 09 และมี 10 หลักเท่านั้น');
      return;
    }

    // 3. ประกอบร่างที่อยู่ 
    const addressParts = [];
    if (addressForm.details) addressParts.push(addressForm.details);
    if (addressForm.houseNo) addressParts.push(`เลขที่ ${addressForm.houseNo}`);
    if (addressForm.moo) addressParts.push(`หมู่ ${addressForm.moo}`);
    if (addressForm.soi) addressParts.push(`ซอย${addressForm.soi}`);
    if (addressForm.road) addressParts.push(`ถนน${addressForm.road}`);
    if (addressForm.subDistrict) addressParts.push(`ต./แขวง ${addressForm.subDistrict}`);
    if (addressForm.district) addressParts.push(`อ./เขต ${addressForm.district}`);
    if (addressForm.province) addressParts.push(`จ.${addressForm.province}`);
    if (addressForm.zipcode) addressParts.push(addressForm.zipcode);

    const fullAddress = addressParts.join(' ');

    if (fullAddress.trim().length < 10) {
      alert('กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน');
      return;
    }

    try {
      await api.post('/users/register', { 
        ...form, 
        phoneNumber: cleanPhone,
        address: fullAddress 
      });
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      router.push('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg w-full max-w-2xl border border-gray-100">
        <h1 className="text-3xl font-black text-center mb-8 text-gray-800 tracking-tight">สมัครสมาชิก 📝</h1>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-blue-600 uppercase border-b pb-2">ข้อมูลบัญชีผู้ใช้</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ชื่อผู้ใช้งาน <span className="text-red-500">*</span></label>
                <input type="text" name="username" required maxLength={20} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                <input type="tel" name="phoneNumber" required placeholder="081-xxx-xxxx" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">อีเมล <span className="text-red-500">*</span></label>
                <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">รหัสผ่าน (8-20 ตัวอักษร) <span className="text-red-500">*</span></label>
                <input type="password" name="password" required minLength={8} maxLength={20} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-black text-blue-600 uppercase border-b pb-2">ที่อยู่สำหรับการจัดส่ง</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">ชื่ออาคาร / คอนโด / หมู่บ้าน / ห้อง</label>
                <input type="text" name="details" onChange={handleAddressChange} placeholder="เช่น คอนโดเอบีซี ชั้น 5 ห้อง 501" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">เลขที่ / บ้านเลขที่ <span className="text-red-500">*</span></label>
                <input type="text" name="houseNo" required onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">หมู่ที่</label>
                <input type="text" name="moo" onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ซอย</label>
                <input type="text" name="soi" onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ถนน</label>
                <input type="text" name="road" onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ตำบล / แขวง <span className="text-red-500">*</span></label>
                <input type="text" name="subDistrict" required onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">อำเภอ / เขต <span className="text-red-500">*</span></label>
                <input type="text" name="district" required onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">จังหวัด <span className="text-red-500">*</span></label>
                <input type="text" name="province" required onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">รหัสไปรษณีย์ <span className="text-red-500">*</span></label>
                <input type="text" name="zipcode" required onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition mt-4 shadow-xl shadow-blue-100 uppercase tracking-widest text-lg">
            ลงทะเบียนสมัครสมาชิก
          </button>
        </form>
      </div>
    </div>
  );
}