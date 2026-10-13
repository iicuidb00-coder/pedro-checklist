import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '베드로 지파 교통과 체크리스트',
  description: '교회별 월간 업무 추진 체크리스트',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
