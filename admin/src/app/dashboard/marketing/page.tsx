'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarketingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/coupons');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-neutral-500 font-bold">
      Redirecting to Coupons & Influencers Manager...
    </div>
  );
}
