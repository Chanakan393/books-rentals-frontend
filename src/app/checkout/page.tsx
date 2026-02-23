'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// 🚀 แก้ไข: เพิ่ม category แบบ Array เข้ามาใน Interface
interface Book {
  _id: string;
  title: string;
  author: string;
  category: string[]; 
  coverImage: string;
  pricing: { day3: number; day5: number; day7: number };
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const bookId = searchParams.get('bookId');
  const days = searchParams.get('days');

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!bookId || !days) {
      alert('ข้อมูลไม่ครบถ้วน กลับสู่หน้าแรก');
      router.push('/');
      return;
    }

    const fetchBookInfo = async () => {
      try {
        const res = await api.get(`/books/${bookId}`);
        setBook(res.data);
      } catch (error) {
        console.error(error);
        alert('ไม่พบข้อมูลหนังสือเล่มนี้');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBookInfo();
  }, [bookId, days, router]);

  const handleConfirmRent = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/rentals/rent', {
        bookId,
        days: Number(days),
      });
      
      alert('จองหนังสือสำเร็จ! ไปหน้าชำระเงินกันต่อเลย');
      router.push(`/payment?rentalId=${res.data._id}&amount=${res.data.cost}`);
    } catch (error: any) {
      // 💡 ตรงนี้จะรับข้อความแจ้งเตือน "ค้างค่าปรับ" จากหลังบ้านมาโชว์อัตโนมัติ
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!book) return null;

  const price = days === '3' ? book.pricing.day3 : days === '5' ? book.pricing.day5 : book.pricing.day7;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🛒</div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ยืนยันการทำรายการ</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* รูปปก */}
          <div className="w-full md:w-5/12 shrink-0">
            <div className="relative aspect-[3/4] bg-gray-100 rounded-3xl overflow-hidden shadow-md border border-gray-100">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">ไม่มีรูปภาพ</div>
              )}
              {/* 🚀 โชว์หมวดหมู่ที่ดึงมาจาก Array */}
              <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-black px-3 py-1.5 rounded-xl backdrop-blur-sm uppercase tracking-widest shadow-sm">
                {Array.isArray(book.category) && book.category.length > 0 ? book.category.join(' / ') : (book.category || 'ทั่วไป')}
              </div>
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="flex-1 w-full flex flex-col h-full">
            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-2 leading-tight">{book.title}</h2>
              <p className="text-gray-500 font-medium mb-8">ผู้แต่ง: <span className="text-gray-800 font-bold">{book.author}</span></p>
              
              <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 mb-8 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">ระยะเวลาเช่า</span>
                  <span className="font-black text-blue-800 text-lg bg-white px-3 py-1 rounded-xl shadow-sm">{days} วัน</span>
                </div>
                <div className="flex justify-between items-center text-lg mt-6 pt-6 border-t border-blue-100/50">
                  <span className="font-black text-gray-800 uppercase tracking-widest text-sm">ยอดชำระสุทธิ</span>
                  <span className="font-black text-blue-600 text-4xl">{price} <span className="text-xl">฿</span></span>
                </div>
              </div>
            </div>

            <div className="mt-auto flex gap-3 pt-4">
              <button 
                onClick={() => router.back()}
                className="w-1/3 py-4 bg-gray-100 text-gray-600 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition"
                disabled={isSubmitting}
              >
                ย้อนกลับ
              </button>
              <button 
                onClick={handleConfirmRent}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200 flex justify-center items-center"
              >
                {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center font-black italic text-gray-400">กำลังเตรียมหน้าสรุปรายการ...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}