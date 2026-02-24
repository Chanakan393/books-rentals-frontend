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

  // 🚀 กำหนดค่าเริ่มต้นเป็นสตริงว่างทั้งหมดเพื่อป้องกัน Uncontrolled Input Error
  const [form, setForm] = useState<any>({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    category: [],
    stock: { total: '', available: '' },
    pricing: { day3: '', day5: '', day7: '' }
  });

  const isStockInvalid = Number(form.stock?.available || 0) > Number(form.stock?.total || 0);

  const CATEGORIES = [
    "ทั้งหมด",
    // --- กลุ่มนิยายและวรรณกรรม ---
    "นิยาย (Novel)", "นิยายแปลญี่ปุ่น", "นิยายแปลเกาหลี", "วรรณกรรมคลาสสิก", "วรรณกรรมไทย",
    "วรรณกรรมเยาวชน", "เรื่องสั้น", "ไลท์โนเวล (Light Novel)", "นิยายวาย / การ์ตูนวาย",
    "นิยายยูริ / การ์ตูนยูริ", "ย้อนยุค / อิงประวัติศาสตร์",

    // --- กลุ่มแนวเรื่อง (Genre) ---
    "แอ็กชัน (Action)", "แฟนตาซี (Fantasy)", "ระทึกขวัญ (Thriller)", "สืบสวนสอบสวน (Mystery)",
    "อาชญากรรม", "ดราม่า", "โรแมนติก", "ตลก (Comedy)", "มิตรภาพ / ชีวิตวัยรุ่น", "เยียวยาจิตใจ",

    // --- กลุ่มการ์ตูน ---
    "มังงะ (Manga)", "การ์ตูนความรู้",

    // --- กลุ่มความรู้และวิชาการ ---
    "วิทยาศาสตร์", "ชีววิทยา", "ประวัติศาสตร์", "ปรัชญา", "จิตวิทยา", "สารคดี",
    "ความรู้ทั่วไป", "ภาษาต่างประเทศ", "พจนานุกรม", "คู่มือเตรียมสอบ",

    // --- กลุ่มพัฒนาตนเองและธุรกิจ ---
    "การพัฒนาตนเอง (How To)", "บริหารธุรกิจ", "การเงินการลงทุน", "การตลาด / การจัดการ",

    // --- กลุ่มคอมพิวเตอร์และเทคโนโลยี ---
    "คอมพิวเตอร์ / โปรแกรมมิ่ง", "AI / Data Science", "Database", "เว็บดีไซน์", "คู่มือการใช้งาน",

    // --- กลุ่มไลฟ์สไตล์ ---
    "ท่องเที่ยว", "อาหาร", "สุขภาพ / ความงาม", "สัตว์เลี้ยง", "บ้านและสวน",
    "งานอดิเรก / งานฝีมือ", "เกม", "โหราศาสตร์ / ดูดวง", "ธรรมะ / ศาสนา",

    // --- กลุ่มแม่และเด็ก ---
    "หนังสือเด็ก / นิทาน", "คู่มือเลี้ยงลูก (แม่และเด็ก)", "กิจกรรมเสริมทักษะ",

    "หนังสือต่างประเทศ", "อื่นๆ"
  ];

  useEffect(() => {
    if (isEdit) {
      const fetchBook = async () => {
        try {
          const res = await api.get(`/books/${params.id}`);
          const data = res.data;

          setForm({
            title: data.title || '',
            author: data.author || '',
            description: data.description || '',
            coverImage: data.coverImage || '',
            category: Array.isArray(data.category) ? data.category : (data.category ? [data.category] : []),
            stock: {
              total: data.stock?.total ?? '',
              available: data.stock?.available ?? ''
            },
            pricing: {
              day3: data.pricing?.day3 ?? '',
              day5: data.pricing?.day5 ?? '',
              day7: data.pricing?.day7 ?? ''
            }
          });

          if (data.coverImage?.startsWith('/uploads') || data.coverImage?.startsWith('http')) {
            // หมายเหตุ: ถ้าใช้ Cloudinary ลิงก์จะเป็น http แต่เราอาจจะยังให้แอดมินเลือกสลับโหมดได้
            setImageType(data.coverImage?.startsWith('http') && !data.coverImage?.includes('cloudinary') ? 'url' : 'file');
          }
        } catch (error) {
          alert('ไม่พบข้อมูลหนังสือ');
          router.push('/');
        }
      };
      fetchBook();
    }
  }, [isEdit, params.id, router]);

  // 🚀 ฟังก์ชันเช็คขนาดไฟล์ก่อนนำไปเก็บใน State
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ต้องไม่เกิน 2 MB
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('ขนาดไฟล์หน้าปกต้องไม่เกิน 2 MB ครับ กรุณาเลือกรูปใหม่');
        e.target.value = ''; // รีเซ็ตค่า input เพื่อให้กดเลือกไฟล์เดิมซ้ำได้ถ้าเปลี่ยนใจ
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const t = Number(form.stock?.total || 0);
    const d3 = Number(form.pricing?.day3 || 0);
    const d5 = Number(form.pricing?.day5 || 0);
    const d7 = Number(form.pricing?.day7 || 0);

    if (t <= 0) {
      alert('สต็อกทั้งหมดต้องมีอย่างน้อย 1 เล่ม!');
      return;
    }
    if (d3 <= 0 || d5 <= 0 || d7 <= 0) {
      alert('ราคาเช่าต้องมากกว่า 0 บาท!');
      return;
    }
    if (isStockInvalid) {
      alert('จำนวนหนังสือพร้อมใช้งาน ห้ามมากกว่าสต็อกทั้งหมด!');
      return;
    }
    if (d3 >= d5 || d5 >= d7) {
      alert('ราคาเช่าไม่ถูกต้อง! ต้องเรียงลำดับจากน้อยไปมาก (3 วัน < 5 วัน < 7 วัน)');
      return;
    }

    setLoading(true);
    try {
      let finalCoverImage = form.coverImage;

      if (imageType === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post('/books/upload-cover', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalCoverImage = uploadRes.data.url;
      }

      const payload = {
        ...form,
        coverImage: finalCoverImage,
        stock: {
          total: t,
          available: Number(form.stock?.available || 0)
        },
        pricing: {
          day3: d3,
          day5: d5,
          day7: d7
        }
      };

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

  const handleNumberChange = (value: string) => {
    const cleanValue = value.replace(/-/g, '');
    return cleanValue === '' ? '' : cleanValue;
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
              <input type="text" required value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ผู้แต่ง</label>
              <input type="text" required value={form.author || ''} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">หมวดหมู่ (เลือกได้มากกว่า 1)</label>
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 h-40 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.category?.includes(cat)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const currentCats = form.category || [];
                        if (isChecked) {
                          setForm({ ...form, category: [...currentCats, cat] });
                        } else {
                          setForm({ ...form, category: currentCats.filter((c: string) => c !== cat) });
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors select-none">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-blue-900 uppercase">รูปหน้าปก</label>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                  <button type="button" onClick={() => setImageType('url')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${imageType === 'url' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>URL</button>
                  <button type="button" onClick={() => setImageType('file')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${imageType === 'file' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>FILE</button>
                </div>
              </div>
              {imageType === 'url' ? (
                // 🚀 เพิ่ม || '' เพื่อป้องกัน Uncontrolled Input
                <input type="text" placeholder="https://..." value={form.coverImage || ''} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              ) : (
                <div className="space-y-2">
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    onChange={handleFileChange} // 🚀 เปลี่ยนมาใช้ฟังก์ชันที่เช็คขนาดไฟล์แล้ว
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
                  />
                  <p className="text-[10px] text-gray-400 font-bold">ไฟล์ JPG, PNG ขนาดไม่เกิน 2 MB</p>
                  {isEdit && form.coverImage && <p className="text-[10px] text-gray-400 italic truncate">ไฟล์ปัจจุบัน: {form.coverImage}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 h-fit">
            <p className="font-bold text-gray-700 mb-2">📊 การตั้งค่าสต็อกและราคา</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase">สต็อกทั้งหมด</label>
                <input
                  type="number" min="1" required
                  // 🚀 เพิ่ม || '' เพื่อป้องกัน Uncontrolled Input
                  value={form.stock?.total || ''}
                  onChange={(e) => setForm({ ...form, stock: { ...form.stock, total: handleNumberChange(e.target.value) } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase ${isStockInvalid ? 'text-red-500' : 'text-gray-400'}`}>พร้อมใช้งาน</label>
                <input
                  type="number" min="0" required
                  // 🚀 เพิ่ม || '' เพื่อป้องกัน Uncontrolled Input
                  value={form.stock?.available || ''}
                  onChange={(e) => setForm({ ...form, stock: { ...form.stock, available: handleNumberChange(e.target.value) } })}
                  className={`w-full p-2 border rounded-lg ${isStockInvalid ? 'border-red-500 bg-red-50' : ''}`}
                />
              </div>
            </div>
            {isStockInvalid && <p className="text-[10px] text-red-500 font-bold leading-tight">⚠️ จำนวนพร้อมใช้งาน ห้ามมากกว่าสต็อกทั้งหมด</p>}

            <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-600">ราคาเช่า 3 วัน</span>
                <input
                  type="number" min="1" required
                  // 🚀 เพิ่ม || '' เพื่อป้องกัน Uncontrolled Input
                  value={form.pricing?.day3 || ''}
                  onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, day3: handleNumberChange(e.target.value) } })}
                  className="w-24 p-2 border rounded-lg text-right font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-600">ราคาเช่า 5 วัน</span>
                <input
                  type="number" min="1" required
                  // 🚀 เพิ่ม || '' เพื่อป้องกัน Uncontrolled Input
                  value={form.pricing?.day5 || ''}
                  onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, day5: handleNumberChange(e.target.value) } })}
                  className="w-24 p-2 border rounded-lg text-right font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-600">ราคาเช่า 7 วัน</span>
                <input
                  type="number" min="1" required
                  // 🚀 เพิ่ม || '' เพื่อป้องกัน Uncontrolled Input
                  value={form.pricing?.day7 || ''}
                  onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, day7: handleNumberChange(e.target.value) } })}
                  className="w-24 p-2 border rounded-lg text-right font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">คำอธิบายเรื่องย่อ</label>
          <textarea rows={4} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"></textarea>
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