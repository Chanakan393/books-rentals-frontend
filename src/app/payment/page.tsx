'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const rentalId = searchParams.get('rentalId');
  const amount = searchParams.get('amount');

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!rentalId || !amount) {
      alert('ไม่พบข้อมูลการชำระเงิน กลับสู่หน้าแรก');
      router.push('/');
    }
  }, [rentalId, amount, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 🚀 เช็คขนาดไฟล์สลิป (ต้องไม่เกิน 2 MB)
      const maxSize = 2 * 1024 * 1024; // 2 MB in bytes
      if (selectedFile.size > maxSize) {
        alert('ขนาดไฟล์สลิปต้องไม่เกิน 2 MB ครับ กรุณาเลือกรูปใหม่');
        e.target.value = ''; // ล้างค่าใน input เพื่อให้เลือกไฟล์ใหม่ได้
        setFile(null); // ล้าง state file
        setPreview(null); // ล้าง state preview
        return;
      }
      
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !rentalId || !amount) {
      alert('กรุณาแนบรูปสลิปโอนเงินก่อนกดยืนยัน');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rentalId', rentalId);
      formData.append('amount', amount);
      formData.append('file', file);

      await api.post('/payment/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('แจ้งชำระเงินสำเร็จ! สถานะของคุณคือ "รอตรวจสอบสลิป"');
      router.push('/history');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดสลิป');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rentalId || !amount) return null;

  const qrData = `PromptPay: 0812345678 | Amount: ${amount} THB | RentalID: ${rentalId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}&margin=10`;

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-6 flex justify-center items-center font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">ชำระเงิน 💸</h1>
        <p className="text-gray-400 text-xs mb-6 pb-6 border-b font-mono">ID: {rentalId}</p>

        <div className="bg-blue-50/50 rounded-3xl p-6 mb-6 border border-blue-50 shadow-inner">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">ยอดชำระสุทธิ</p>
          <p className="text-5xl font-black text-blue-600 mb-6 italic">{amount} <span className="text-xl font-bold not-italic">฿</span></p>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center">
            <div className="p-2 border-2 border-blue-50 rounded-2xl mb-4 bg-white">
              <img src={qrUrl} alt="QR Code" className="w-40 h-40 object-contain" />
            </div>
            <p className="font-black text-gray-800 text-lg tracking-tight">พร้อมเพย์: 081-234-5678</p>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-tighter">BOOKRENTAL CO., LTD.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="border-2 border-dashed border-gray-200 rounded-3xl p-2 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center min-h-[200px] overflow-hidden group">
            {preview ? (
              <img src={preview} alt="Slip Preview" className="max-h-60 w-full object-contain rounded-2xl shadow-sm" />
            ) : (
              <div className="text-gray-400 flex flex-col items-center py-10 group-hover:scale-110 transition-transform">
                <span className="text-4xl mb-3">🖼️</span>
                <span className="font-black text-xs uppercase tracking-widest">แนบหลักฐานการโอนเงิน</span>
                {/* 🚀 แก้ไข: ปรับข้อความเป็น MAX 2MB */}
                <span className="text-[10px] mt-1 font-bold text-gray-300">JPG, PNG (MAX 2MB)</span>
              </div>
            )}
            <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            type="submit"
            disabled={!file || isSubmitting}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed mt-2 shadow-lg shadow-blue-100 uppercase tracking-widest"
          >
            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'แจ้งชำระเงิน'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-black italic text-gray-400">กำลังเข้าสู่ระบบชำระเงิน...</div>}>
      <PaymentContent />
    </Suspense>
  );
}