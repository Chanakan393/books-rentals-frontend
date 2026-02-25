'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. ดึงข้อมูล User โดยตรงจาก Users API เพื่อเอาที่อยู่
        const userRes = await api.get(`/users/${params.id}`);
        setUser(userRes.data);

        // 2. ดึงประวัติการเช่าจาก Rentals API เส้นสำหรับ Admin
        const historyRes = await api.get(`/rentals/history/${params.id}`);
        setHistory(historyRes.data);
      } catch (error) {
        console.error('Error fetching member details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchData();
  }, [params.id]);

  if (loading) return <div className="p-20 text-center font-black italic text-gray-400">กำลังดึงข้อมูลสมาชิก...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="mb-6 text-sm font-black text-blue-600 hover:underline">
          ← ย้อนกลับไปหน้าจัดการสมาชิก
        </button>
        
        {/* Card ข้อมูลสมาชิก (ที่อยู่โชว์เฉพาะหน้านี้) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black">
              {user?.username?.[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 leading-none">{user?.username}</h2>
              <p className="text-gray-500 font-bold mt-2">{user?.email}</p>
              <p className="text-blue-600 font-black text-sm mt-1">📞 {user?.phoneNumber || 'ไม่มีข้อมูลเบอร์โทร'}</p>
            </div>
          </div>
          
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-dashed border-blue-200 flex-1 max-w-sm">
            <p className="text-[10px] font-black text-blue-400 uppercase mb-2">📍 ที่อยู่สำหรับจัดส่ง/ติดต่อ</p>
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              {user?.address || <span className="italic text-gray-400 underline">ลูกค้ายังไม่ได้กรอกข้อมูลที่อยู่</span>}
            </p>
          </div>
        </div>

        {/* รายการประวัติการเช่า */}
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          📜 ประวัติการเช่า <span className="bg-gray-200 text-xs px-2 py-1 rounded-lg">{history.length}</span>
        </h3>

        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((h: any) => (
              <div key={h._id} className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-20 bg-gray-100 rounded-xl overflow-hidden border shrink-0">
                    <img src={h.bookId?.coverImage} className="w-full h-full object-cover" alt="book cover" />
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-lg">{h.bookId?.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                      {new Date(h.borrowDate).toLocaleDateString('th-TH')} - {new Date(h.dueDate).toLocaleDateString('th-TH')}
                    </p>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        h.status === 'returned' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {h.status === 'returned' ? 'คืนแล้ว' : h.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-400 font-black uppercase">ยอดเงิน</p>
                  <p className="text-xl font-black text-blue-600">{h.cost?.toLocaleString()} ฿</p>
                  {h.fine > 0 && <p className="text-[10px] text-red-500 font-bold">ค่าปรับ: {h.fine} ฿</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white py-20 text-center rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">
              ไม่พบประวัติการยืมหนังสือของสมาชิกท่านนี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
}