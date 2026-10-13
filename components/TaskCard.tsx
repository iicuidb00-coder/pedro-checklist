'use client';
import { Task } from '@/types';

interface Props {
  task: Task;
  onCheck: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, onCheck, onEdit, onDelete }: Props) {
  const statusColor =
    task.done === true ? 'bg-green-100 text-green-700' :
    task.done === false ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-500';
  const statusLabel =
    task.done === true ? '✅ 달성' :
    task.done === false ? '❌ 미달성' :
    '⬜ 미체크';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 leading-relaxed">{task.content}</p>
          {task.targetDate && (
            <p className="text-xs text-gray-400 mt-1">🗓 {task.targetDate}</p>
          )}
          {(task.achieveType || task.failType) && (
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
              task.achieveType ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {task.achieveType ?? task.failType}
            </span>
          )}
          {task.memo && (
            <p className="text-xs text-gray-400 mt-1 italic">{task.memo}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
        <button onClick={onCheck} className="flex-1 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">
          체크
        </button>
        <button onClick={onEdit} className="flex-1 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">
          수정
        </button>
        <button onClick={onDelete} className="flex-1 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 font-medium">
          삭제
        </button>
      </div>
    </div>
  );
}
