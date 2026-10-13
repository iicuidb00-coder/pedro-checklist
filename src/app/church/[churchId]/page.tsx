'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CHURCHES, CATEGORIES } from '@/constants';
import { ChurchId, Task, AchieveType, FailType } from '@/types';
import { getTasks, addTask, updateTask, deleteTask, recalcSummary } from '@/lib/firestore';
import TaskModal from '@/components/TaskModal';
import CheckModal from '@/components/CheckModal';

function currentYM() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthOptions() {
  const now = new Date();
  const opts = [];
  for (let i = -2; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    opts.push(ym);
  }
  return opts;
}

export default function ChurchPage() {
  const { churchId } = useParams<{ churchId: string }>();
  const church = CHURCHES.find((c) => c.id === churchId);
  const [yearMonth, setYearMonth] = useState(currentYM());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);
  const [checkTask, setCheckTask] = useState<Task | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const t = await getTasks(churchId as ChurchId, yearMonth);
      setTasks(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [churchId, yearMonth]);

  if (!church) return <div className="p-8 text-center text-gray-500">교회를 찾을 수 없습니다.</div>;

  const total = tasks.length;
  const achieved = tasks.filter((t) => t.done === true).length;
  const failed = tasks.filter((t) => t.done === false).length;
  const unchecked = tasks.filter((t) => t.done === null).length;
  const rate = total > 0 ? Math.round((achieved / total) * 100) : 0;

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    tasks: tasks.filter((t) => t.category === cat),
  }));

  const handleAdd = async (data: Omit<Task, 'id' | 'createdAt' | 'done' | 'achieveType' | 'failType'>) => {
    await addTask(churchId as ChurchId, yearMonth, {
      ...data,
      done: null,
      achieveType: null,
      failType: null,
      createdAt: Date.now(),
    });
    await recalcSummary(churchId as ChurchId, yearMonth);
    setShowAddModal(false);
    load();
  };

  const handleEdit = async (data: Omit<Task, 'id' | 'createdAt' | 'done' | 'achieveType' | 'failType'>) => {
    if (!editTask) return;
    await updateTask(churchId as ChurchId, yearMonth, editTask.id, data);
    setEditTask(undefined);
    load();
  };

  const handleCheck = async (done: boolean, achieveType: AchieveType | null, failType: FailType | null, memo: string) => {
    if (!checkTask) return;
    await updateTask(churchId as ChurchId, yearMonth, checkTask.id, { done, achieveType, failType, memo });
    await recalcSummary(churchId as ChurchId, yearMonth);
    setCheckTask(null);
    load();
  };

  const handleDelete = async (task: Task) => {
    if (!confirm('삭제할까요?')) return;
    await deleteTask(churchId as ChurchId, yearMonth, task.id);
    await recalcSummary(churchId as ChurchId, yearMonth);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-xs text-blue-500 hover:underline">← 목록</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{church.name} 교회</h1>
            <p className="text-sm text-gray-400">교통과 업무 체크리스트</p>
          </div>
          <select
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white shadow-sm"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
          >
            {getMonthOptions().map((ym) => (
              <option key={ym} value={ym}>{ym.replace('-', '년 ')}월</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: '전체', value: total, color: 'text-gray-800' },
            { label: '달성', value: achieved, color: 'text-green-600' },
            { label: '미달성', value: failed, color: 'text-red-500' },
            { label: '미체크', value: unchecked, color: 'text-gray-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-600">달성률</span>
            <span className="text-blue-600">{rate}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 mb-6"
        >
          + 업무 추가
        </button>

        {loading ? (
          <div className="text-center py-12 text-gray-400">불러오는 중...</div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ cat, tasks: catTasks }) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 px-1">{cat}</h3>
                {catTasks.length === 0 ? (
                  <div className="bg-white rounded-xl p-4 text-center text-sm text-gray-300 border border-dashed border-gray-200">
                    등록된 업무 없음
                  </div>
                ) : (
                  <div className="space-y-2">
                    {catTasks.map((task) => (
                      <div key={task.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-relaxed">{task.content}</p>
                            {task.targetDate && <p className="text-xs text-gray-400 mt-1">🗓 {task.targetDate}</p>}
                            {(task.achieveType || task.failType) && (
                              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${task.achieveType ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {task.achieveType ?? task.failType}
                              </span>
                            )}
                            {task.memo && <p className="text-xs text-gray-400 mt-1 italic">{task.memo}</p>}
                          </div>
                          <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                            task.done === true ? 'bg-green-100 text-green-700' :
                            task.done === false ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {task.done === true ? '✅ 달성' : task.done === false ? '❌ 미달성' : '⬜ 미체크'}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                          <button onClick={() => setCheckTask(task)} className="flex-1 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">체크</button>
                          <button onClick={() => setEditTask(task)} className="flex-1 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">수정</button>
                          <button onClick={() => handleDelete(task)} className="flex-1 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 font-medium">삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <TaskModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />
      )}
      {editTask && (
        <TaskModal initial={editTask} onSave={handleEdit} onClose={() => setEditTask(undefined)} />
      )}
      {checkTask && (
        <CheckModal task={checkTask} onSave={handleCheck} onClose={() => setCheckTask(null)} />
      )}
    </div>
  );
}