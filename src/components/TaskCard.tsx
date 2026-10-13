'use client';
import { Task } from '@/types';

interface Props {
  task: Task;
  onCheck: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_STYLE = {
  done: 'bg-green-50 border-green-200',
  fail: 'bg-red-50 border-red-200',
  none: 'bg-white border-gray-200',
};

export default function TaskCard({ task, onCheck, onEdit, onDelete }: Props) {
  const status = task.done === true ? 'done' : task.done === false ? 'fail' : 'none';

  return (
    <div className={`border rounded-xl p-4 space-y-2 transition-all ${STATUS_STYLE[status]}`}>
      {/* 상단: 상태 배지 + 액션 버튼 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {status === 'done' && (
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              ✅ 달성
            </span>
          )}
          {status === 'fail' && (
            <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              ❌ 미달성
            </span>
          )}
          {status === 'none' && (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              ⬜ 미체크
            </span>
          )}
          {task.achieveType && (
            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {task.achieveType}
            </span>
          )}
          {task.failType && (
            <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
              {task.failType}
            </span>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onCheck}
            className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            체크
          </button>
          <button
            onClick={onEdit}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 내용 */}
      <p className="text-sm text-gray-800 leading-relaxed">{task.content}</p>

      {/* 목표일자 + 메모 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {task.targetDate && (
          <span>📅 {task.targetDate}</span>
        )}
        {task.memo && (
          <span>📝 {task.memo}</span>
        )}
      </div>
    </div>
  );
}
