'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  });

  const [addressForm, setAddressForm] = useState({
    details: '',
    houseNo: '',
    moo: '',
    soi: '',
    road: '',
    subDistrict: '',
    district: '',
    province: '',
    zipcode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. เช็คชื่อผู้ใช้ (ห้ามเป็นตัวเลขล้วน และห้ามอักษรพิเศษ)
    const trimmedUsername = form.username.trim();
    if (/^\d+$/.test(trimmedUsername)) {
      alert('ชื่อผู้ใช้งานต้องมีตัวอักษรผสมอยู่ด้วย ไม่สามารถเป็นตัวเลขล้วนได้');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9ก-๛]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      alert('ชื่อผู้ใช้งานห้ามมีอักษรพิเศษหรือช่องว่าง');
      return;
    }

    // 2. คลีนเบอร์โทร
    const cleanPhone = form.phoneNumber.replace(/[- ]/g, '');
    const phoneRegex = /^(06|08|09)\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert('เบอร์โทรศัพท์ต้องขึ้นด้วย 06, 08, 09 และมี 10 หลักเท่านั้น');
      return;
    }

    // 🚀 3. แยกตรวจที่อยู่ "ทีละกลุ่ม" ก่อนประกอบร่าง

    // กลุ่ม A: ต้องเป็น "ตัวเลขล้วน" (รหัสไปรษณีย์, หมู่ที่)
    if (!/^\d{5}$/.test(addressForm.zipcode)) {
      alert('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลักเท่านั้น');
      return;
    }
    if (addressForm.moo && !/^\d+$/.test(addressForm.moo.trim())) {
      alert('หมู่ที่ต้องเป็นตัวเลขเท่านั้น');
      return;
    }

    // กลุ่ม B: ต้องเป็น "ตัวอักษรล้วน" (ตำบล, อำเภอ, จังหวัด) -> ตัด 0-9 และ / ออกจาก Regex
    const textOnlyRegex = /^[a-zA-Zก-๛\s]+$/;
    if (!textOnlyRegex.test(addressForm.subDistrict.trim())) {
      alert('ตำบล/แขวง ต้องเป็นตัวอักษรเท่านั้น (ห้ามใส่ตัวเลข)');
      return;
    }
    if (!textOnlyRegex.test(addressForm.district.trim())) {
      alert('อำเภอ/เขต ต้องเป็นตัวอักษรเท่านั้น (ห้ามใส่ตัวเลข)');
      return;
    }
    if (!textOnlyRegex.test(addressForm.province.trim())) {
      alert('จังหวัด ต้องเป็นตัวอักษรเท่านั้น (ห้ามใส่ตัวเลข)');
      return;
    }

    // กลุ่ม C: ตัวเลขผสมตัวอักษร และ / (บ้านเลขที่)
    const houseNoRegex = /^[a-zA-Z0-9ก-๛/]+$/; // ไม่ให้มีช่องว่างในบ้านเลขที่
    if (!houseNoRegex.test(addressForm.houseNo.trim())) {
      alert('เลขที่บ้าน อนุญาตเฉพาะตัวเลข ตัวอักษร และเครื่องหมาย / เท่านั้น');
      return;
    }

    // กลุ่ม D: อื่นๆ (ชื่ออาคาร, ซอย, ถนน) -> ยอมรับตัวอักษร เลข ช่องว่าง
    const generalAddressRegex = /^[a-zA-Z0-9ก-๛\s/]*$/; // * คืออนุญาตให้เป็นค่าว่างได้
    if (!generalAddressRegex.test(addressForm.details) ||
      !generalAddressRegex.test(addressForm.soi) ||
      !generalAddressRegex.test(addressForm.road)) {
      alert('ข้อมูลที่อยู่ (อาคาร/ซอย/ถนน) ห้ามมีอักษรพิเศษนอกเหนือจาก /');
      return;
    }

    // 🚀 4. ประกอบร่างที่อยู่ (เมื่อผ่านด่านตรวจย่อยทุกด่านแล้ว)
    const addressParts = [];
    if (addressForm.details) addressParts.push(addressForm.details);
    if (addressForm.houseNo) addressParts.push(`เลขที่ ${addressForm.houseNo}`);
    if (addressForm.moo) addressParts.push(`หมู่ ${addressForm.moo}`);
    if (addressForm.soi) addressParts.push(`ซอย${addressForm.soi}`);
    if (addressForm.road) addressParts.push(`ถนน${addressForm.road}`);
    if (addressForm.subDistrict) addressParts.push(`ตำบล/แขวง ${addressForm.subDistrict}`);
    if (addressForm.district) addressParts.push(`อำเภอ/เขต ${addressForm.district}`);
    if (addressForm.province) addressParts.push(`จังหวัด ${addressForm.province}`);
    if (addressForm.zipcode) addressParts.push(addressForm.zipcode);

    const fullAddress = addressParts.join(' ').trim();

    if (fullAddress.length < 10) {
      alert('กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน (อย่างน้อย 10 ตัวอักษร)');
      return;
    }

    // 5. ส่งข้อมูลไป Backend
    try {
      await api.post('/users/register', {
        ...form,
        username: trimmedUsername,
        phoneNumber: cleanPhone,
        address: fullAddress,
        zipcode: addressForm.zipcode
      });
      alert('สมัครสมาชิกสำเร็จ!');
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
                <input type="text" name="username" required maxLength={20} value={form.username || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                <input type="tel" name="phoneNumber" required placeholder="081-xxx-xxxx" value={form.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">อีเมล <span className="text-red-500">*</span></label>
                <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">รหัสผ่าน (8-20 ตัวอักษร) <span className="text-red-500">*</span></label>
                <input type="password" name="password" required minLength={8} maxLength={20} value={form.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-black text-blue-600 uppercase border-b pb-2">ที่อยู่สำหรับการจัดส่ง</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">ชื่ออาคาร / คอนโด / หมู่บ้าน / ห้อง</label>
                <input type="text" name="details" value={addressForm.details} onChange={handleAddressChange} placeholder="เช่น คอนโดเอบีซี ชั้น 5 ห้อง 501" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">เลขที่ / บ้านเลขที่ <span className="text-red-500">*</span></label>
                <input type="text" name="houseNo" required value={addressForm.houseNo} onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">หมู่ที่</label>
                <input type="text" name="moo" value={addressForm.moo} onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ซอย</label>
                <input type="text" name="soi" value={addressForm.soi} onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ถนน</label>
                <input type="text" name="road" value={addressForm.road} onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ตำบล / แขวง <span className="text-red-500">*</span></label>
                <input type="text" name="subDistrict" required value={addressForm.subDistrict} onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">อำเภอ / เขต <span className="text-red-500">*</span></label>
                <input type="text" name="district" required value={addressForm.district} onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">จังหวัด <span className="text-red-500">*</span></label>
                <input type="text" name="province" required value={addressForm.province} onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">รหัสไปรษณีย์ <span className="text-red-500">*</span></label>
                <input type="text" name="zipcode" required value={addressForm.zipcode} onChange={handleAddressChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none bg-gray-50 focus:bg-white transition" />
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