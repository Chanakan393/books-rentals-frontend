'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string[]; // 🚀 เปลี่ยน type ให้รองรับ Array
  description: string;
  coverImage: string;
  stock: { total: number; available: number };
  pricing: { day3: number; day5: number; day7: number };
  status: string;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${params.id}`);
        setBook(res.data);
      } catch (error) {
        alert('ไม่พบข้อมูลหนังสือเล่มนี้');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchBook();
  }, [params.id, router]);

  const handleRent = (days: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนทำรายการยืมหนังสือ');
      router.push('/login');
      return;
    }
    router.push(`/checkout?bookId=${book?._id}&days=${days}`);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!book) return null;

  const isAvailable = book.stock?.available > 0 && String(book.status).toLowerCase() === 'available';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.push('/')} className="mb-6 text-sm font-black text-gray-500 hover:text-blue-600 transition flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          ← กลับไปหน้าแรก
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row gap-10">
          {/* รูปหน้าปก */}
          <div className="w-full md:w-1/3 shrink-0">
            <div className="relative aspect-[3/4] bg-gray-100 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">ไม่มีรูปภาพ</div>
              )}
              {/* 🚀 โชว์หมวดหมู่แบบ Array */}
              <div className="absolute top-4 left-4 bg-black/70 text-white text-[10px] font-black px-3 py-1.5 rounded-xl backdrop-blur-sm uppercase tracking-widest shadow-md">
                {Array.isArray(book.category) && book.category.length > 0 ? book.category.join(' / ') : (book.category || 'ทั่วไป')}
              </div>
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="flex-1 flex flex-col">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">{book.title}</h1>
              <p className="text-lg text-gray-500 font-medium mb-8">ผู้แต่ง: <span className="text-gray-800 font-bold border-b-2 border-gray-200 pb-1">{book.author}</span></p>

              <div className="bg-blue-50/40 p-6 md:p-8 rounded-[2rem] border border-blue-100/50 mb-8 shadow-inner">
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="text-xl">📖</span> เรื่องย่อ / รายละเอียด
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap font-medium">
                  {book.description || <span className="italic text-gray-400">ไม่มีคำอธิบายสำหรับหนังสือเล่มนี้</span>}
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                <div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">สถานะหนังสือ</p>
                  <p className={`font-black text-lg ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {isAvailable ? 'พร้อมให้เช่า' : 'หมดชั่วคราว'}
                  </p>
                </div>
                <div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">คงเหลือในสต็อก</p>
                  <p className="font-black text-gray-800 text-lg">
                    <span className={book.stock.available > 0 ? 'text-blue-600' : 'text-red-500'}>{book.stock.available}</span> / {book.stock.total}
                  </p>
                </div>
              </div>

              {/* ส่วนเลือกวันเช่า */}
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">เลือกระยะเวลาที่ต้องการยืม</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[3, 5, 7].map((day) => (
                  <button
                    key={day}
                    disabled={!isAvailable}
                    onClick={() => handleRent(day)}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-600 transition-all duration-300 group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-100 disabled:hover:bg-transparent shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <span className="text-xs font-black text-gray-400 group-hover:text-blue-100 uppercase tracking-widest mb-1 transition-colors">เช่า {day} วัน</span>
                    <span className="text-2xl font-black text-gray-900 group-hover:text-white transition-colors">{(book.pricing as any)[`day${day}`]} ฿</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}