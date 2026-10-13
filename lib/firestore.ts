import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { AchieveType, ChurchId, FailType, MonthSummary, Task } from '@/types';
import { ACHIEVE_TYPES, FAIL_TYPES } from '@/constants';

function tasksCol(churchId: ChurchId, yearMonth: string) {
  return collection(db, 'churches', churchId, 'months', yearMonth, 'tasks');
}

function summaryDoc(churchId: ChurchId, yearMonth: string) {
  return doc(db, 'churches', churchId, 'months', yearMonth, 'meta', 'summary');
}

export async function getTasks(churchId: ChurchId, yearMonth: string): Promise<Task[]> {
  const q = query(tasksCol(churchId, yearMonth), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
}

export async function addTask(churchId: ChurchId, yearMonth: string, data: Omit<Task, 'id'>): Promise<string> {
  const ref = await addDoc(tasksCol(churchId, yearMonth), data);
  return ref.id;
}

export async function updateTask(churchId: ChurchId, yearMonth: string, taskId: string, data: Partial<Task>): Promise<void> {
  await updateDoc(doc(tasksCol(churchId, yearMonth), taskId), data);
}

export async function deleteTask(churchId: ChurchId, yearMonth: string, taskId: string): Promise<void> {
  await deleteDoc(doc(tasksCol(churchId, yearMonth), taskId));
}

export async function recalcSummary(churchId: ChurchId, yearMonth: string): Promise<void> {
  const tasks = await getTasks(churchId, yearMonth);
  const total = tasks.length;
  const achieved = tasks.filter((t) => t.done === true).length;
  const failed = tasks.filter((t) => t.done === false).length;
  const unchecked = tasks.filter((t) => t.done === null).length;

  const achieveTypeCounts = Object.fromEntries(
    ACHIEVE_TYPES.map((t) => [t, tasks.filter((tk) => tk.achieveType === t).length])
  ) as Record<AchieveType, number>;

  const failTypeCounts = Object.fromEntries(
    FAIL_TYPES.map((t) => [t, tasks.filter((tk) => tk.failType === t).length])
  ) as Record<FailType, number>;

  const summary: MonthSummary = {
    churchId,
    yearMonth,
    total,
    achieved,
    failed,
    unchecked,
    achieveTypeCounts,
    failTypeCounts,
    updatedAt: Date.now(),
  };

  await setDoc(summaryDoc(churchId, yearMonth), summary);
}

export async function getYearSummaries(churchId: ChurchId, year: number): Promise<MonthSummary[]> {
  const results: MonthSummary[] = [];
  for (let m = 1; m <= 12; m++) {
    const ym = `${year}-${String(m).padStart(2, '0')}`;
    try {
      const snap = await getDocs(collection(db, 'churches', churchId, 'months', ym, 'meta'));
      snap.docs.forEach((d) => {
        if (d.id === 'summary') results.push(d.data() as MonthSummary);
      });
    } catch {
      // month may not exist
    }
  }
  return results;
}

export async function getAllChurchSummaries(yearMonth: string): Promise<MonthSummary[]> {
  const churchIds: ChurchId[] = ['gwangju', 'mokpo', 'yeosu', 'suncheon', 'songha', 'gwangyang', 'haenam', 'naju'];
  const results: MonthSummary[] = [];
  for (const churchId of churchIds) {
    try {
      const snap = await getDocs(collection(db, 'churches', churchId, 'months', yearMonth, 'meta'));
      snap.docs.forEach((d) => {
        if (d.id === 'summary') results.push(d.data() as MonthSummary);
      });
    } catch {
      // may not exist
    }
  }
  return results;
}
