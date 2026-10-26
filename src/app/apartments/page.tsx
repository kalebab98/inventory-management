'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApartmentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/assets');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-500 text-xs">
      Redirecting to Asset Registry...
    </div>
  );
}
