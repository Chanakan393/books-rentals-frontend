'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// Interface หนังสือ (เอามาแค่ฟิลด์ที่ต้องใช้โชว์)
interface Book {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  pricing: { day3: number; day5: number; day7: number };
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ดึงค่าจาก URL เช่น /checkout?bookId=123&days=3
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

    // ดึงข้อมูลหนังสือมาโชว์
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
      // 🚀 ยิง API ไปหลังบ้านเพื่อทำการจอง (ตัดสต็อก 1 เล่ม)
      const res = await api.post('/rentals/rent', {
        bookId,
        days: Number(days),
      });
      
      alert('จองหนังสือสำเร็จ! ไปหน้าชำระเงินกันต่อเลย');
      // พาไปหน้าแจ้งชำระเงิน พร้อมแนบ rentalId (รหัสการเช่า) ไปด้วย
      router.push(`/payment?rentalId=${res.data._id}&amount=${res.data.cost}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) return null;

  // คำนวณราคาตามจำนวนวันที่เลือก
  const price = days === '3' ? book.pricing.day3 : days === '5' ? book.pricing.day5 : book.pricing.day7;

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">ยืนยันการทำรายการ</h1>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* รูปปก */}
          <div className="w-full md:w-1/3 aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shrink-0">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
            )}
          </div>

          {/* รายละเอียด */}
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h2>
            <p className="text-gray-600 mb-6">ผู้แต่ง: {book.author}</p>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">ระยะเวลาเช่า:</span>
                <span className="font-semibold text-blue-800">{days} วัน</span>
              </div>
              <div className="flex justify-between items-center text-lg mt-4 pt-4 border-t border-blue-200">
                <span className="font-bold text-gray-800">ยอดชำระสุทธิ:</span>
                <span className="font-bold text-blue-600 text-2xl">{price} ฿</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => router.back()}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                disabled={isSubmitting}
              >
                ย้อนกลับ
              </button>
              <button 
                onClick={handleConfirmRent}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 flex justify-center items-center"
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
    <Suspense fallback={<div className="text-center py-20">กำลังเตรียมหน้าสรุปรายการ...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}