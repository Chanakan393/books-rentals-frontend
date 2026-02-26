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

  // 🚀 เพิ่มการเช็คหมวดหมู่ว่าง
  const isCategoryEmpty = !form.category || form.category.length === 0;

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

  const ADMIN_CATEGORIES = CATEGORIES.filter(cat => cat !== "ทั้งหมด");

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('ขนาดไฟล์หน้าปกต้องไม่เกิน 2 MB ครับ กรุณาเลือกรูปใหม่');
        e.target.value = '';
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  // ค้นหาฟังก์ชัน handleSubmit ใน src\app\admin\manage-book\[id]\page.tsx แล้ววางทับครับ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCategoryEmpty) {
      alert('กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่ครับ!');
      return;
    }

    // 🚀 แปลงค่าเป็น Number ให้ชัวร์ก่อนส่ง
    const t = Number(form.stock?.total || 0);
    const a = Number(form.stock?.available || 0);
    const d3 = Number(form.pricing?.day3 || 0);
    const d5 = Number(form.pricing?.day5 || 0);
    const d7 = Number(form.pricing?.day7 || 0);

    if (t <= 0) { alert('สต็อกทั้งหมดต้องมีอย่างน้อย 1 เล่ม!'); return; }
    if (d3 <= 0 || d5 <= 0 || d7 <= 0) { alert('ราคาเช่าต้องมากกว่า 0 บาท!'); return; }
    if (a > t) { alert('จำนวนหนังสือพร้อมใช้งาน ห้ามมากกว่าสต็อกทั้งหมด!'); return; }
    if (d3 >= d5 || d5 >= d7) { alert('ราคาเช่าไม่ถูกต้อง! ต้องเรียงลำดับ (3 วัน < 5 วัน < 7 วัน)'); return; }

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

      // 🚀 จุดสำคัญ: สร้าง Payload ใหม่โดยไม่ใช้ ...form เพื่อคุม Type ให้เป็น Number
      const payload = {
        title: form.title,
        author: form.author,
        description: form.description,
        category: form.category, // เป็น Array อยู่แล้ว
        coverImage: finalCoverImage,
        stock: {
          total: t,          // ส่งค่าที่เป็น Number
          available: a       // ส่งค่าที่เป็น Number
        },
        pricing: {
          day3: d3,          // ส่งค่าที่เป็น Number
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
      const backendMsg = error.response?.data?.message;
      alert('บันทึกไม่สำเร็จ:\n' + (Array.isArray(backendMsg) ? backendMsg.join('\n') : backendMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border p-8">
        <h1 className="text-2xl font-black text-gray-900 mb-8">
          {isEdit ? '📝 แก้ไขรายละเอียดหนังสือ' : '➕ เพิ่มหนังสือใหม่'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ฝั่งข้อมูลเบื้องต้น */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">ชื่อหนังสือ</label>
              <input type="text" required value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none font-bold text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">ผู้แต่ง</label>
              <input type="text" required value={form.author || ''} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none font-bold text-gray-700" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`text-xs font-bold uppercase tracking-widest ${isCategoryEmpty ? 'text-red-500' : 'text-gray-400'}`}>
                  หมวดหมู่ {isCategoryEmpty && '(กรุณาเลือกอย่างน้อย 1)'}
                </label>
              </div>
              <div className={`grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border-2 h-64 overflow-y-auto transition-colors ${isCategoryEmpty ? 'border-red-100 bg-red-50/30' : 'border-gray-50'}`}>
                {ADMIN_CATEGORIES.map((cat) => (
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
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-blue-600 transition-colors select-none">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ฝั่งสต็อกและราคา */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-50">
              <p className="font-black text-gray-700 mb-4 uppercase text-xs tracking-widest">📊 สต็อกและราคา</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">สต็อกทั้งหมด</label>
                  <input
                    type="number" min="1" required
                    value={form.stock?.total || ''}
                    onChange={(e) => setForm({ ...form, stock: { ...form.stock, total: e.target.value } })}
                    className="w-full p-2 border-2 border-white rounded-lg font-bold text-gray-700 shadow-sm"
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${isStockInvalid ? 'text-red-500' : 'text-gray-400'}`}>พร้อมใช้งาน</label>
                  <input
                    type="number" min="0" required
                    value={form.stock?.available || ''}
                    onChange={(e) => setForm({ ...form, stock: { ...form.stock, available: e.target.value } })}
                    className={`w-full p-2 border-2 rounded-lg font-bold ${isStockInvalid ? 'border-red-500 bg-red-50 text-red-600' : 'border-white bg-white text-gray-700 shadow-sm'}`}
                  />
                </div>
              </div>

              {/* 🚀 แก้ไข: เพิ่ม step="0.01" ให้ทุกช่องราคาเพื่อรับทศนิยม */}
              <div className="space-y-4 pt-4 border-t border-gray-200/50">
                {[3, 5, 7].map(day => (
                  <div key={day} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-500 tracking-tight">ราคาเช่า {day} วัน</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01" // 🚀 บรรทัดนี้ทำให้ใส่ทศนิยมได้
                        required
                        value={form.pricing?.[`day${day}`] || ''}
                        onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, [`day${day}`]: e.target.value } })}
                        className="w-28 p-2 pr-6 border-2 border-white rounded-lg text-right font-black text-blue-600 outline-none focus:border-blue-400 shadow-sm"
                        placeholder="0.00"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-bold italic">฿</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border-2 border-blue-50">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest">รูปหน้าปก</label>
                <div className="flex bg-white rounded-lg p-1 shadow-sm">
                  {['url', 'file'].map(type => (
                    <button key={type} type="button" onClick={() => setImageType(type as any)} className={`px-3 py-1 text-[9px] font-black rounded-md transition uppercase ${imageType === type ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{type}</button>
                  ))}
                </div>
              </div>
              {imageType === 'url' ? (
                <input type="text" placeholder="https://..." value={form.coverImage || ''} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="w-full p-3 border-2 border-white rounded-xl text-xs focus:border-blue-500 outline-none bg-white font-medium shadow-sm" />
              ) : (
                <div className="space-y-2">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="text-[10px] text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">JPG, PNG ไม่เกิน 2 MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ส่วนเรื่องย่อ */}
        <div className="mt-8 border-t border-gray-100 pt-8">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">คำอธิบายเรื่องย่อ</label>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${(form.description?.length || 0) > 2800 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
              {form.description?.length || 0} / 3000
            </span>
          </div>
          <textarea
            rows={5}
            maxLength={3000}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-5 border-2 border-gray-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none text-sm font-medium text-gray-700 leading-relaxed bg-gray-50/50 transition-all"
            placeholder="สรุปเนื้อหาหนังสือโดยสังเขป..."
          ></textarea>
        </div>

        <div className="mt-10 flex gap-4">
          <button type="button" onClick={() => router.back()} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition uppercase text-xs tracking-widest">ยกเลิก</button>
          <button
            type="submit"
            disabled={loading || isStockInvalid || isCategoryEmpty}
            className={`flex-1 py-4 font-black rounded-2xl transition shadow-xl uppercase text-xs tracking-widest ${(isStockInvalid || isCategoryEmpty) ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
          >
            {isCategoryEmpty ? 'กรุณาเลือกหมวดหมู่' : isStockInvalid ? 'สต็อกไม่ถูกต้อง' : (loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล')}
          </button>
        </div>
      </form>
    </div>
  );
}