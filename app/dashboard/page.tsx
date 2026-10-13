'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CHURCHES } from '@/constants';
import { ChurchId, MonthSummary } from '@/types';
import { getAllChurchSummaries, getYearSummaries } from '@/lib/firestore';

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
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">교회별 현황</h2>
              <select
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
              >
                {getMonthOptions().map((ym) => (
                  <option key={ym} value={ym}>{ym.replace('-', '년 ')}월</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">불러오는 중...</div>
            ) : (
              <div className="space-y-3">
                {CHURCHES.map((church) => {
                  const s = summaries.find((sm) => sm.churchId === church.id);
                  const total = s?.total ?? 0;
                  const achieved = s?.achieved ?? 0;
                  const rate = total > 0 ? Math.round((achieved / total) * 100) : 0;
                  return (
                    <div key={church.id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <Link href={`/church/${church.id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                          {church.name} 교회
                        </Link>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>전체 {total}</span>
                          <span className="text-green-600 font-medium">달성 {achieved}</span>
                          <span className="text-red-500">미달성 {s?.failed ?? 0}</span>
                          <span className="text-blue-600 font-bold">{rate}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quarterly tab */}
        {tab === 'quarterly' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">분기별 현황</h2>
              <select
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
              >
                {getMonthOptions().map((ym) => (
                  <option key={ym} value={ym}>{ym.replace('-', '년 ')}월</option>
                ))}
              </select>
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
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700">{currentYear()}년 연간 현황</h2>
              <select
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value as ChurchId)}
              >
                {CHURCHES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">불러오는 중...</div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 12 }, (_, i) => {
                  const m = i + 1;
                  const ym = `${currentYear()}-${String(m).padStart(2, '0')}`;
                  const s = yearSummaries.find((sm) => sm.yearMonth === ym);
                  const total = s?.total ?? 0;
                  const achieved = s?.achieved ?? 0;
                  const rate = total > 0 ? Math.round((achieved / total) * 100) : 0;
                  return (
                    <div key={ym} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">{m}월</span>
                        <div className="flex gap-3 text-xs text-gray-500">
                          {total > 0 ? (
                            <>
                              <span>전체 {total}</span>
                              <span className="text-green-600">달성 {achieved}</span>
                              <span className="text-blue-600 font-bold">{rate}%</span>
                            </>
                          ) : (
                            <span className="text-gray-300">데이터 없음</span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Annual summary */}
                {yearSummaries.length > 0 && (() => {
                  const totalAll = yearSummaries.reduce((a, s) => a + s.total, 0);
                  const achievedAll = yearSummaries.reduce((a, s) => a + s.achieved, 0);
                  const rate = totalAll > 0 ? Math.round((achievedAll / totalAll) * 100) : 0;
                  return (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-md">
                      <p className="text-sm opacity-80 mb-1">{CHURCHES.find(c => c.id === selectedChurch)?.name} 교회 연간 합계</p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold">{rate}%</p>
                          <p className="text-sm opacity-70 mt-1">전체 {totalAll} · 달성 {achievedAll}</p>
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
