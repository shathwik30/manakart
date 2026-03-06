"use client";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from "lucide-react";
interface ChartDataPoint {
  date: string;
  dateLabel: string;
  orders: number;
  revenue: number;
}
interface AnalyticsChartProps {
  data: ChartDataPoint[];
  growth: number;
}
type MetricType = "revenue" | "orders";
export function AnalyticsChart({ data, growth }: AnalyticsChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>("revenue");
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {payload[0].payload.dateLabel}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <span className="text-sm text-gray-600">Revenue:</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(payload[0].payload.revenue)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-600" />
              <span className="text-sm text-gray-600">Orders:</span>
              <span className="text-sm font-semibold text-gray-900">
                {payload[0].payload.orders}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-2xl text-gray-900 mb-2">
              Sales Analytics
            </h2>
            <p className="text-sm text-gray-500">Last 30 days performance</p>
          </div>
          {/* Metric Selector */}
          <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-lg">
            <button
              onClick={() => setActiveMetric("revenue")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeMetric === "revenue"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Revenue
            </button>
            <button
              onClick={() => setActiveMetric("orders")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeMetric === "orders"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Orders
            </button>
          </div>
        </div>
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gradient-to-br from-green-50 to-gray-50 p-4 rounded-xl">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatPrice(totalRevenue)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {growth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  growth >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {growth >= 0 ? "+" : ""}
                {growth}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-50 p-4 rounded-xl">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
            <p className="text-sm text-gray-500 mt-2">
              Avg: {totalOrders > 0 ? Math.round(totalRevenue / totalOrders / 100) : 0} per order
            </p>
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#111827" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#111827" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                activeMetric === "revenue"
                  ? `₹${(value / 100000).toFixed(0)}K`
                  : value.toString()
              }
            />
            <Tooltip content={<CustomTooltip />} />
            {activeMetric === "revenue" && (
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={3}
                fill="url(#colorRevenue)"
                animationDuration={1000}
              />
            )}
            {activeMetric === "orders" && (
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#111827"
                strokeWidth={3}
                fill="url(#colorOrders)"
                animationDuration={1000}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
