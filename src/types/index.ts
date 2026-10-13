export type ChurchId = 'gwangju' | 'mokpo' | 'yeosu' | 'suncheon' | 'songha' | 'gwangyang' | 'haenam' | 'naju';

export interface Church {
  id: ChurchId;
  name: string;
}

export type AchieveType = '계획준수' | '단기집중' | '습관기반' | '역할분담';
export type FailType =
  | '목표설정오류'
  | '계획부재'
  | '실행력부족'
  | '점검관리미흡'
  | '환경변수대응실패'
  | '소통단절';

// Firestore에 저장되는 월간 태스크 문서
// /churches/{churchId}/months/{yyyy-MM}/tasks/{taskId}
export interface Task {
  id: string;
  category: string;       // 중점사항 (1~4)
  content: string;        // 월간 추진 리스트
  targetDate: string;     // 목표일자 (텍스트)
  done: boolean | null;   // null=미체크, true=달성, false=미달성
  achieveType: AchieveType | null;
  failType: FailType | null;
  memo: string;
  createdAt: number;
}

// 월 요약 (대시보드용)
// /churches/{churchId}/months/{yyyy-MM}/summary (단일 doc)
export interface MonthSummary {
  churchId: ChurchId;
  yearMonth: string;       // 'yyyy-MM'
  total: number;
  achieved: number;
  failed: number;
  unchecked: number;
  achieveTypeCounts: Record<AchieveType, number>;
  failTypeCounts: Record<FailType, number>;
  updatedAt: number;
}
