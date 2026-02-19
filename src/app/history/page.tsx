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
  paymentStatus: 'pending' | 'verification' | 'paid' | 'refund_pending' | 'refunded' | 'cancelled';
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
      booked: 'bg-blue-100 text-blue-700',
      rented: 'bg-orange-100 text-orange-700',
      returned: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      verification: 'bg-purple-100 text-purple-700',
      paid: 'bg-green-100 text-green-700',
      refund_pending: 'bg-pink-100 text-pink-700',
      refunded: 'bg-blue-100 text-blue-700',
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

  if (loading) return <div className="text-center py-20 italic text-gray-500">กำลังโหลดประวัติการเช่าของคุณ...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">ประวัติการเช่าของฉัน</h1>
            <p className="text-gray-500 mt-1">จัดการการจองและตรวจสอบกำหนดคืนหนังสือของคุณ</p>
          </div>
          <button 
            onClick={fetchHistory} 
            className="text-xs font-bold bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition flex items-center gap-2"
          >
            🔄 รีเฟรชข้อมูล
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-3xl shadow-sm border border-gray-100">
            <span className="text-5xl mb-4 block">📚</span>
            <p className="text-gray-500 text-lg font-medium">ไม่พบข้อมูลการเช่าหนังสือ</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              ไปเลือกดูหนังสือหน้าแรก →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {history.map((item) => {
              // 🚀 แก้ไข: ยกเลิกได้ตลอดถ้ายังไม่มารับของ (booked)
              const canCancel = item.status === 'booked';
              
              return (
                <div 
                  key={item._id} 
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-40 bg-gray-100 shrink-0">
                      <img 
                        src={item.bookId?.coverImage} 
                        alt={item.bookId?.title} 
                        className="w-full h-56 md:h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-black text-gray-800 leading-tight mb-2">
                            {item.bookId?.title}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getPaymentBadge(item.paymentStatus)}`}>
                              {item.paymentStatus}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-blue-600">{item.cost} <span className="text-xs font-normal text-gray-400">฿</span></p>
                          {canCancel && (
                            <button 
                              onClick={() => handleCancel(item._id)}
                              className="text-[11px] text-red-500 hover:text-red-700 font-black mt-2 uppercase tracking-tighter hover:underline"
                            >
                              ยกเลิกการจอง
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">วันที่จอง</p>
                          <p className="text-gray-700 font-bold text-sm">
                            {new Date(item.borrowDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        
                        <div className="bg-red-50/50 -m-2 p-2 rounded-2xl border border-red-100/50">
                          <p className="text-[10px] font-black text-red-400 uppercase mb-1">ต้องคืนภายใน</p>
                          <p className="text-red-600 font-black text-base">
                            {new Date(item.dueDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="hidden md:block">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">RENTAL ID</p>
                          <p className="text-gray-400 text-[10px] font-mono truncate w-32">{item._id}</p>
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