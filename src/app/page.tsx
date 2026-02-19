'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Interface ตรงกับ Backend (Book Entity)
interface Book {
  _id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverImage: string;
  stock: { total: number; available: number };
  pricing: { day3: number; day5: number; day7: number };
  status: string;
}

export default function Home() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  // State สำหรับ Modal เลือกวันเช่า
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ดึงข้อมูล User จาก LocalStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchBooks();
  }, []);

  // ฟังก์ชันดึงข้อมูลหนังสือ (รองรับ Query Search)
  const fetchBooks = async (search: string = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/books${search ? `?search=${search}` : ''}`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(searchTerm);
  };

  // ฟังก์ชันลบหนังสือ (Admin Only)
  const handleDeleteBook = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหนังสือเล่มนี้ออกจากระบบ?')) return;
    try {
      await api.delete(`/books/${id}`);
      alert('ลบหนังสือเรียบร้อยแล้ว');
      fetchBooks(); // รีโหลดข้อมูล
    } catch (error: any) {
      alert(error.response?.data?.message || 'ไม่สามารถลบได้ เนื่องจากหนังสืออาจติดรายการเช่าอยู่');
    }
  };

  // ฟังก์ชันเช็ค Login ก่อนเปิด Modal ยืม
  const handleRentClick = (book: Book) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนยืมหนังสือ');
      router.push('/login');
      return;
    }
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  // ย้ายไปหน้า Checkout
  const handleSelectDays = (days: number) => {
    setIsModalOpen(false);
    router.push(`/checkout?bookId=${selectedBook?._id}&days=${days}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section & Search */}
      <section className="bg-blue-600 text-white py-12 px-6 mb-8 shadow-md">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">ระบบยืม-คืนหนังสือออนไลน์</h1>
          <p className="text-blue-100 mb-8 text-lg">ค้นหาหนังสือที่คุณอยากอ่าน แล้วกดยืมได้เลย!</p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input 
              type="text" 
              placeholder="ค้นหาชื่อหนังสือ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button 
              type="submit" 
              className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
            >
              ค้นหา
            </button>
          </form>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">รายการหนังสือทั้งหมด</h2>
          
          {/* ➕ ปุ่มเพิ่มหนังสือสำหรับ Admin */}
          {user?.role === 'admin' && (
            <button 
              onClick={() => router.push('/admin/manage-book/new')}
              className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <span>➕ เพิ่มหนังสือใหม่</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => {
              const isAvailable = book.stock?.available > 0 && String(book.status).toLowerCase() === 'available';

              return (
                <div key={book._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  {/* รูปปก */}
                  <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase">
                      {book.category || 'ทั่วไป'}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight mb-1" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">ผู้แต่ง: {book.author}</p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-center text-xs mb-4">
                        <span className="text-gray-600">
                          คงเหลือ: <strong className={book.stock?.available > 0 ? 'text-green-600' : 'text-red-500'}>
                            {book.stock?.available || 0}
                          </strong>/{book.stock?.total || 0}
                        </span>
                        <span className="text-blue-600 font-bold">
                          เริ่ม {book.pricing?.day3 || 0}฿
                        </span>
                      </div>

                      {/* 🛠️ ปุ่มเปลี่ยนตาม Role */}
                      {user?.role === 'admin' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => router.push(`/admin/manage-book/${book._id}`)}
                            className="flex-1 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition"
                          >
                            แก้ไข
                          </button>
                          <button 
                            onClick={() => handleDeleteBook(book._id)}
                            className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition border border-red-100"
                          >
                            ลบ
                          </button>
                        </div>
                      ) : (
                        isAvailable ? (
                          <button 
                            onClick={() => handleRentClick(book)}
                            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition active:scale-[0.98]"
                          >
                            ยืมหนังสือ
                          </button>
                        ) : (
                          <button disabled className="w-full py-2.5 bg-gray-100 text-gray-500 text-sm font-semibold rounded-lg cursor-not-allowed">
                            หมดชั่วคราว
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- Modal เลือกวันเช่า (สำหรับ Member) --- */}
      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-2 text-gray-800">เลือกระยะเวลาการเช่า</h3>
            <p className="text-gray-600 mb-6 text-sm">เล่มที่คุณเลือก: <span className="font-bold text-blue-600">{selectedBook.title}</span></p>

            <div className="flex flex-col gap-3">
              {[3, 5, 7].map((day) => (
                <button 
                  key={day}
                  onClick={() => handleSelectDays(day)} 
                  className="flex justify-between items-center p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
                >
                  <span className="font-medium text-gray-800 group-hover:text-blue-700">เช่า {day} วัน</span>
                  <span className="text-blue-600 font-bold">
                    {(selectedBook.pricing as any)[`day${day}`]}฿
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}