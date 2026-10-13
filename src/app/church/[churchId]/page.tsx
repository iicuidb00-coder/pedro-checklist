'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ChurchId, Task, AchieveType, FailType } from '@/types';
import { CHURCH_MAP, CATEGORIES } from '@/constants';
import { getTasks, addTask, updateTask, deleteTask, recalcSummary } from '@/lib/firestore';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import CheckModal from '@/components/CheckModal';

function getNowYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function ChurchPage() {
  const params = useParams();
  const churchId = params.churchId as ChurchId;
  const churchName = CHURCH_MAP[churchId] ?? churchId;

  const [yearMonth, setYearMonth] = useState(getNowYearMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task | null }>({ open: false });
  const [checkModal, setCheckModal] = useState<{ open: boolean; task?: Task | null }>({ open: false });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const data = await getTasks(churchId, yearMonth);
    setTasks(data);
    setLoading(false);
  }, [churchId, yearMonth]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // 요약 재계산 후 목록 갱신
  async function refresh(newTasks: Task[]) {
    await recalcSummary(churchId, yearMonth, newTasks);
    setTasks(newTasks);
  }

  // 항목 추가/수정
  async function handleSaveTask(data: Omit<Task, 'id' | 'done' | 'achieveType' | 'failType' | 'createdAt'>) {
    if (taskModal.task) {
      // 수정
      await updateTask(churchId, yearMonth, taskModal.task.id, data);
      const updated = tasks.map((t) => t.id === taskModal.task!.id ? { ...t, ...data } : t);
      await refresh(updated);
    } else {
      // 추가
      const newData: Omit<Task, 'id'> = { ...data, done: null, achieveType: null, failType: null, createdAt: Date.now() };
      const id = await addTask(churchId, yearMonth, newData);
      const newTask: Task = { id, ...newData };
      await refresh([...tasks, newTask]);
    }
    setTaskModal({ open: false });
  }

  // 체크 저장
  async function handleSaveCheck(
    done: boolean,
    achieveType: AchieveType | null,
    failType: FailType | null,
    memo: string
  ) {
    if (!checkModal.task) return;
    const patch = { done, achieveType, failType, memo };
    await updateTask(churchId, yearMonth, checkModal.task.id, patch);
    const updated = tasks.map((t) => t.id === checkModal.task!.id ? { ...t, ...patch } : t);
    await refresh(updated);
    setCheckModal({ open: false });
  }

  // 삭제
  async function handleDelete(taskId: string) {
    if (!confirm('항목을 삭제할까요?')) return;
    await deleteTask(churchId, yearMonth, taskId);
    const updated = tasks.filter((t) => t.id !== taskId);
    await refresh(updated);
  }

  // 통계
  const total = tasks.length;
  const achieved = tasks.filter((t) => t.done === true).length;
  const failed = tasks.filter((t) => t.done === false).length;
  const unchecked = tasks.filter((t) => t.done === null).length;
  const rate = total > 0 ? Math.round((achieved / total) * 100) : 0;

  // 월 목록 (현재 월 ± 3개월)
  function getMonthOptions() {
    const now = new Date();
    const options = [];
    for (let i = -2; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({ value: ym, label: `${d.getFullYear()}년 ${d.getMonth() + 1}월` });
    }
    return options;
  }

  // 카테고리별 그룹
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: tasks.filter((t) => t.category === cat),
  }));

  if (!CHURCH_MAP[churchId]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">존재하지 않는 교회입니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-blue-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-blue-200 text-xs mb-0.5">베드로 지파 교통과</p>
          <h1 className="text-xl font-bold">{churchName} 월간 체크리스트</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 월 선택 */}
        <div className="flex items-center gap-2">
          <select
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getMonthOptions().map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{yearMonth}</span>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '전체', value: total, color: 'text-gray-700', bg: 'bg-gray-100' },
            { label: '달성', value: achieved, color: 'text-green-700', bg: 'bg-green-100' },
            { label: '미달성', value: failed, color: 'text-red-700', bg: 'bg-red-100' },
            { label: '미체크', value: unchecked, color: 'text-yellow-700', bg: 'bg-yellow-100' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 달성률 바 */}
        {total > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">달성률</span>
              <span className="font-bold text-blue-700">{rate}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        )}

        {/* 항목 추가 버튼 */}
        <button
          onClick={() => setTaskModal({ open: true, task: null })}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          + 추진 항목 추가
        </button>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
        )}

        {/* 카테고리별 리스트 */}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">이번 달 추진 항목이 없습니다.</p>
            <p className="text-xs mt-1 text-gray-300">위 버튼으로 항목을 추가해주세요.</p>
          </div>
        )}

        {!loading && grouped.map(({ cat, items }) =>
          items.length === 0 ? null : (
            <div key={cat} className="space-y-2">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1">
                {cat}
              </h2>
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onCheck={() => setCheckModal({ open: true, task })}
                  onEdit={() => setTaskModal({ open: true, task })}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* 모달 */}
      {taskModal.open && (
        <TaskModal
          task={taskModal.task}
          onSave={handleSaveTask}
          onClose={() => setTaskModal({ open: false })}
        />
      )}
      {checkModal.open && checkModal.task && (
        <CheckModal
          task={checkModal.task}
          onSave={handleSaveCheck}
          onClose={() => setCheckModal({ open: false })}
        />
      )}
    </div>
  );
}
