'use client';

import { FinanceProvider } from '@/lib/FinanceContext';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <FinanceProvider>
      <Layout />
    </FinanceProvider>
  );
}
