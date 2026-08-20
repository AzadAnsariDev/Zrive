import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import {
  TrendingUp, ShoppingBag, IndianRupee, Package,
  Award, ArrowUpRight, BarChart3, ArrowLeft
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import useSeller from '../hook/useSeller'
import { useProduct } from '../../product/hook/useProduct'

const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`

// Orders the seller actually engaged with (accepted / fulfilled)
const ACCEPTED_STATUSES = new Set(['accepted', 'confirmed', 'packed', 'shipped', 'delivered', 'completed'])

const isAcceptedOrder = (o) => {
  const conf = (o.confirmationStatus || '').toLowerCase()
  const st = (o.orderStatus || '').toLowerCase()
  // Seller explicitly accepted
  if (ACCEPTED_STATUSES.has(conf)) return true
  // OR order progressed past placement (shipped/delivered implies seller accepted)
  if (['shipped', 'delivered', 'completed'].includes(st)) return true
  return false
}

const STATUS_COLORS = {
  Delivered: '#287A4B',
  Confirmed: '#B08D57',
  Placed: '#536B7A',
  Shipped: '#3B82F6',
  'Timed Out': '#DC2626',
  Rejected: '#EF4444',
}

const SellerAnalytics = () => {
  const navigate = useNavigate()
  const { handleGetSellerOrders } = useSeller()
  const { handleGetSellerProducts } = useProduct()

  const orders = useSelector((state) => state.seller.allOrders || [])
  const [timeframe, setTimeframe] = useState('30d')
  const [metricTab, setMetricTab] = useState('revenue')

  useEffect(() => {
    handleGetSellerOrders()
    handleGetSellerProducts()
  }, [])

  const timeframeDays = useMemo(() => {
    switch (timeframe) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      default: return 180
    }
  }, [timeframe])

  // Timeframe slice of all orders (for counts/charts)
  const filteredOrders = useMemo(() => {
    if (timeframe === 'all') return orders
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - timeframeDays)
    return orders.filter((o) => o.createdAt && new Date(o.createdAt) >= cutoff)
  }, [orders, timeframe, timeframeDays])

  // Revenue only from orders the seller accepted/fulfilled
  const acceptedOrders = useMemo(() => filteredOrders.filter(isAcceptedOrder), [filteredOrders])

  // ── KPI stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let grossRevenue = 0
    let totalUnits = 0
    let deliveredCount = 0
    let timedOutCount = 0
    let rejectedCount = 0

    filteredOrders.forEach((o) => {
      const conf = (o.confirmationStatus || '').toLowerCase()
      const st = (o.orderStatus || '').toLowerCase()

      const isTimeout =
        conf === 'expired' || conf === 'timeout' ||
        o.cancelReason === 'seller_no_response' ||
        (conf === 'pending' && !!o.confirmationDeadline &&
          new Date(o.confirmationDeadline).getTime() < Date.now())

      if (isTimeout) { timedOutCount++; return }
      if (conf === 'rejected' || st === 'cancelled') { rejectedCount++; return }
      if (st === 'delivered' || st === 'completed') deliveredCount++
    })

    // Revenue: only accepted orders
    acceptedOrders.forEach((o) => {
      const amount = Number(o.sellerAmount?.amount ?? o.sellerAmount ?? 0)
      grossRevenue += amount
      const units = o.orderItems?.reduce((s, it) => s + (Number(it.quantity) || 1), 0) || 1
      totalUnits += units
    })

    const totalOrdersCount = filteredOrders.length
    const acceptedCount = acceptedOrders.length
    const aov = acceptedCount > 0 ? Math.round(grossRevenue / acceptedCount) : 0
    const fulfillmentRate = totalOrdersCount > 0
      ? Math.round((acceptedCount / totalOrdersCount) * 100)
      : 100
    const rejectionRate = totalOrdersCount > 0
      ? Math.round(((timedOutCount + rejectedCount) / totalOrdersCount) * 100)
      : 0

    return {
      grossRevenue, totalOrdersCount, acceptedCount,
      totalUnits, aov, fulfillmentRate, rejectionRate, deliveredCount
    }
  }, [filteredOrders, acceptedOrders])

  // ── Chart series (revenue only from accepted orders) ─────────────────
  const chartSeries = useMemo(() => {
    const now = new Date()
    const daysToMap = timeframeDays === 180 ? 30 : timeframeDays
    const buckets = []

    for (let i = daysToMap - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: daysToMap > 14 ? 'short' : 'numeric'
      })
      buckets.push({ key, date: label, revenue: 0, orders: 0, units: 0 })
    }

    const map = Object.fromEntries(buckets.map((b) => [b.key, b]))

    // Revenue chart only uses accepted orders
    acceptedOrders.forEach((o) => {
      if (!o.createdAt) return
      const key = new Date(o.createdAt).toISOString().slice(0, 10)
      if (map[key]) {
        map[key].revenue += Number(o.sellerAmount?.amount ?? o.sellerAmount ?? 0)
        map[key].units += o.orderItems?.reduce((s, it) => s + (Number(it.quantity) || 1), 0) || 1
      }
    })

    // Order count uses all filtered orders
    filteredOrders.forEach((o) => {
      if (!o.createdAt) return
      const key = new Date(o.createdAt).toISOString().slice(0, 10)
      if (map[key]) map[key].orders += 1
    })

    return buckets
  }, [filteredOrders, acceptedOrders, timeframeDays])

  // ── Status distribution ───────────────────────────────────────────────
  const statusDistribution = useMemo(() => {
    const counts = { Delivered: 0, Confirmed: 0, Placed: 0, Shipped: 0, 'Timed Out': 0, Rejected: 0 }

    filteredOrders.forEach((o) => {
      const conf = (o.confirmationStatus || '').toLowerCase()
      const st = (o.orderStatus || '').toLowerCase()
      const isTimeout =
        conf === 'expired' || conf === 'timeout' ||
        o.cancelReason === 'seller_no_response' ||
        (conf === 'pending' && !!o.confirmationDeadline &&
          new Date(o.confirmationDeadline).getTime() < Date.now())

      if (isTimeout) counts['Timed Out']++
      else if (conf === 'rejected' || st === 'cancelled') counts['Rejected']++
      else if (st === 'delivered' || st === 'completed') counts['Delivered']++
      else if (st === 'shipped') counts['Shipped']++
      else if (ACCEPTED_STATUSES.has(conf)) counts['Confirmed']++
      else counts['Placed']++
    })

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
  }, [filteredOrders])

  // ── Top products (all orders) ──────────────────────────────────────
  const topProducts = useMemo(() => {
    const productStats = {}
    filteredOrders.forEach((o) => {
      ;(o.orderItems || []).forEach((it) => {
        const pId = it.productId?._id || it.productId || it.title || 'unknown'
        if (!productStats[pId]) {
          productStats[pId] = {
            id: pId,
            title: it.title || it.productId?.title || 'Product',
            image: it.images?.[0]?.url || (typeof it.images?.[0] === 'string' ? it.images[0] : null) || null,
            unitsSold: 0,
            revenue: 0,
          }
        }
        const qty = Number(it.quantity) || 1
        productStats[pId].unitsSold += qty
        productStats[pId].revenue += qty * (Number(it.price?.amount ?? it.price ?? 0) || 0)
      })
    })
    return Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [filteredOrders])

  // ── UI ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-[#111] pb-12">

      {/* Header */}
      <div className="border-b border-[#EBEBEB] bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/seller')}
              className="md:hidden mt-1 p-1.5 rounded-full bg-[#EBEBEB] text-[#111] hover:bg-[#D4D4D4] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D57]">SaaS Intelligence Hub</p>
              <h1 className="text-[20px] font-bold text-[#111] mt-0.5">Sales & Performance</h1>
              <p className="text-[11px] text-[#888] mt-0.5">Revenue reflects only accepted & fulfilled orders.</p>
            </div>
          </div>

          {/* Timeframe tabs */}
          <div className="flex items-center gap-1 bg-[#EBEBEB] p-1 rounded-md self-start sm:self-auto">
            {[
              { key: '7d', label: '7D' },
              { key: '30d', label: '30D' },
              { key: '90d', label: '90D' },
              { key: 'all', label: 'All' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeframe(t.key)}
                className={`px-3 py-1 text-[11px] font-bold rounded cursor-pointer transition-all ${
                  timeframe === t.key
                    ? 'bg-white text-[#111] shadow-sm'
                    : 'text-[#888] hover:text-[#111]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-8 space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Accepted Revenue',
              value: formatINR(stats.grossRevenue),
              sub: `${stats.acceptedCount} of ${stats.totalOrdersCount} orders accepted`,
              icon: <IndianRupee size={14} className="text-[#B08D57]" />,
              subColor: 'text-[#287A4B]',
            },
            {
              label: 'Total Orders Placed',
              value: stats.totalOrdersCount,
              sub: `${stats.acceptedCount} accepted`,
              icon: <ShoppingBag size={14} className="text-[#3B82F6]" />,
              subColor: 'text-[#666]',
            },
            {
              label: 'Avg Order Value',
              value: formatINR(stats.aov),
              sub: 'Per accepted order',
              icon: <TrendingUp size={14} className="text-[#10B981]" />,
              subColor: 'text-[#666]',
            },
            {
              label: 'Acceptance Rate',
              value: `${stats.fulfillmentRate}%`,
              sub: `Rejection: ${stats.rejectionRate}%`,
              icon: <Award size={14} className="text-[#F59E0B]" />,
              subColor: stats.rejectionRate > 20 ? 'text-[#DC2626]' : 'text-[#287A4B]',
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#AAA]">
                  {kpi.label}
                </span>
                {kpi.icon}
              </div>
              <p className="text-[22px] font-bold text-[#111]">{kpi.value}</p>
              <p className={`text-[10.5px] font-medium mt-1 ${kpi.subColor}`}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#B08D57]">Trend Analysis</p>
              <h2 className="text-[14px] font-bold text-[#111] mt-0.5">Revenue & Order Velocity</h2>
            </div>

            <div className="flex bg-[#EBEBEB] rounded p-0.5 gap-0.5">
              {[
                { key: 'revenue', label: '₹ Revenue' },
                { key: 'orders', label: 'Orders' },
                { key: 'units', label: 'Units' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetricTab(m.key)}
                  className={`px-3 py-1 text-[10.5px] font-bold rounded cursor-pointer transition-all ${
                    metricTab === m.key
                      ? 'bg-white text-[#111] shadow-sm'
                      : 'text-[#888]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartSeries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B08D57" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#B08D57" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#AAA' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#AAA' }}
                  tickFormatter={(v) => metricTab === 'revenue' ? `₹${v}` : v} />
                <Tooltip
                  contentStyle={{ background: '#111', border: 'none', borderRadius: 6, color: '#FFF', fontSize: 12 }}
                  formatter={(v) => [metricTab === 'revenue' ? formatINR(v) : v, '']}
                />
                <Area type="monotone" dataKey={metricTab} stroke="#B08D57" strokeWidth={2}
                  fill="url(#areaGold)" dot={false}
                  activeDot={{ r: 4, fill: '#B08D57', stroke: '#FFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Donut */}
          <div className="lg:col-span-2 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#B08D57] mb-1">Order Breakdown</p>
            <h3 className="text-[13px] font-bold text-[#111] mb-5">Fulfillment Distribution</h3>

            {statusDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-36 text-[12px] text-[#AAA]">No orders yet</div>
            ) : (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusDistribution} cx="50%" cy="50%"
                        innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="value">
                        {statusDistribution.map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.name] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: 6, color: '#FFF', fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {statusDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-[10.5px]">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[item.name] }} />
                      <span className="text-[#666] truncate">{item.name}:</span>
                      <strong className="text-[#111]">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Top Products */}
          <div className="lg:col-span-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#B08D57] mb-1">Top Performers</p>
                <h3 className="text-[13px] font-bold text-[#111]">All Orders Catalog</h3>
              </div>
              <button
                onClick={() => navigate('/seller/inventory')}
                className="text-[11px] font-bold text-[#B08D57] hover:underline cursor-pointer"
              >
                Inventory →
              </button>
            </div>

            {topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-[12px] text-[#AAA]">
                No orders in this period
              </div>
            ) : (
              <div className="divide-y divide-[#EBEBEB]">
                {topProducts.map((p, idx) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-bold text-[#CCC] w-4">#{idx + 1}</span>
                      <div className="w-10 h-12 rounded-md bg-[#F0F0F0] border border-[#EBEBEB] overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image
                          ? <img src={p.image} alt="" className="w-full h-full object-cover" />
                          : <Package size={14} className="text-[#CCC]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-[#111] truncate">{p.title}</p>
                        <p className="text-[10.5px] text-[#888]">{p.unitsSold} units ordered</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-bold text-[#111]">{formatINR(p.revenue)}</p>
                      <span className="text-[9.5px] font-bold text-[#B08D57] bg-[#FAF8F5] px-1.5 py-0.5 rounded">
                        Gross Vol
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerAnalytics
