'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function MemberManagementPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/users'); // เรียกใช้ findAll() ที่เราทำไว้
        setMembers(res.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8 font-sans">จัดการสมาชิก 👥</h1>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-black text-gray-400 uppercase">ชื่อผู้ใช้งาน</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase">อีเมล</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase">เบอร์โทรศัพท์</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: any) => (
                <tr key={m._id} className="border-b last:border-0 hover:bg-gray-50/50 transition font-sans">
                  <td className="p-4 font-bold text-gray-800">{m.username}</td>
                  <td className="p-4 text-sm text-gray-600">{m.email}</td>
                  <td className="p-4 text-sm text-gray-600">{m.phoneNumber || '-'}</td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/admin/members/${m._id}`}
                      className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition"
                    >
                      ดูประวัติการเช่า
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}