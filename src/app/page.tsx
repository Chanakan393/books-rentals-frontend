'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string[]; // 🚀 เปลี่ยน type ให้รองรับ Array
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchBooks();
  }, []);

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

  const handleDeleteBook = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหนังสือเล่มนี้ออกจากระบบ?')) return;
    try {
      await api.delete(`/books/${id}`);
      alert('ลบหนังสือเรียบร้อยแล้ว');
      fetchBooks(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'ไม่สามารถลบได้ เนื่องจากหนังสืออาจติดรายการเช่าอยู่');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
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
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button type="submit" className="px-6 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-gray-800 transition shadow-lg">
              ค้นหา
            </button>
          </form>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-black text-gray-800">รายการหนังสือทั้งหมด</h2>
          {user?.role === 'admin' && (
            <button onClick={() => router.push('/admin/manage-book/new')} className="px-6 py-2 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-md shadow-green-100">
              <span>➕ เพิ่มหนังสือใหม่</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => {
              const isAvailable = book.stock?.available > 0 && String(book.status).toLowerCase() === 'available';

              return (
                <div key={book._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">ไม่มีรูปภาพ</div>
                    )}
                    {/* 🚀 โชว์หมวดหมู่หลายอันด้วยการ Join */}
                    <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-sm uppercase tracking-widest max-w-[80%] truncate">
                      {Array.isArray(book.category) && book.category.length > 0 ? book.category.join(' / ') : (book.category || 'ทั่วไป')}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-black text-gray-800 line-clamp-2 leading-tight mb-1" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 font-medium">ผู้แต่ง: {book.author}</p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-center text-xs mb-5">
                        <span className="text-gray-600 font-bold bg-gray-50 px-2 py-1 rounded border">
                          เหลือ: <strong className={book.stock?.available > 0 ? 'text-blue-600' : 'text-red-500'}>
                            {book.stock?.available || 0}
                          </strong>/{book.stock?.total || 0}
                        </span>
                        <span className="text-blue-600 font-black text-sm">เริ่ม {book.pricing?.day3 || 0}฿</span>
                      </div>

                      {user?.role === 'admin' ? (
                        <div className="flex gap-2">
                          <button onClick={() => router.push(`/admin/manage-book/${book._id}`)} className="flex-1 py-2.5 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 transition shadow-sm uppercase">แก้ไข</button>
                          <button onClick={() => handleDeleteBook(book._id)} className="px-4 py-2.5 bg-red-50 text-red-600 text-xs font-black rounded-xl hover:bg-red-500 hover:text-white transition border border-red-100 uppercase">ลบ</button>
                        </div>
                      ) : (
                        <Link href={`/books/${book._id}`} className="block text-center w-full py-3 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition border border-transparent hover:border-blue-700 shadow-sm">
                          ดูรายละเอียด
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}