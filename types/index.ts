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

export type FailSubType =
  | '목표모호' | '현실성없는목표' | '우선순위불명확'
  | '일정표없음' | '단계별실행계획없음' | '담당자미지정'
  | '직장여건' | '실행시간부족' | '반복실행실패' | '초기의욕후급감' | '다음으로미룸'
  | '중간점검안됨' | '문제발생후대응지연' | '데이터분석부재'
  | '외부변수고려부족' | '리스크대비계획없음' | '인력자원부족'
  | '역할중복' | '공백' | '협업붕괴' | '업무지연';

export interface Task {
  id: string;
  category: string;
  content: string;
  targetDate: string;
  done: boolean | null;
  achieveType: AchieveType | null;
  failType: FailType | null;
  failSubType: FailSubType | null;
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