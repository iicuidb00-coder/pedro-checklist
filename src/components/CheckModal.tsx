'use client';
import { useState } from 'react';
import { Task, AchieveType, FailType } from '@/types';
import { ACHIEVE_TYPES, FAIL_TYPES } from '@/constants';

interface Props {
  task: Task;
  onSave: (done: boolean, achieveType: AchieveType | null, failType: FailType | null, memo: string) => void;
  onClose: () => void;
}

export default function CheckModal({ task, onSave, onClose }: Props) {
  const [done, setDone] = useState<boolean | null>(task.done);
  const [achieveType, setAchieveType] = useState<AchieveType | null>(task.achieveType);
  const [failType, setFailType] = useState<FailType | null>(task.failType);
  const [memo, setMemo] = useState(task.memo ?? '');

  function handleSave() {
    if (done === null) return;
    onSave(done, done ? achieveType : null, !done ? failType : null, memo);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">달성 결과 체크</h2>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.content}</p>
        </div>

        <div className="p-5 space-y-5">
          {/* 달성 여부 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">달성 여부</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setDone(true); setFailType(null); }}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  done === true
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-green-300'
                }`}
              >
                ✅ 달성
              </button>
              <button
                onClick={() => { setDone(false); setAchieveType(null); }}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  done === false
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-red-300'
                }`}
              >
                ❌ 미달성
              </button>
            </div>
          </div>

          {/* 달성 유형 */}
          {done === true && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">달성 유형</p>
              <div className="grid grid-cols-2 gap-2">
                {ACHIEVE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setAchieveType(achieveType === t ? null : t)}
                    className={`py-2 rounded-lg border-2 text-sm transition-all ${
                      achieveType === t
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 미달성 유형 */}
          {done === false && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">미달성 유형</p>
              <div className="grid grid-cols-2 gap-2">
                {FAIL_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFailType(failType === t ? null : t)}
                    className={`py-2 rounded-lg border-2 text-sm transition-all ${
                      failType === t
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                        : 'border-gray-200 text-gray-500 hover:border-orange-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 내용을 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={done === null}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
