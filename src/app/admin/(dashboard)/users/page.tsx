"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { User } from "@/lib/api";
import { Loader2, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers({ page, limit: 12 });
      if(data && data.users) {
           setUsers(data.users);
           setTotalCount(data.totalCount || 0);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [page]);
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Users</h1>
          <p className="text-gray-500 text-sm">Registered customers</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="animate-spin text-green-600" size={30} />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
            <p className="text-gray-500">No users found or endpoint not available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
                <div key={user.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-semibold text-gray-900">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{user.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 border border-gray-200">
                                {user.role}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                            <Mail size={16} className="text-gray-400" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone size={16} className="text-gray-400" />
                            <span>{user.phone}</span>
                        </div>
                        {user.createdAt && (
                             <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-gray-400" />
                                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}
      {}
      {totalCount > 12 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
                Previous
            </button>
            <button
                disabled={page * 12 >= totalCount}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
                Next
            </button>
        </div>
      )}
    </div>
  );
}
