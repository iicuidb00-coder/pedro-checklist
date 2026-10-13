import Link from 'next/link';
import { CHURCHES } from '@/constants';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🚐</div>
          <h1 className="text-2xl font-bold text-gray-900">베드로 지파 교통과</h1>
          <p className="text-sm text-gray-500 mt-1">월간 업무 체크리스트</p>
        </div>

        <Link
          href="/dashboard"
          className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-center shadow-md hover:shadow-lg transition-all mb-6"
        >
          📊 대시보드 보기
        </Link>

        <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">교회 선택</h2>
        <div className="grid grid-cols-2 gap-3">
          {CHURCHES.map((church) => (
            <Link
              key={church.id}
              href={`/church/${church.id}`}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div className="text-3xl mb-2">⛪</div>
              <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {church.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">교회</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
