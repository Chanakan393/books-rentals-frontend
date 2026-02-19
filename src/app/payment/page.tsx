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

  // 🚀 สร้าง URL สำหรับดึงรูป QR Code จำลอง (ฝังยอดเงินเข้าไปด้วย)
  const qrData = `PromptPay: 0812345678 | Amount: ${amount} THB | RentalID: ${rentalId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}&margin=10`;

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-6 flex justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">ชำระเงิน</h1>
        <p className="text-gray-500 mb-6 pb-6 border-b">รหัสรายการ: <span className="text-xs">{rentalId}</span></p>

        {/* 🚀 ปรับเป็นแสดง QR Code แทนเลขบัญชี */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <p className="text-gray-600 mb-1">ยอดที่ต้องชำระ</p>
          <p className="text-4xl font-bold text-blue-600 mb-4">{amount} ฿</p>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center justify-center">
            <p className="text-sm text-gray-500 mb-3">สแกน QR Code เพื่อชำระเงิน (จำลอง)</p>
            
            {/* รูป QR Code ที่ Gen มาสดๆ */}
            <div className="p-2 border-2 border-blue-100 rounded-xl mb-3 bg-white">
              <img src={qrUrl} alt="QR Code สำหรับชำระเงิน" className="w-40 h-40 object-contain" />
            </div>
            
            <p className="font-bold text-gray-800 text-lg tracking-wide">พร้อมเพย์: 081-234-5678</p>
            <p className="text-sm text-gray-600">นาย เอ นามสมมติ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition flex flex-col items-center justify-center min-h-[160px]">
            {preview ? (
              <img src={preview} alt="Slip Preview" className="max-h-48 object-contain rounded shadow-sm" />
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                <span className="text-3xl mb-2">📸</span>
                <span className="font-medium">คลิกเพื่อแนบสลิปโอนเงิน</span>
                <span className="text-xs mt-1 text-gray-400">รองรับ JPG, PNG</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label>

          <button 
            type="submit"
            disabled={!file || isSubmitting}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? 'กำลังอัปโหลด...' : 'ยืนยันการชำระเงิน'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">กำลังโหลดหน้าชำระเงิน...</div>}>
      <PaymentContent />
    </Suspense>
  );
}