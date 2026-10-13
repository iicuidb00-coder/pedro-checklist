export type ChurchId =
  | 'gwangju'
  | 'mokpo'
  | 'yeosu'
  | 'suncheon'
  | 'songha'
  | 'gwangyang'
  | 'haenam'
  | 'naju';

export type AchieveType = '계획준수' | '단기집중' | '습관기반' | '역할분담';
export type FailType =
  | '목표설정오류'
  | '계획부재'
  | '실행력부족'
  | '점검관리미흡'
  | '환경변수대응실패'
  | '소통단절';

export interface Task {
  id: string;
  category: string;
  content: string;
  targetDate: string;
  done: boolean | null;
  achieveType: AchieveType | null;
  failType: FailType | null;
  memo: string;
  createdAt: number;
}

export interface MonthSummary {
  churchId: ChurchId;
  yearMonth: string;
  total: number;
  achieved: number;
  failed: number;
  unchecked: number;
  achieveTypeCounts: Record<AchieveType, number>;
  failTypeCounts: Record<FailType, number>;
  updatedAt: number;
}
