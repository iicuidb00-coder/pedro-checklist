import { ChurchId, AchieveType, FailType } from '@/types';

export interface Church {
  id: ChurchId;
  name: string;
}

export const CHURCHES: Church[] = [
  { id: 'gwangju',   name: '광주' },
  { id: 'mokpo',     name: '목포' },
  { id: 'yeosu',     name: '여수' },
  { id: 'suncheon',  name: '순천' },
  { id: 'songha',    name: '송하' },
  { id: 'gwangyang', name: '광양' },
  { id: 'haenam',    name: '해남' },
  { id: 'naju',      name: '나주' },
];

export const CATEGORIES = [
  '행사시 교통업무 지원',
  '상시조직 구성 및 운영',
  '차량 및 주차장 관리',
  '지교회 업무지원 / 부서원 증원 및 신앙관리',
];

export const ACHIEVE_TYPES: AchieveType[] = [
  '계획준수',
  '단기집중',
  '습관기반',
  '역할분담',
];

export const FAIL_TYPES: FailType[] = [
  '목표설정오류',
  '계획부재',
  '실행력부족',
  '점검관리미흡',
  '환경변수대응실패',
  '소통단절',
];

export const FAIL_SUB_TYPES: Record<FailType, string[]> = {
  '목표설정오류': ['목표모호', '현실성없는목표', '우선순위불명확'],
  '계획부재': ['일정표없음', '단계별실행계획없음', '담당자미지정'],
  '실행력부족': ['직장여건', '실행시간부족', '반복실행실패', '초기의욕후급감', '다음으로미룸'],
  '점검관리미흡': ['중간점검안됨', '문제발생후대응지연', '데이터분석부재'],
  '환경변수대응실패': ['외부변수고려부족', '리스크대비계획없음', '인력자원부족'],
  '소통단절': ['역할중복', '공백', '협업붕괴', '업무지연'],
};