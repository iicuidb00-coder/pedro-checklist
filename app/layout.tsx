import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '베드로 지파 교통과 체크리스트',
  description: '월간 업무 달성 체크리스트',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
