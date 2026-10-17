'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CHURCHES, CATEGORIES } from '@/constants';
import { ChurchId, Task, AchieveType, FailType, FailSubType } from '@/types';
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

  const grouped = CATEGORIES.map((cat, i) => ({
    cat,
    num: i + 1,
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

  const handleCheck = async (done: boolean, achieveType: AchieveType | null, failType: FailType | null, failSubType: FailSubType | null, memo: string) => {
    if (!checkTask) return;
    await updateTask(churchId as ChurchId, yearMonth, checkTask.id, { done, achieveType, failType, failSubType, memo });
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-3 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-blue-500 hover:underline">← 목록</Link>
            <h1 className="text-lg font-bold text-gray-900">{church.name} 교회 — 교통과 업무 체크리스트</h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
            >
              {getMonthOptions().map((ym) => (
                <option key={ym} value={ym}>{ym.replace('-', '년 ')}월</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
            >
              + 업무 추가
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 bg-white border border-gray-300 rounded px-4 py-2 mb-3 text-sm">
          <span className="text-gray-600">전체 <strong>{total}</strong></span>
          <span className="text-green-600">완료 <strong>{achieved}</strong></span>
          <span className="text-red-500">미달성 <strong>{failed}</strong></span>
          <span className="text-gray-400">미체크 <strong>{unchecked}</strong></span>
          <div className="flex-1 mx-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
          <span className="font-bold text-blue-600 w-10 text-right">{rate}%</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
        ) : (
          <div className="bg-white border border-gray-300 rounded overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="border border-blue-600 px-3 py-2 text-left font-semibold w-8">#</th>
                  <th className="border border-blue-600 px-3 py-2 text-left font-semibold">월간 추진 리스트</th>
                  <th className="border border-blue-600 px-3 py-2 text-center font-semibold w-28">목표일자</th>
                  <th className="border border-blue-600 px-3 py-2 text-center font-semibold w-20">완료</th>
                  <th className="border border-blue-600 px-3 py-2 text-center font-semibold w-20">미완료</th>
                  <th className="border border-blue-600 px-3 py-2 text-center font-semibold w-28">달성유형</th>
                  <th className="border border-blue-600 px-3 py-2 text-center font-semibold w-16">관리</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map(({ cat, num, tasks: catTasks }, gi) => (
                  <>
                    {/* Category header row */}
                    <tr key={`cat-${cat}`} className="bg-blue-50">
                      <td className="border border-gray-300 px-3 py-1.5 text-center text-xs font-bold text-blue-700">{num}</td>
                      <td colSpan={6} className="border border-gray-300 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {cat}
                      </td>
                    </tr>

                    {/* Task rows */}
                    {catTasks.length === 0 ? (
                      <tr key={`empty-${cat}`}>
                        <td className="border border-gray-200 px-3 py-2 text-center text-gray-300">—</td>
                        <td colSpan={6} className="border border-gray-200 px-3 py-2 text-xs text-gray-300 italic">
                          등록된 업무 없음
                        </td>
                      </tr>
                    ) : (
                      catTasks.map((task, ti) => (
                        <tr
                          key={task.id}
                          className={`${
                            task.done === true ? 'bg-green-50' :
                            task.done === false ? 'bg-red-50' :
                            ti % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-yellow-50 transition-colors`}
                        >
                          <td className="border border-gray-200 px-3 py-2 text-center text-xs text-gray-400">
                            {ti + 1}
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <div className="text-sm text-gray-800">{task.content}</div>
                            {task.memo && (
                              <div className="text-xs text-gray-400 mt-0.5 italic">{task.memo}</div>
                            )}
                          </td>
                          <td className="border border-gray-200 px-2 py-2 text-center text-xs text-gray-500">
                            {task.targetDate || '—'}
                          </td>
                          {/* 완료 button */}
                          <td className="border border-gray-200 px-2 py-2 text-center">
                            <button
                              onClick={() => setCheckTask(task)}
                              className={`w-full py-1 rounded text-xs font-medium transition-all ${
                                task.done === true
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white border border-green-400 text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {task.done === true ? '✓ 완료' : '완료'}
                            </button>
                          </td>
                          {/* 미완료 button */}
                          <td className="border border-gray-200 px-2 py-2 text-center">
                            <button
                              onClick={() => setCheckTask(task)}
                              className={`w-full py-1 rounded text-xs font-medium transition-all ${
                                task.done === false
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white border border-red-400 text-red-500 hover:bg-red-50'
                              }`}
                            >
                              {task.done === false ? '✗ 미완료' : '미완료'}
                            </button>
                          </td>
                          {/* 달성유형 */}
                          <td className="border border-gray-200 px-2 py-2 text-center">
                            {task.achieveType && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                {task.achieveType}
                              </span>
                            )}
                            {task.failType && (
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                {task.failType}
                              </span>
                            )}
                          </td>
                          {/* 관리 */}
                          <td className="border border-gray-200 px-2 py-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => setEditTask(task)}
                                className="text-xs px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDelete(task)}
                                className="text-xs px-1.5 py-0.5 bg-red-50 hover:bg-red-100 rounded text-red-500"
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </>
                ))}

                {/* Footer summary row */}
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan={2} className="border border-gray-300 px-3 py-2 text-sm text-right text-gray-600">
                    합계 {total}건
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-xs text-gray-500">
                    개중 달성
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-green-600 font-bold">
                    {achieved}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm text-red-500 font-bold">
                    {failed}
                  </td>
                  <td colSpan={2} className="border border-gray-300 px-3 py-2 text-center text-sm text-blue-600 font-bold">
                    {rate}%
                  </td>
                </tr>
              </tbody>
            </table>
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