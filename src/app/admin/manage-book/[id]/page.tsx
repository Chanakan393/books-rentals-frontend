'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function ManageBookPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';

  const [loading, setLoading] = useState(false);
  const [imageType, setImageType] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    coverImage: '',
    stock: { total: 0, available: 0 },
    pricing: { day3: 0, day5: 0, day7: 0 }
  });

  // ตรวจสอบความถูกต้องของสต็อก (ห้ามพร้อมใช้งาน > สต็อกทั้งหมด)
  const isStockInvalid = form.stock.available > form.stock.total;

  useEffect(() => {
    if (isEdit) {
      const fetchBook = async () => {
        try {
          const res = await api.get(`/books/${params.id}`);
          setForm(res.data);
          // ถ้าเป็น path ที่ขึ้นต้นด้วย /uploads แสดงว่าเป็นโหมด File
          if (res.data.coverImage?.startsWith('/uploads')) {
            setImageType('file');
          }
        } catch (error) {
          alert('ไม่พบข้อมูลหนังสือ');
          router.push('/');
        }
      };
      fetchBook();
    }
  }, [isEdit, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🚀 ดักจับ Error ก่อนส่งข้อมูล
    if (isStockInvalid) {
      alert('จำนวนหนังสือพร้อมใช้งาน ห้ามมากกว่าสต็อกทั้งหมด!');
      return;
    }

    setLoading(true);
    try {
      let finalCoverImage = form.coverImage;

      // 🚀 จัดการอัปโหลดรูปภาพถ้าเป็นโหมด File
      if (imageType === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post('/books/upload-cover', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalCoverImage = uploadRes.data.url;
      }

      const payload = { ...form, coverImage: finalCoverImage };

      if (isEdit) {
        await api.patch(`/books/${params.id}`, payload);
        alert('แก้ไขข้อมูลสำเร็จ!');
      } else {
        await api.post('/books', payload);
        alert('เพิ่มหนังสือเข้าคลังสำเร็จ!');
      }
      router.push('/');
      router.refresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border p-8">
        <h1 className="text-2xl font-black text-gray-900 mb-8">
          {isEdit ? '📝 แก้ไขรายละเอียดหนังสือ' : '➕ เพิ่มหนังสือใหม่'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ชื่อหนังสือ</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ผู้แต่ง</label>
              <input type="text" required value={form.author} onChange={(e) => setForm({...form, author: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">หมวดหมู่</label>
              <input type="text" required value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* ส่วนจัดการรูปภาพ Hybrid */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-blue-900 uppercase">รูปหน้าปก</label>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                  <button type="button" onClick={() => setImageType('url')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${imageType === 'url' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>URL</button>
                  <button type="button" onClick={() => setImageType('file')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${imageType === 'file' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>FILE</button>
                </div>
              </div>
              {imageType === 'url' ? (
                <input type="text" placeholder="https://..." value={form.coverImage} onChange={(e) => setForm({...form, coverImage: e.target.value})} className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              ) : (
                <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
              )}
            </div>
          </div>

          {/* สต็อกและราคา */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="font-bold text-gray-700 mb-2">📊 การตั้งค่าสต็อกและราคา</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase">สต็อกทั้งหมด</label>
                <input type="number" required value={form.stock.total} onChange={(e) => setForm({...form, stock: {...form.stock, total: +e.target.value}})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase ${isStockInvalid ? 'text-red-500' : 'text-gray-400'}`}>พร้อมใช้งาน</label>
                <input type="number" required value={form.stock.available} onChange={(e) => setForm({...form, stock: {...form.stock, available: +e.target.value}})} className={`w-full p-2 border rounded-lg ${isStockInvalid ? 'border-red-500 bg-red-50' : ''}`} />
              </div>
            </div>
            {isStockInvalid && <p className="text-[10px] text-red-500 font-bold leading-tight">⚠️ จำนวนพร้อมใช้งาน ห้ามมากกว่าสต็อกทั้งหมด</p>}
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm">
                <span>ราคาเช่า 3 วัน</span>
                <input type="number" required value={form.pricing.day3} onChange={(e) => setForm({...form, pricing: {...form.pricing, day3: +e.target.value}})} className="w-24 p-2 border rounded-lg text-right font-bold text-blue-600" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>ราคาเช่า 5 วัน</span>
                <input type="number" required value={form.pricing.day5} onChange={(e) => setForm({...form, pricing: {...form.pricing, day5: +e.target.value}})} className="w-24 p-2 border rounded-lg text-right font-bold text-blue-600" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>ราคาเช่า 7 วัน</span>
                <input type="number" required value={form.pricing.day7} onChange={(e) => setForm({...form, pricing: {...form.pricing, day7: +e.target.value}})} className="w-24 p-2 border rounded-lg text-right font-bold text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">คำอธิบาย</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"></textarea>
        </div>

        <div className="mt-8 flex gap-4">
          <button type="button" onClick={() => router.back()} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition">ยกเลิก</button>
          <button 
            type="submit" 
            disabled={loading || isStockInvalid} 
            className={`flex-1 py-4 font-bold rounded-2xl transition shadow-lg ${isStockInvalid ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
          >
            {isStockInvalid ? 'ข้อมูลสต็อกไม่ถูกต้อง' : (loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลหนังสือ')}
          </button>
        </div>
      </form>
    </div>
  );
}