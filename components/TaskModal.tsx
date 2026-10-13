'use client';
import { useState } from 'react';
import { CATEGORIES } from '@/constants';
import { Task } from '@/types';

interface Props {
  initial?: Partial<Task>;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'done' | 'achieveType' | 'failType'>) => void;
  onClose: () => void;
}

export default function TaskModal({ initial, onSave, onClose }: Props) {
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [content, setContent] = useState(initial?.content ?? '');
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '');
  const [memo, setMemo] = useState(initial?.memo ?? '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">{initial?.id ? '업무 수정' : '업무 추가'}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">업무 내용 *</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="업무 내용을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">목표일자</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                placeholder="예: 9/15, 매주 토요일"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="추가 메모 (선택)"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (!content.trim()) return alert('업무 내용을 입력하세요');
                onSave({ category, content, targetDate, memo });
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
