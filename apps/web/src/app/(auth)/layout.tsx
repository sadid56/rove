import React from "react";
import Link from "next/link";
import { RoveLogo } from "@repo/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-background text-foreground selection:bg-primary/20 selection:text-primary'>
      <div className='w-full max-w-md space-y-6'>
        <div className='text-center space-y-2'>
          <Link href='/' className='inline-flex justify-center transition-transform hover:scale-105 active:scale-95'>
            <RoveLogo size='lg' withContainer={true} subtitle={false} />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
