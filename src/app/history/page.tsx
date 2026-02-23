'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface RentalHistory {
  _id: string;
  bookId: {
    title: string;
    coverImage: string;
  };
  cost: number;
  status: 'booked' | 'rented' | 'returned' | 'cancelled';
  paymentStatus: 'pending' | 'verification' | 'paid' | 'refund_verification' | 'refund_pending' | 'refunded' | 'refund_rejected' | 'cancelled';
  borrowDate: string;
  dueDate: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<RentalHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/rentals/my-history');
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      booked: 'bg-blue-600 text-white shadow-sm',
      rented: 'bg-orange-500 text-white shadow-sm',
      returned: 'bg-green-600 text-white shadow-sm',
      cancelled: 'bg-red-600 text-white shadow-sm',
    };
    return styles[status] || 'bg-gray-500 text-white';
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      verification: 'bg-purple-100 text-purple-700',
      paid: 'bg-green-100 text-green-700',
      refund_verification: 'bg-blue-100 text-blue-700 animate-pulse font-bold',
      refund_pending: 'bg-pink-100 text-pink-700',
      refunded: 'bg-blue-100 text-blue-700 font-black',
      refund_rejected: 'bg-red-100 text-red-700 animate-pulse font-black',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const handleCancel = async (rentalId: string) => {
    if (!confirm('คุณแน่ใจใช่ไหมที่จะยกเลิกรายการนี้? หากชำระเงินแล้ว ระบบจะดำเนินการคืนเงินให้ท่านตามรอบการตรวจสอบ')) return;

    try {
      await api.patch(`/rentals/${rentalId}/cancel`);
      alert('ยกเลิกรายการเรียบร้อยแล้ว');
      fetchHistory();
    } catch (error: any) {
      alert(error.response?.data?.message || 'ไม่สามารถยกเลิกได้');
    }
  };

  if (loading) return <div className="text-center py-20 italic text-gray-500 font-sans">กำลังโหลดประวัติการเช่าของคุณ...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">ประวัติการเช่าของฉัน 📖</h1>
            <p className="text-gray-500 mt-1">ติดตามสถานะและตรวจสอบกำหนดคืนหนังสือของคุณ</p>
          </div>
          <button 
            onClick={fetchHistory} 
            className="text-xs font-bold bg-white border border-gray-200 px-5 py-2.5 rounded-2xl shadow-sm hover:bg-gray-50 transition flex items-center gap-2"
          >
            🔄 รีเฟรชข้อมูล
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[2rem] shadow-sm border border-gray-100">
            <span className="text-6xl mb-6 block animate-bounce">📚</span>
            <p className="text-gray-500 text-lg font-bold">ยังไม่มีประวัติการเช่า</p>
            <button onClick={() => router.push('/')} className="mt-6 text-blue-600 font-black hover:underline decoration-2">
              ไปเลือกดูหนังสือหน้าแรก →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {history.map((item) => {
              const canCancel = item.status === 'booked';
              const needsNewSlip = item.paymentStatus === 'pending' && item.status !== 'cancelled';
              
              // 🚀 1. ปรับ Logic การนับวัน: ลบเวลาทิ้งให้เหลือแต่ "วันที่"
              const today = new Date();
              today.setHours(0, 0, 0, 0); 
              
              const dueDate = new Date(item.dueDate);
              dueDate.setHours(0, 0, 0, 0);

              // 🚀 2. จะ Overdue ก็ต่อเมื่อ วันนี้ > วันกำหนดคืน (ถ้าวันนี้ตรงกับวันคืนพอดี จะยังไม่ Overdue)
              const isOverdue = item.status === 'rented' && today > dueDate;
              
              return (
                <div key={item._id} className={`bg-white rounded-[1.5rem] shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 group ${isOverdue ? 'border-red-300' : 'border-gray-100'}`}>
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-44 bg-gray-100 shrink-0 relative overflow-hidden">
                      <img src={item.bookId?.coverImage} alt={item.bookId?.title} className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold">
                        {item.cost} ฿
                      </div>
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-gray-800 leading-tight mb-4 group-hover:text-blue-600 transition-colors">{item.bookId?.title}</h3>
                          <div className="flex flex-wrap gap-3">
                            <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${getStatusBadge(item.status)}`}>{item.status}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getPaymentBadge(item.paymentStatus)}`}>{item.paymentStatus === 'refund_verification' ? 'รอแอดมินคืนเงิน' : item.paymentStatus}</span>
                            
                            {isOverdue && (
                              <span className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-red-600 text-white animate-pulse shadow-sm">
                                ⚠️ เกินกำหนดคืน
                              </span>
                            )}
                          </div>
                        </div>
                        {canCancel && (
                          <button onClick={() => handleCancel(item._id)} className="shrink-0 text-[10px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 px-3 py-1.5 rounded-xl font-black transition-all uppercase">ยกเลิกการจอง</button>
                        )}
                      </div>
                      
                      {needsNewSlip && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex justify-between items-center animate-pulse">
                           <p className="text-[11px] font-bold text-amber-700 italic">⚠️ สลิปไม่ผ่านการตรวจสอบ โปรดอัปโหลดใหม่อีกครั้ง</p>
                           <button onClick={() => router.push(`/payment?rentalId=${item._id}&amount=${item.cost}`)} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black hover:bg-amber-700 transition">อัปโหลดสลิปใหม่</button>
                        </div>
                      )}

                      {isOverdue && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 border-dashed rounded-2xl flex items-center justify-center">
                          <p className="text-sm font-black text-red-600 text-center tracking-tight">
                            🚨 หนังสือเล่มนี้เกินกำหนดคืน! กรุณานำมาคืนและชำระค่าปรับที่หน้าร้าน <br/>
                            <span className="text-xs font-bold text-red-400 mt-1 block">(คุณจะไม่สามารถเช่าเล่มใหม่ได้จนกว่าจะเคลียร์รายการนี้)</span>
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">วันที่เริ่มยืม</p>
                          <p className="text-gray-800 font-extrabold text-base">{new Date(item.borrowDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                        
                        <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center shadow-inner transition-colors ${isOverdue ? 'bg-red-600 border-red-700 text-white animate-bounce' : 'bg-red-50 border-red-100 text-red-600'}`}>
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isOverdue ? 'text-red-100' : 'text-red-400'}`}>
                            {isOverdue ? 'เลยกำหนดคืน (OVERDUE)' : 'ต้องคืนภายใน (RETURN BY)'}
                          </p>
                          <p className="font-black text-xl leading-none">
                            {new Date(item.dueDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}