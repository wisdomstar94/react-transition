import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test 2',
  description: 'Test 2',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>{children}</>
  );
}
