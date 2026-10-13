'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MonthSummary, ChurchId } from '@/types';
import { CHURCHES, CHURCH_MAP, getQuarter, QUARTER_MAP } from '@/constants';
import { getAllChurchSummaries, getYearSummaries } from '@/lib/firestore';

function getNow() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function ym(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function DashboardPage() {
  const { year: thisYear, month: thisMonth } = getNow();

  const [viewYear, setViewYear] = useState(thisYear);
  const [viewMonth, setViewMonth] = useState(thisMonth);
  const [tab, setTab] = useState<'month' | 'quarter' | 'year'>('month');

  // 월별 전체 교회 현황
  const [monthSummaries, setMonthSummaries] = useState<MonthSummary[]>([]);
  // 연간 교회별 월 목록 (선택된 교회)
  const [selectedChurch, setSelectedChurch] = useState<ChurchId>('gwangju');
  const [yearData, setYearData] = useState<MonthSummary[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingYear, setLoadingYear] = useState(true);

  useEffect(() => {
    setLoadingMonth(true);
    getAllChurchSummaries(ym(viewYear, viewMonth)).then((data) => {
      setMonthSummaries(data);
      setLoadingMonth(false);
    });
  }, [viewYear, viewMonth]);

  useEffect(() => {
    setLoadingYear(true);
    getYearSummaries(selectedChurch, viewYear).then((data) => {
      setYearData(data);
      setLoadingYear(false);
    });
  }, [selectedChurch, viewYear]);

  // 월별 탭: 전체 교회 테이블
  function MonthView() {
    const allChurchIds = CHURCHES.map((c) => c.id);
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800 text-sm">
            {viewYear}년 {viewMonth}월 — 교회별 현황
          </h2>
        </div>
        {loadingMonth ? (
          <div className="py-8 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {allChurchIds.map((id) => {
              const s = monthSummaries.find((m) => m.churchId === id);
              const rate = s && s.total > 0 ? Math.round((s.achieved / s.total) * 100) : null;
              return (
                <div key={id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <Link
                      href={`/church/${id}`}
                      className="font-semibold text-gray-800 text-sm hover:text-blue-600"
                    >
                      {CHURCH_MAP[id]}
                    </Link>
                    {s ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-600 font-medium">✅ {s.achieved}</span>
                        <span className="text-red-500">❌ {s.failed}</span>
                        <span className="text-gray-400">⬜ {s.unchecked}</span>
                        <span className="font-bold text-blue-700 ml-1">{rate}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">데이터 없음</span>
                    )}
                  </div>
                  {s && s.total > 0 && (
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${rate}%`,
                          backgroundColor: rate! >= 80 ? '#22c55e' : rate! >= 50 ? '#3b82f6' : '#f97316',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 분기 탭
  function QuarterView() {
    const quarter = getQuarter(viewMonth);
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-600">
          {viewYear}년 {QUARTER_MAP[quarter]} 집계
        </p>
        {CHURCHES.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">{c.name}</span>
              <span className="text-xs text-gray-400">분기 집계 준비중</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 연간 탭 (선택 교회)
  function YearView() {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return (
      <div className="space-y-3">
        {/* 교회 선택 */}
        <div className="flex gap-2 flex-wrap">
          {CHURCHES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChurch(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedChurch === c.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800 text-sm">
              {CHURCH_MAP[selectedChurch]} — {viewYear}년 월별 달성률
            </h2>
          </div>
          {loadingYear ? (
            <div className="py-8 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : (
            <div className="p-4 space-y-2">
              {months.map((m) => {
                const s = yearData.find((d) => d.yearMonth === ym(viewYear, m));
                const rate = s && s.total > 0 ? Math.round((s.achieved / s.total) * 100) : null;
                return (
                  <div key={m} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8 shrink-0">{m}월</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      {rate !== null ? (
                        <div
                          className="h-full rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                          style={{
                            width: `${Math.max(rate, 12)}%`,
                            backgroundColor: rate >= 80 ? '#22c55e' : rate >= 50 ? '#3b82f6' : '#f97316',
                          }}
                        >
                          {rate}%
                        </div>
                      ) : (
                        <div className="h-full flex items-center px-2">
                          <span className="text-xs text-gray-300">-</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 w-16 shrink-0 text-right">
                      {s ? `${s.achieved}/${s.total}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 연간 합계 */}
        {!loadingYear && yearData.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm font-bold text-blue-800 mb-2">{viewYear}년 연간 합계</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: '총 항목', value: yearData.reduce((a, s) => a + s.total, 0), color: 'text-gray-700' },
                { label: '달성', value: yearData.reduce((a, s) => a + s.achieved, 0), color: 'text-green-700' },
                { label: '미달성', value: yearData.reduce((a, s) => a + s.failed, 0), color: 'text-red-600' },
              ].map((item) => (
                <div key={item.label}>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-blue-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-blue-200 text-xs mb-0.5">베드로 지파 교통과</p>
          <h1 className="text-xl font-bold">대시보드</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 연도/월 컨트롤 */}
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[thisYear - 1, thisYear, thisYear + 1].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          {tab !== 'year' && (
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          )}
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['month', 'quarter', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'month' ? '월별' : t === 'quarter' ? '분기별' : '연간'}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {tab === 'month' && <MonthView />}
        {tab === 'quarter' && <QuarterView />}
        {tab === 'year' && <YearView />}

        {/* 교회 바로가기 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">교회 바로가기</h3>
          <div className="grid grid-cols-4 gap-2">
            {CHURCHES.map((c) => (
              <Link
                key={c.id}
                href={`/church/${c.id}`}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <span className="text-xl">⛪</span>
                <span className="text-xs font-medium text-gray-700">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
