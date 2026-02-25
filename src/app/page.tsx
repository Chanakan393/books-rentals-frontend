'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Book {
  _id: string;
  title: string;
  author: string;
  category: string[]; 
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

  // 🚀 จัดการสถานะการกรอง
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [catSearch, setCatSearch] = useState(''); // ค้นหาหมวดหมู่ใน Sidebar

  // 📚 รายการหมวดหมู่แบบจัดเต็ม
const CATEGORIES = [
  "ทั้งหมด",
  // --- กลุ่มนิยายและวรรณกรรม ---
  "นิยาย (Novel)", "นิยายแปลญี่ปุ่น", "นิยายแปลเกาหลี", "วรรณกรรมคลาสสิก", "วรรณกรรมไทย", 
  "วรรณกรรมเยาวชน", "เรื่องสั้น", "ไลท์โนเวล (Light Novel)", "นิยายวาย / การ์ตูนวาย", 
  "นิยายยูริ / การ์ตูนยูริ", "ย้อนยุค / อิงประวัติศาสตร์",
  
  // --- กลุ่มแนวเรื่อง (Genre) ---
  "แอ็กชัน (Action)", "แฟนตาซี (Fantasy)", "ระทึกขวัญ (Thriller)", "สืบสวนสอบสวน (Mystery)",
  "อาชญากรรม", "ดราม่า", "โรแมนติก", "ตลก (Comedy)", "มิตรภาพ / ชีวิตวัยรุ่น", "เยียวยาจิตใจ",
  
  // --- กลุ่มการ์ตูน ---
  "มังงะ (Manga)", "การ์ตูนความรู้",
  
  // --- กลุ่มความรู้และวิชาการ ---
  "วิทยาศาสตร์", "ชีววิทยา", "ประวัติศาสตร์", "ปรัชญา", "จิตวิทยา", "สารคดี", 
  "ความรู้ทั่วไป", "ภาษาต่างประเทศ", "พจนานุกรม", "คู่มือเตรียมสอบ",
  
  // --- กลุ่มพัฒนาตนเองและธุรกิจ ---
  "การพัฒนาตนเอง (How To)", "บริหารธุรกิจ", "การเงินการลงทุน", "การตลาด / การจัดการ",
  
  // --- กลุ่มคอมพิวเตอร์และเทคโนโลยี ---
  "คอมพิวเตอร์ / โปรแกรมมิ่ง", "AI / Data Science", "Database", "เว็บดีไซน์", "คู่มือการใช้งาน",
  
  // --- กลุ่มไลฟ์สไตล์ ---
  "ท่องเที่ยว", "อาหาร", "สุขภาพ / ความงาม", "สัตว์เลี้ยง", "บ้านและสวน", 
  "งานอดิเรก / งานฝีมือ", "เกม", "โหราศาสตร์ / ดูดวง", "ธรรมะ / ศาสนา",
  
  // --- กลุ่มแม่และเด็ก ---
  "หนังสือเด็ก / นิทาน", "คู่มือเลี้ยงลูก (แม่และเด็ก)", "กิจกรรมเสริมทักษะ",
  
  "หนังสือต่างประเทศ", "อื่นๆ"
];

  // 🔍 กรองหมวดหมู่ใน Sidebar
  const filteredCats = CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(catSearch.toLowerCase())
  );

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory]);

  const fetchBooks = async (search: string = searchTerm) => {
    setLoading(true);
    try {
      const response = await api.get(`/books`, {
        params: {
          search: search || undefined,
          category: selectedCategory !== 'ทั้งหมด' ? selectedCategory : undefined
        }
      });
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
      alert(error.response?.data?.message || 'ไม่สามารถลบได้');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      <section className="bg-blue-600 text-white py-12 px-6 mb-12 shadow-md">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-black mb-4 tracking-tight uppercase">Book Rental Shop</h1>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input 
              type="text" 
              placeholder="พิมพ์ชื่อหนังสือ หรือ ผู้แต่ง..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-6 py-4 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-inner font-bold"
            />
            <button type="submit" className="px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition shadow-xl active:scale-95">
              ค้นหา
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-10">
        
        {/* 🚩 Sidebar: กรองหมวดหมู่แบบฉลาด */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">หมวดหมู่หนังสือ</h3>
            
            {/* 🔍 ช่องค้นหาหมวดหมู่เล็กๆ ใน Sidebar */}
            <input 
              type="text" 
              placeholder="🔍 ค้นหาหมวดหมู่..."
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              className="w-full mb-3 px-4 py-2 text-[11px] font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />

            <div className="flex flex-col gap-1.5 p-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {filteredCats.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-5 py-2.5 rounded-xl text-[13px] font-black transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  {cat}
                </button>
              ))}
              {filteredCats.length === 0 && <p className="p-4 text-center text-[10px] text-gray-400 font-bold italic">ไม่พบหมวดหมู่</p>}
            </div>
          </div>
        </aside>

        {/* 📚 Main Content */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                {selectedCategory !== 'ทั้งหมด' ? `📁 ${selectedCategory}` : '📚 รายการทั้งหมด'}
              </h2>
              {searchTerm && <p className="text-sm text-blue-600 font-bold mt-1 italic">🔎 กำลังค้นหา: "{searchTerm}"</p>}
            </div>
            {user?.role === 'admin' && (
              <button onClick={() => router.push('/admin/manage-book/new')} className="px-6 py-3 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition flex items-center gap-2 shadow-lg">
                <span>➕ เพิ่มหนังสือใหม่</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <>
              {books.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-gray-200">
                  <span className="text-6xl mb-4 block animate-bounce">📚</span>
                  <p className="text-xl font-black text-gray-400 uppercase">ไม่พบหนังสือที่ต้องการ</p>
                  <button onClick={() => { setSearchTerm(''); setSelectedCategory('ทั้งหมด'); }} className="mt-4 text-blue-600 font-bold hover:underline">ดูทั้งหมด</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {books.map((book) => {
                    const isAvailable = book.stock?.available > 0;
                    return (
                      <div key={book._id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group">
                        <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden">
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute top-4 left-4 bg-black/70 text-white text-[9px] font-black px-3 py-1.5 rounded-xl backdrop-blur-md uppercase max-w-[85%] truncate border border-white/20">
                            {Array.isArray(book.category) ? book.category.join(' / ') : book.category}
                          </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-xl font-black text-gray-800 line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{book.title}</h3>
                          <p className="text-xs text-gray-400 mb-6 font-bold italic">By {book.author}</p>
                          <div className="mt-auto">
                            <div className="flex justify-between items-end mb-6">
                              <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-black uppercase">คงเหลือ</p>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                  <span className="font-black text-gray-700 text-sm">{book.stock?.available || 0} / {book.stock?.total || 0}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">เริ่มต้นที่</p>
                                <p className="text-blue-600 font-black text-2xl leading-none">{book.pricing?.day3 || 0}<span className="text-xs font-bold ml-0.5">฿</span></p>
                              </div>
                            </div>
                            {user?.role === 'admin' ? (
                              <div className="flex gap-2">
                                <button onClick={() => router.push(`/admin/manage-book/${book._id}`)} className="flex-1 py-4 bg-amber-500 text-white text-[10px] font-black rounded-2xl hover:bg-amber-600 transition uppercase tracking-widest">แก้ไข</button>
                                <button onClick={() => handleDeleteBook(book._id)} className="px-5 py-4 bg-red-50 text-red-600 text-[10px] font-black rounded-2xl hover:bg-red-500 hover:text-white transition border border-red-100 uppercase">ลบ</button>
                              </div>
                            ) : (
                              <Link href={`/books/${book._id}`} className="block text-center w-full py-4 bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:text-white transition">ดูรายละเอียดการเช่า</Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}