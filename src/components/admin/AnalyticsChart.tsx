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

  // Calculate totals
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-elegant border border-charcoal-100">
          <p className="text-sm font-medium text-charcoal-900 mb-2">
            {payload[0].payload.dateLabel}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold-500" />
              <span className="text-sm text-charcoal-600">Revenue:</span>
              <span className="text-sm font-semibold text-charcoal-900">
                {formatPrice(payload[0].payload.revenue)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-charcoal-600" />
              <span className="text-sm text-charcoal-600">Orders:</span>
              <span className="text-sm font-semibold text-charcoal-900">
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
    <div className="bg-white rounded-2xl shadow-soft-md border border-charcoal-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-charcoal-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-charcoal-900 mb-2">
              Sales Analytics
            </h2>
            <p className="text-sm text-charcoal-500">Last 30 days performance</p>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-2 p-1 bg-cream-100 rounded-lg">
            <button
              onClick={() => setActiveMetric("revenue")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeMetric === "revenue"
                  ? "bg-white text-charcoal-900 shadow-sm"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Revenue
            </button>
            <button
              onClick={() => setActiveMetric("orders")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeMetric === "orders"
                  ? "bg-white text-charcoal-900 shadow-sm"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Orders
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gradient-to-br from-gold-50 to-cream-100 p-4 rounded-xl">
            <p className="text-sm font-medium text-charcoal-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-charcoal-900">
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
              <span className="text-xs text-charcoal-500">vs last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-charcoal-50 to-cream-100 p-4 rounded-xl">
            <p className="text-sm font-medium text-charcoal-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-charcoal-900">{totalOrders}</p>
            <p className="text-sm text-charcoal-500 mt-2">
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
                <stop offset="5%" stopColor="#C05800" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C05800" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D2D2D" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2D2D2D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
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
                stroke="#C05800"
                strokeWidth={3}
                fill="url(#colorRevenue)"
                animationDuration={1000}
              />
            )}

            {activeMetric === "orders" && (
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#2D2D2D"
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
