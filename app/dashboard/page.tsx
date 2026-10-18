'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { CHURCHES, ACHIEVE_TYPES, FAIL_TYPES } from '@/constants';
import { AchieveType, ChurchId, FailType, MonthSummary } from '@/types';
import { getAllChurchSummaries, getYearSummaries } from '@/lib/firestore';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function currentYM() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthOptions() {
  const now = new Date();
  const opts = [];
  for (let i = -5; i <= 1; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    opts.push(ym);
  }
  return opts;
}

function currentYear() {
  return new Date().getFullYear();
}

type Tab = 'monthly' | 'quarterly' | 'yearly';

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('monthly');
  const [yearMonth, setYearMonth] = useState(currentYM());
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [yearSummaries, setYearSummaries] = useState<MonthSummary[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<ChurchId>('gwangju');
  const [loading, setLoading] = useState(false);

  const changeMonth = (delta: number) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newYM = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setYearMonth(newYM);
  };

  // Aggregate stats for the selected month/period
  const aggregateStats = useMemo(() => {
    if (summaries.length === 0) return null;

    const stats = {
      total: 0,
      achieved: 0,
      failed: 0,
      achieveTypes: {} as Record<string, number>,
      failTypes: {} as Record<string, number>,
    };

    summaries.forEach((s) => {
      stats.total += s.total;
      stats.achieved += s.achieved;
      stats.failed += s.failed;

      Object.entries(s.achieveTypeCounts || {}).forEach(([type, count]) => {
        stats.achieveTypes[type] = (stats.achieveTypes[type] || 0) + (count as number);
      });
      Object.entries(s.failTypeCounts || {}).forEach(([type, count]) => {
        stats.failTypes[type] = (stats.failTypes[type] || 0) + (count as number);
      });
    });

    return stats;
  }, [summaries]);

  const achieveChartData = useMemo(() => {
    if (!aggregateStats) return [];
    return Object.entries(aggregateStats.achieveTypes)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [aggregateStats]);

  const failChartData = useMemo(() => {
    if (!aggregateStats) return [];
    return Object.entries(aggregateStats.failTypes)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [aggregateStats]);

  useEffect(() => {
    if (tab === 'monthly') {
      setLoading(true);
      getAllChurchSummaries(yearMonth).then(setSummaries).finally(() => setLoading(false));
    }
  }, [tab, yearMonth]);

  useEffect(() => {
    if (tab === 'yearly') {
      setLoading(true);
      getYearSummaries(selectedChurch, currentYear()).then(setYearSummaries).finally(() => setLoading(false));
    }
  }, [tab, selectedChurch]);

  useEffect(() => {
    if (tab === 'quarterly') {
      setLoading(true);
      getAllChurchSummaries(yearMonth).then(setSummaries).finally(() => setLoading(false));
    }
  }, [tab, yearMonth]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-xs text-blue-500 hover:underline">← 목록</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">대시보드</h1>
            <p className="text-sm text-gray-400">베드로 지파 교통과</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6">
          {(['monthly', 'quarterly', 'yearly'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'monthly' ? '월별' : t === 'quarterly' ? '분기별' : '연간'}
            </button>
          ))}
        </div>

        {/* Monthly tab */}
        {tab === 'monthly' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">지파 전체 분석</h2>
              
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                  {yearMonth.replace('-', '년 ')}월
                </span>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                <p>데이터를 분석 중입니다...</p>
              </div>
            ) : (
              <>
                {/* Global Stats Overview */}
                {aggregateStats && aggregateStats.total > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-400 font-medium mb-1">전체 달성률</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-blue-600">
                          {Math.round((aggregateStats.achieved / aggregateStats.total) * 100)}%
                        </span>
                        <span className="text-sm text-gray-400 mb-1">
                          ({aggregateStats.achieved}/{aggregateStats.total})
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-400 font-medium mb-1">최다 달성 전략</p>
                      <p className="text-xl font-bold text-green-600 truncate">
                        {achieveChartData.sort((a, b) => b.value - a.value)[0]?.name || '-'}
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-400 font-medium mb-1">주요 미달성 사유</p>
                      <p className="text-xl font-bold text-red-500 truncate">
                        {failChartData.sort((a, b) => b.value - a.value)[0]?.name || '-'}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Charts Section */}
                {aggregateStats && aggregateStats.total > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-700 mb-4">달성 사유 분석</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={achieveChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {achieveChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-700 mb-4">미달성 사유 분석</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={failChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {failChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Church List Section */}
                <div className="pt-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">교회별 상세 현황</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CHURCHES.map((church) => {
                      const s = summaries.find((sm) => sm.churchId === church.id);
                      const total = s?.total ?? 0;
                      const achieved = s?.achieved ?? 0;
                      const rate = total > 0 ? Math.round((achieved / total) * 100) : 0;
                      return (
                        <div key={church.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <Link href={`/church/${church.id}`} className="font-bold text-gray-800 hover:text-blue-600 flex items-center gap-1">
                              {church.name} <span className="text-[10px] text-gray-300 font-normal">→</span>
                            </Link>
                            <span className={`text-sm font-bold ${rate >= 80 ? 'text-green-500' : rate >= 50 ? 'text-blue-500' : 'text-orange-500'}`}>
                              {rate}%
                            </span>
                          </div>
                          
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between text-[11px] text-gray-500">
                            <div className="flex gap-2">
                              <span>전체 <b className="text-gray-700">{total}</b></span>
                              <span>달성 <b className="text-green-600">{achieved}</b></span>
                            </div>
                            <span className="text-red-400">미달성 {s?.failed ?? 0}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quarterly tab */}
        {tab === 'quarterly' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">분기별 현황</h2>
              
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                  {yearMonth.replace('-', '년 ')}월
                </span>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            {(() => {
              const month = parseInt(yearMonth.split('-')[1]);
              const quarter = Math.ceil(month / 3);
              const qMonths = [1, 2, 3].map((i) => {
                const m = (quarter - 1) * 3 + i;
                return `${yearMonth.split('-')[0]}-${String(m).padStart(2, '0')}`;
              });

              return (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-blue-700 font-semibold text-lg">{quarter}분기</p>
                    <p className="text-blue-500 text-sm">{qMonths[0].replace('-', '년 ')}월 ~ {qMonths[2].replace('-', '년 ')}월</p>
                  </div>

                  {CHURCHES.map((church) => {
                    const churchSums = summaries.filter((s) => s.churchId === church.id);
                    const totalAll = churchSums.reduce((a, s) => a + s.total, 0);
                    const achievedAll = churchSums.reduce((a, s) => a + s.achieved, 0);
                    const rate = totalAll > 0 ? Math.round((achievedAll / totalAll) * 100) : 0;
                    return (
                      <div key={church.id} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">{church.name} 교회</span>
                          <span className="text-blue-600 font-bold text-sm">{rate}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-400 to-blue-500 rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">전체 {totalAll} · 달성 {achievedAll}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Yearly tab */}
        {tab === 'yearly' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">{currentYear()}년 추이 분석</h2>
              <select
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value as ChurchId)}
              >
                {CHURCHES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} 교회</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400 bg-white rounded-2xl shadow-sm">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                <p>데이터를 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Yearly Trend Chart */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-6">월별 달성률 추이</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Array.from({ length: 12 }, (_, i) => {
                          const m = i + 1;
                          const ym = `${currentYear()}-${String(m).padStart(2, '0')}`;
                          const s = yearSummaries.find((sm) => sm.yearMonth === ym);
                          const rate = s && s.total > 0 ? Math.round((s.achieved / s.total) * 100) : 0;
                          return { name: `${m}월`, rate };
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                          cursor={{ fill: '#f3f4f6' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} name="달성률(%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = i + 1;
                    const ym = `${currentYear()}-${String(m).padStart(2, '0')}`;
                    const s = yearSummaries.find((sm) => sm.yearMonth === ym);
                    const total = s?.total ?? 0;
                    const achieved = s?.achieved ?? 0;
                    const rate = total > 0 ? Math.round((achieved / total) * 100) : 0;
                    if (total === 0) return null;
                    return (
                      <div key={ym} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-gray-700">{m}월</span>
                          <p className="text-[10px] text-gray-400 mt-0.5">전체 {total} · 달성 {achieved}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600">{rate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Annual summary card */}
                {yearSummaries.length > 0 && (() => {
                  const totalAll = yearSummaries.reduce((a, s) => a + s.total, 0);
                  const achievedAll = yearSummaries.reduce((a, s) => a + s.achieved, 0);
                  const rate = totalAll > 0 ? Math.round((achievedAll / totalAll) * 100) : 0;
                  return (
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                      <div className="relative z-10">
                        <p className="text-blue-100 text-sm font-medium mb-1">
                          {CHURCHES.find(c => c.id === selectedChurch)?.name} 교회 연간 통합 지표
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-4xl font-black">{rate}%</p>
                            <p className="text-sm text-blue-100/70 mt-1 uppercase tracking-wider font-semibold">
                              Total Performance Index
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{achievedAll}</p>
                            <p className="text-[10px] text-blue-100/60 mt-1">Total Achieved / {totalAll}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
