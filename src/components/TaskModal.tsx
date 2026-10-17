'use client';
import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { CATEGORIES } from '@/constants';

interface Props {
  task?: Task | null;
  onSave: (data: Omit<Task, 'id' | 'done' | 'achieveType' | 'failType' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onClose }: Props) {
  const [category, setCategory] = useState(task?.category ?? CATEGORIES[0]);
  const [content, setContent] = useState(task?.content ?? '');
  const [targetDate, setTargetDate] = useState(task?.targetDate ?? '');
  const [memo, setMemo] = useState(task?.memo ?? '');

  useEffect(() => {
    if (task) {
      setCategory(task.category);
      setContent(task.content);
      setTargetDate(task.targetDate);
      setMemo(task.memo);
    }
  }, [task]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({ category, content: content.trim(), targetDate, memo, failSubType: null });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {task ? '항목 수정' : '항목 추가'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 중점사항 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">중점사항</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 월간 추진 리스트 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월간 추진 리스트 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="추진할 내용을 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* 목표일자 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">목표일자</label>
            <input
              type="text"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              placeholder="예) 셋째주(20,일) / 매주(월) / 상시"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
