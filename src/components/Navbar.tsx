'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string; _id: string } | null>(null);

  useEffect(() => {
    // 🔍 ดึงข้อมูล User มาเช็คสถานะ
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login'; 
  };

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-50 font-sans">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-black text-blue-600 flex items-center gap-2 tracking-tighter">
          📚 <span>BookRental</span>
        </Link>
        
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-gray-500 hover:text-blue-600 font-bold text-sm transition">หน้าแรก</Link>
          
          {user ? (
            <>
              {/* 🛠️ ส่วนของ Admin เท่านั้น */}
              {user.role === 'admin' && (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/admin/dashboard" 
                    className="bg-amber-50 text-amber-700 px-3 py-2 rounded-xl text-xs font-black border border-amber-200 hover:bg-amber-100 transition uppercase"
                  >
                    ⚙️ แดชบอร์ด
                  </Link>
                  <Link 
                    href="/admin/members" 
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-xs font-black border border-blue-100 hover:bg-blue-100 transition uppercase"
                  >
                    👥 จัดการสมาชิก
                  </Link>
                </div>
              )}

              {/* 👤 ส่วนของ Member ทั่วไป */}
              {user.role === 'member' && (
                <>
                  <Link href="/history" className="text-gray-500 hover:text-blue-600 font-bold text-sm transition">ประวัติการเช่า</Link>
                  <Link href="/profile" className="text-gray-500 hover:text-blue-600 font-bold text-sm transition">แก้ไขโปรไฟล์</Link>
                </>
              )}

              <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end leading-none">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สวัสดี</span>
                  <span className="text-sm font-black text-gray-800">{user.username}</span>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl font-black border border-red-100 transition shadow-sm uppercase tracking-tighter"
                >
                  ออกจากระบบ
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 items-center">
              <Link href="/login" className="px-4 py-2 text-sm text-blue-600 font-black hover:underline">เข้าสู่ระบบ</Link>
              <Link href="/register" className="px-5 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-2xl font-black shadow-lg shadow-blue-100 transition">สมัครสมาชิก</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}