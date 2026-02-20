'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const [payments, setPayments] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [summary, setSummary] = useState({ activeBookings: 0, activeRentals: 0, overdueRentals: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'payments' | 'rentals'>('payments');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const calculateFine = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (now <= due) return 0;
    const diffTime = Math.abs(now.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 10; 
  };

  const handleUserClick = async (userId: string) => {
    if (!userId) return;
    try {
      const res = await api.get(`/users/${userId}`);
      setSelectedUser(res.data);
    } catch (error) { alert('ไม่สามารถดึงข้อมูลลูกค้าได้'); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const payRes = await api.get(`/payment/pending?date=${selectedDate}`);
      setPayments(payRes.data);
      const rentRes = await api.get(`/rentals/dashboard?date=${selectedDate}`);
      setActiveRentals(rentRes.data.transactions);
      setSummary(rentRes.data.summaryData);
    } catch (error) { console.error('Admin Error:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedDate]);

  const handleVerifyPayment = async (paymentId: string, isApproved: boolean) => {
    try {
      await api.patch(`/payment/verify/${paymentId}`, { isApproved });
      alert(isApproved ? 'ดำเนินการอนุมัติสำเร็จ' : 'ดำเนินการปฏิเสธเรียบร้อย');
      fetchData();
    } catch (error) { alert('เกิดข้อผิดพลาด'); }
  };

  const handlePickup = async (rentalId: string) => {
    try {
      await api.patch(`/rentals/${rentalId}/pickup`);
      alert('ยืนยันการรับหนังสือเรียบร้อย');
      fetchData();
    } catch (error: any) { alert(error.response?.data?.message); }
  };

  const handleReturn = async (rentalId: string) => {
    try {
      await api.patch(`/rentals/${rentalId}/return`);
      alert('คืนหนังสือเข้าสต็อกและบันทึกค่าปรับเรียบร้อย');
      fetchData();
    } catch (error) { alert('เกิดข้อผิดพลาด'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Admin Dashboard 🛠️</h1>
            <p className="text-gray-500 font-medium italic underline">จัดการรายการประจำวันที่ {new Date(selectedDate).toLocaleDateString('th-TH')}</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            <span className="text-sm font-bold text-gray-600 ml-2">เลือกวันที่:</span>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="outline-none border-none text-blue-600 font-bold p-1 cursor-pointer" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">รายการจองวันนี้</p>
            <p className="text-2xl font-black text-gray-800">{summary.activeBookings}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-500">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">กำลังเช่าอยู่</p>
            <p className="text-2xl font-black text-gray-800">{summary.activeRentals}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">เกินกำหนดคืน</p>
            <p className="text-2xl font-black text-red-600">{summary.overdueRentals}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">รายได้วันนี้</p>
            <p className="text-2xl font-black text-green-600">{summary.revenue.toLocaleString()} ฿</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-200/50 p-1 rounded-xl w-fit">
          <button onClick={() => setTab('payments')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${tab === 'payments' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
            ตรวจสอบสลิป & คืนเงิน ({payments.length})
          </button>
          <button onClick={() => setTab('rentals')} className={`px-6 py-2 rounded-lg font-bold text-sm transition ${tab === 'rentals' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
            จัดการการยืม-คืน ({activeRentals.length})
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 italic font-sans">กำลังดึงข้อมูล...</div>
        ) : (
          <>
            {/* แท็บตรวจสลิปและคืนเงิน */}
            {tab === 'payments' && (
              <div className="grid gap-4">
                {payments.length === 0 && <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-sans">ไม่มีรายการในวันนี้</div>}
                {payments.map((p: any) => {
                  const isRefundRequest = p.status === 'refund_verification' || p.rentalId?.paymentStatus === 'refund_verification';
                  
                  return (
                    <div key={p._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
                      <div className="w-full md:w-48 h-64 bg-gray-50 rounded-2xl overflow-hidden border shrink-0">
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}${p.slipUrl}`} className="w-full h-full object-contain" alt="Slip" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-3xl font-black text-gray-800">{p.amount} ฿</h3>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              isRefundRequest ? 'bg-blue-100 text-blue-600 animate-pulse' :
                              p.status === 'paid' ? 'bg-green-100 text-green-600' : 
                              p.status === 'refunded' ? 'bg-indigo-100 text-indigo-600' :
                              p.status === 'refund_rejected' ? 'bg-orange-100 text-orange-600' :
                              p.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
                            }`}>
                              {isRefundRequest ? 'รอตรวจสอบการคืนเงิน' : 
                               p.status === 'paid' ? 'อนุมัติแล้ว' : 
                               p.status === 'refunded' ? 'คืนเงินสำเร็จ' : 
                               p.status === 'refund_rejected' ? 'ปฏิเสธคืนเงิน' : 
                               p.status === 'rejected' ? 'สลิปไม่ถูกต้อง' : 'รอตรวจสอบ'}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-2 font-medium italic">
                            👤 <button onClick={() => handleUserClick(p.rentalId?.userId?._id)} className="font-black text-blue-600 hover:underline">{p.rentalId?.userId?.username || 'ไม่ทราบชื่อ'}</button>
                          </p>
                          <p className="text-gray-600 text-sm font-medium italic underline">📚 ยืมเรื่อง: {p.rentalId?.bookId?.title || 'ไม่พบข้อมูลหนังสือ'}</p>
                          
                          {isRefundRequest && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                              <p className="text-[11px] text-blue-600 font-black uppercase">ℹ️ รายการขอยกเลิก: โปรดตรวจสอบการโอนคืนเงินและยืนยันด้านล่าง</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex gap-2">
                          {isRefundRequest ? (
                            <>
                              <button onClick={() => handleVerifyPayment(p._id, true)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase hover:bg-blue-700 transition shadow-lg shadow-blue-100">ยืนยันคืนเงินสำเร็จ</button>
                              <button onClick={() => handleVerifyPayment(p._id, false)} className="px-6 py-3 bg-orange-50 text-orange-600 rounded-xl font-black uppercase border border-orange-100 hover:bg-orange-100 transition">ปฏิเสธคืนเงิน</button>
                            </>
                          ) : p.status === 'verification' && (
                            <>
                              <button onClick={() => handleVerifyPayment(p._id, true)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black uppercase hover:bg-green-700 transition shadow-lg shadow-green-100 font-sans">อนุมัติสลิป</button>
                              <button onClick={() => handleVerifyPayment(p._id, false)} className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase border border-red-100 hover:bg-red-100 transition font-sans">สลิปไม่ถูกต้อง</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* แท็บจัดการการยืม-คืน */}
            {tab === 'rentals' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-5 text-xs font-black text-gray-400 uppercase">ข้อมูลการเช่า</th>
                        <th className="p-5 text-xs font-black text-gray-400 uppercase text-center">สถานะการคืน</th>
                        <th className="p-5 text-xs font-black text-gray-400 uppercase">กำหนดคืน</th>
                        <th className="p-5 text-xs font-black text-gray-400 uppercase text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRentals.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic font-sans">ไม่มีรายการในวันนี้</td></tr>}
                      {activeRentals.map((r: any) => {
                        const fine = calculateFine(r.dueDate);
                        return (
                          <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                            <td className="p-5 text-sm text-gray-800">
                              <p className="font-black">{r.bookId?.title}</p>
                              <p className="text-xs text-gray-500 italic">ผู้เช่า: <button onClick={() => handleUserClick(r.userId?._id)} className="text-blue-600 hover:underline font-bold">{r.userId?.username}</button></p>
                            </td>
                            <td className="p-5 text-center">
                              <div className="flex flex-col gap-1 items-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                  r.status === 'booked' ? 'bg-blue-100 text-blue-600' : 
                                  r.status === 'rented' ? 'bg-orange-100 text-orange-600' :
                                  r.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}> {r.status} </span>
                                {r.status === 'rented' && fine > 0 && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white animate-pulse">เลท {fine} ฿</span>
                                )}
                              </div>
                            </td>
                            <td className={`p-5 text-sm font-black ${fine > 0 && r.status === 'rented' ? 'text-red-600' : 'text-gray-600'}`}>
                              {new Date(r.dueDate).toLocaleDateString('th-TH')}
                            </td>
                            <td className="p-5 text-right">
                              {r.status === 'booked' && r.paymentStatus === 'paid' && (
                                <button onClick={() => handlePickup(r._id)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-blue-700 shadow-sm transition">ยืนยันรับของ</button>
                              )}
                              {r.status === 'rented' && (
                                <button onClick={() => { if(fine > 0) { if(confirm(`รายการคืนล่าช้า ปรับ ${fine} ฿ \nได้รับเงินแล้วใช่ไหม?`)) handleReturn(r._id); } else handleReturn(r._id); }} 
                                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition ${fine > 0 ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                  {fine > 0 ? 'คืนหนังสือ + ปรับ' : 'รับคืนปกติ'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal ข้อมูลติดต่อลูกค้า */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 font-sans">👤</div>
              <h3 className="text-xl font-black mb-4 text-center uppercase tracking-tight">ข้อมูลสมาชิก</h3>
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm"><strong>ชื่อผู้ใช้:</strong> {selectedUser.username}</p>
                <p className="text-sm"><strong>อีเมล:</strong> {selectedUser.email}</p>
                <p className="text-sm"><strong>เบอร์โทร:</strong> {selectedUser.phoneNumber || <span className="text-red-400 italic font-medium">ไม่ระบุ</span>}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-full mt-6 py-4 bg-gray-900 text-white font-black uppercase rounded-2xl hover:bg-gray-800 transition tracking-widest">ปิดหน้าต่าง</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}