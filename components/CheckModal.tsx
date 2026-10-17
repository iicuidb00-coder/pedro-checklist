'use client';
import { useState } from 'react';
import { ACHIEVE_TYPES, FAIL_TYPES, FAIL_SUB_TYPES } from '@/constants';
import { AchieveType, FailType, FailSubType, Task } from '@/types';

interface Props {
  task: Task;
  onSave: (done: boolean, achieveType: AchieveType | null, failType: FailType | null, failSubType: FailSubType | null, memo: string) => void;
  onClose: () => void;
}

export default function CheckModal({ task, onSave, onClose }: Props) {
  const [done, setDone] = useState<boolean | null>(task.done);
  const [achieveType, setAchieveType] = useState<AchieveType | null>(task.achieveType);
  const [failType, setFailType] = useState<FailType | null>(task.failType);
  const [failSubType, setFailSubType] = useState<FailSubType | null>(task.failSubType ?? null);
  const [memo, setMemo] = useState(task.memo ?? '');

  const subTypes = failType ? FAIL_SUB_TYPES[failType] : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <h2 className="text-base font-bold mb-1">달성 여부 체크</h2>
          <p className="text-xs text-gray-500 mb-4 line-clamp-2">{task.content}</p>

          {/* Step 1: 완료/미완료 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setDone(true); setFailType(null); setFailSubType(null); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                done === true ? 'bg-green-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-green-50'
              }`}
            >
              ✅ 완료
            </button>
            <button
              onClick={() => { setDone(false); setAchieveType(null); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                done === false ? 'bg-red-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-red-50'
              }`}
            >
              ❌ 미완료
            </button>
          </div>

          {/* 달성 유형 */}
          {done === true && (
            <div className="mb-4 border border-green-200 rounded-lg p-3 bg-green-50">
              <p className="text-xs font-semibold text-green-700 mb-2">달성 유형 선택</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ACHIEVE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setAchieveType(t)}
                    className={`py-1.5 px-2 rounded text-xs transition-all ${
                      achieveType === t
                        ? 'bg-green-500 text-white font-semibold'
                        : 'bg-white border border-green-300 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 미달성 유형 - 1단계 */}
          {done === false && (
            <div className="mb-3 border border-red-200 rounded-lg p-3 bg-red-50">
              <p className="text-xs font-semibold text-red-700 mb-2">① 미달성 유형 선택</p>
              <div className="grid grid-cols-2 gap-1.5">
                {FAIL_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setFailType(t); setFailSubType(null); }}
                    className={`py-1.5 px-2 rounded text-xs transition-all ${
                      failType === t
                        ? 'bg-red-500 text-white font-semibold'
                        : 'bg-white border border-red-300 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 미달성 유형 - 2단계 소분류 */}
          {done === false && failType && subTypes.length > 0 && (
            <div className="mb-3 border border-orange-200 rounded-lg p-3 bg-orange-50">
              <p className="text-xs font-semibold text-orange-700 mb-2">② 세부 원인 선택</p>
              <div className="grid grid-cols-2 gap-1.5">
                {subTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFailSubType(t as FailSubType)}
                    className={`py-1.5 px-2 rounded text-xs transition-all ${
                      failSubType === t
                        ? 'bg-orange-500 text-white font-semibold'
                        : 'bg-white border border-orange-300 text-orange-600 hover:bg-orange-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 메모 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">메모 (선택)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
              취소
            </button>
            <button
              onClick={() => {
                if (done === null) return alert('달성 여부를 선택하세요');
                onSave(done, achieveType, failType, failSubType, memo);
              }}
              className="flex-1 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}