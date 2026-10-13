import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,

} from 'firebase/firestore';
import { db } from './firebase';
import { Task, MonthSummary, ChurchId, AchieveType, FailType } from '@/types';
import { ACHIEVE_TYPES, FAIL_TYPES } from '@/constants';

// ── 경로 헬퍼 ─────────────────────────────────────────────
function tasksCol(churchId: ChurchId, yearMonth: string) {
  return collection(db, 'churches', churchId, 'months', yearMonth, 'tasks');
}
function summaryDoc(churchId: ChurchId, yearMonth: string) {
  return doc(db, 'churches', churchId, 'months', yearMonth, 'meta', 'summary');
}

// ── Tasks ─────────────────────────────────────────────────
export async function getTasks(churchId: ChurchId, yearMonth: string): Promise<Task[]> {
  const q = query(tasksCol(churchId, yearMonth), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
}

export async function addTask(
  churchId: ChurchId,
  yearMonth: string,
  data: Omit<Task, 'id'>
): Promise<string> {
  const ref = await addDoc(tasksCol(churchId, yearMonth), data);
  return ref.id;
}

export async function updateTask(
  churchId: ChurchId,
  yearMonth: string,
  taskId: string,
  data: Partial<Task>
) {
  const ref = doc(tasksCol(churchId, yearMonth), taskId);
  await updateDoc(ref, data as Record<string, unknown>);
}

export async function deleteTask(churchId: ChurchId, yearMonth: string, taskId: string) {
  await deleteDoc(doc(tasksCol(churchId, yearMonth), taskId));
}

// ── Summary ───────────────────────────────────────────────
export async function recalcSummary(
  churchId: ChurchId,
  yearMonth: string,
  tasks: Task[]
): Promise<void> {
  const achieveTypeCounts = Object.fromEntries(ACHIEVE_TYPES.map((t) => [t, 0])) as Record<AchieveType, number>;
  const failTypeCounts    = Object.fromEntries(FAIL_TYPES.map((t)    => [t, 0])) as Record<FailType, number>;

  let achieved = 0, failed = 0, unchecked = 0;

  for (const t of tasks) {
    if (t.done === true)  { achieved++; if (t.achieveType) achieveTypeCounts[t.achieveType]++; }
    else if (t.done === false) { failed++;   if (t.failType)    failTypeCounts[t.failType]++; }
    else unchecked++;
  }

  const summary: MonthSummary = {
    churchId,
    yearMonth,
    total: tasks.length,
    achieved,
    failed,
    unchecked,
    achieveTypeCounts,
    failTypeCounts,
    updatedAt: Date.now(),
  };

  await setDoc(summaryDoc(churchId, yearMonth), summary);
}

// ── 대시보드용: 해당 연도 모든 교회 summary 읽기 ────────────
export async function getYearSummaries(
  churchId: ChurchId,
  year: number
): Promise<MonthSummary[]> {
  const results: MonthSummary[] = [];
  const months = Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, '0')}`
  );
  for (const ym of months) {
    const snap = await getDocs(collection(db, 'churches', churchId, 'months', ym, 'meta'));
    snap.forEach((d) => results.push(d.data() as MonthSummary));
  }
  return results;
}

// ── 대시보드용: 특정 월 전체 교회 summary ────────────────────
export async function getAllChurchSummaries(yearMonth: string): Promise<MonthSummary[]> {
  const { CHURCHES } = await import('@/constants');
  const results: MonthSummary[] = [];
  for (const c of CHURCHES) {
    const snap = await getDocs(collection(db, 'churches', c.id, 'months', yearMonth, 'meta'));
    snap.forEach((d) => results.push(d.data() as MonthSummary));
  }
  return results;
}
