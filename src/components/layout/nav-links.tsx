'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, UserCog } from 'lucide-react';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

export function NavLinks() {
  const pathname = usePathname();
  const { user } = useUser();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    {
      name: 'My Expenses',
      href: '/dashboard/expenses',
      icon: FileText,
    },
  ];

  if (user?.role === 'admin') {
    links.push({
      name: 'Admin',
      href: '/dashboard/admin',
      icon: UserCog,
    });
  }

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}

    