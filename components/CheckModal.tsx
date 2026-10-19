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
  const [failSubType, setFailSubType] = useState<FailSubType | null>(task.failSubType);
  const [memo, setMemo] = useState(task.memo ?? '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-1">달성 여부 체크</h2>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.content}</p>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => { setDone(true); setFailType(null); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                done === true ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'
              }`}
            >
              ✅ 달성
            </button>
            <button
              onClick={() => { setDone(false); setAchieveType(null); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                done === false ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'
              }`}
            >
              ❌ 미달성
            </button>
          </div>

          {done === true && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">달성 유형</p>
              <div className="grid grid-cols-2 gap-2">
                {ACHIEVE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setAchieveType(t)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      achieveType === t ? 'bg-green-100 border-2 border-green-500 font-semibold' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {done === false && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">미달성 원인</p>
              <div className="space-y-2">
                {FAIL_TYPES.map((t) => (
                  <div key={t}>
                    <button
                      onClick={() => {
                        setFailType(t);
                        setFailSubType(null);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-all ${
                        failType === t ? 'bg-red-100 border-2 border-red-500 font-semibold' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                    {failType === t && (
                      <div className="mt-2 grid grid-cols-2 gap-2 pl-4">
                        {FAIL_SUB_TYPES[t].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setFailSubType(sub as FailSubType)}
                            className={`py-1.5 px-2 rounded-md text-xs transition-all ${
                              failSubType === sub ? 'bg-red-200 border border-red-500 font-medium' : 'bg-white border border-gray-200'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모 (선택)"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              취소
            </button>
            <button
              onClick={() => {
                if (done === null) return alert('달성 여부를 선택하세요');
                onSave(done, achieveType, failType, failSubType, memo);
              }}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
