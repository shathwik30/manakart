"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  orders: number;
  revenue: number;
}

interface Stats {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
  };
  thisMonth: {
    orders: number;
    revenue: number;
    growth: number;
  };
  chartData: ChartDataPoint[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data); 
      } catch {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? formatPrice(stats.overview.totalRevenue) : "-",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: stats ? stats.overview.totalOrders.toLocaleString() : "-",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Active Products",
      value: stats ? stats.overview.totalProducts.toLocaleString() : "-",
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Total Users",
      value: stats ? stats.overview.totalUsers.toLocaleString() : "-",
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif text-charcoal-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-charcoal-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-500 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-charcoal-900">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {/* Analytics Chart */}
      {stats && stats.chartData && stats.chartData.length > 0 && (
        <div className="mt-8">
          <AnalyticsChart
            data={stats.chartData}
            growth={stats.thisMonth?.growth || 0}
          />
        </div>
      )}
    </div>
  );
}
