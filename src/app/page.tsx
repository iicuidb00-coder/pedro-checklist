import Link from 'next/link';
import { CHURCHES } from '@/constants';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-blue-200 text-xs mb-1">베드로 지파 교통과</p>
          <h1 className="text-2xl font-bold">월간 체크리스트</h1>
          <p className="text-blue-200 text-sm mt-1">교회를 선택하세요</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {CHURCHES.map((c) => (
          <Link
            key={c.id}
            href={`/church/${c.id}`}
            className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <span className="text-3xl">⛪</span>
            <div>
              <p className="font-bold text-gray-800 group-hover:text-blue-700">{c.name}</p>
              <p className="text-xs text-gray-400">체크리스트 바로가기</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-blue-400 text-xl">›</span>
          </Link>
        ))}

        <Link
          href="/dashboard"
          className="flex items-center gap-4 bg-blue-600 rounded-2xl px-5 py-4 shadow-sm hover:bg-blue-700 transition-all group mt-6"
        >
          <span className="text-3xl">📊</span>
          <div>
            <p className="font-bold text-white">대시보드</p>
            <p className="text-xs text-blue-200">전체 현황 및 통계 보기</p>
          </div>
          <span className="ml-auto text-blue-300 group-hover:text-white text-xl">›</span>
        </Link>
      </div>
    </div>
  );
}
