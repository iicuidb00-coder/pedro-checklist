import { Church, ChurchId, AchieveType, FailType } from '@/types';

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

export const CHURCH_MAP: Record<ChurchId, string> = Object.fromEntries(
  CHURCHES.map((c) => [c.id, c.name])
) as Record<ChurchId, string>;

export const CATEGORIES = [
  '1) 행사시 교통업무 지원',
  '2) 상시조직 구성 및 운영',
  '3) 차량 및 주차장 관리',
  '4) 지교회 업무지원 / 부서원 충원 및 신앙관리',
];

export const ACHIEVE_TYPES: AchieveType[] = ['계획준수', '단기집중', '습관기반', '역할분담'];

export const FAIL_TYPES: FailType[] = [
  '목표설정오류',
  '계획부재',
  '실행력부족',
  '점검관리미흡',
  '환경변수대응실패',
  '소통단절',
];

export const QUARTER_MAP: Record<number, string> = {
  1: '1분기 (1~3월)',
  2: '2분기 (4~6월)',
  3: '3분기 (7~9월)',
  4: '4분기 (10~12월)',
};

export function getQuarter(month: number) {
  return Math.ceil(month / 3);
}
