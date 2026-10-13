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
  '교통 운영',
  '차량 관리',
  '행정 업무',
  '기타',
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