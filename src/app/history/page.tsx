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

  // เน้นสถานะการยืม-คืนให้ชัดเจนขึ้น
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      booked: 'bg-blue-600 text-white shadow-sm',
      rented: 'bg-orange-500 text-white shadow-sm',
      returned: 'bg-green-600 text-white shadow-sm',
      cancelled: 'bg-red-600 text-white shadow-sm',
    };
    return styles[status] || 'bg-gray-500 text-white';
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
            <button 
              onClick={() => router.push('/')}
              className="mt-6 text-blue-600 font-black hover:underline decoration-2 underline-offset-4"
            >
              ไปเลือกดูหนังสือหน้าแรก →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {history.map((item) => {
              const canCancel = item.status === 'booked';
              
              return (
                <div 
                  key={item._id} 
                  className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* ปกหนังสือ */}
                    <div className="w-full md:w-44 bg-gray-100 shrink-0 relative overflow-hidden">
                      <img 
                        src={item.bookId?.coverImage} 
                        alt={item.bookId?.title} 
                        className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* แถบราคาแบบไม่เด่น วางทับบนรูป */}
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold">
                        {item.cost} ฿
                      </div>
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-black text-gray-800 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                            {item.bookId?.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            {/* สถานะการยืมที่ต้องการให้เด่น */}
                            <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                            {/* สถานะการจ่ายแบบตัวเล็ก ไม่เด่น */}
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                              • Payment: {item.paymentStatus}
                            </span>
                          </div>
                        </div>

                        {/* ปุ่มยกเลิก */}
                        {canCancel && (
                          <button 
                            onClick={() => handleCancel(item._id)}
                            className="shrink-0 text-[10px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 px-3 py-1.5 rounded-xl font-black transition-all uppercase"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                      
                      {/* แถบข้อมูลวันที่และกำหนดคืนที่เน้นให้เด่น */}
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">วันที่เริ่มยืม</p>
                          <p className="text-gray-800 font-extrabold text-base">
                            {new Date(item.borrowDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col justify-center items-center shadow-inner">
                          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">ต้องคืนภายใน (RETURN BY)</p>
                          <p className="text-red-600 font-black text-xl leading-none">
                            {new Date(item.dueDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Rental ID แบบจางๆ ด้านล่างสุด */}
                      <div className="mt-4 flex justify-end">
                        <p className="text-[9px] font-mono text-gray-300 uppercase tracking-tighter">ID: {item._id}</p>
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