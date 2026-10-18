'use client';
import { useEffect, useState } from 'react';
import { Task, ChurchId } from '@/types';
import { getTasks } from '@/lib/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  churchId: ChurchId;
  churchName: string;
  yearMonth: string;
  onClose: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ChurchDetailModal({ churchId, churchName, yearMonth, onClose }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks(churchId, yearMonth).then(setTasks).finally(() => setLoading(false));
  }, [churchId, yearMonth]);

  const stats = {
    total: tasks.length,
    achieved: tasks.filter(t => t.done === true).length,
    failed: tasks.filter(t => t.done === false).length,
  };

  const failData = Object.entries(
    tasks.filter(t => t.done === false).reduce((acc, t) => {
      const type = t.failType || '기타';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{churchName} 교회 상세 분석</h2>
              <p className="text-sm text-gray-500">{yearMonth.replace('-', '년 ')}월 현황</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-xs text-blue-600 mb-1">전체</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-xs text-green-600 mb-1">달성</p>
              <p className="text-2xl font-bold text-green-700">{stats.achieved}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl text-center">
              <p className="text-xs text-red-600 mb-1">미달성</p>
              <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
            </div>
          </div>

          {failData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 mb-4">미달성 사유 상세</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={failData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {failData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">최근 과업 리스트</h3>
            <div className="space-y-2">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="p-3 bg-gray-50 rounded-lg text-sm flex justify-between">
                  <span className="text-gray-700 truncate">{task.content}</span>
                  <span className={`font-semibold ${task.done ? 'text-green-600' : 'text-red-500'}`}>
                    {task.done ? '달성' : task.done === false ? '미달성' : '미체크'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
