'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Home,
  User2,
  ChevronUp,
  Monitor,
  LogOut,
  LucideProps,
  Calendar,
  Coins,
  FileText,
  Users,
  Store,
  Home as HomeIcon,
  Link as LinkIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import supabaseClient from '@/lib/supabase-client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePathname } from 'next/navigation';
import { ForwardRefExoticComponent, RefAttributes, useState } from 'react';
import { SettingsModal } from '@/components/settings-modal';
import { useTranslations } from 'next-intl';

// Workspace items
const workspaceItems: Array<{
  titleKey: string;
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}> = [
  {
    titleKey: 'navigation.inbox',
    url: '/my-documents/recent',
    icon: Monitor,
  },
  {
    titleKey: 'navigation.dueDates',
    url: '/reminders',
    icon: Calendar,
  },
  {
    titleKey: 'navigation.expenses',
    url: '/expense-tracker',
    icon: Coins,
  },
];

// Explorer items
const explorerItems: Array<{
  titleKey: string;
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}> = [
  {
    titleKey: 'navigation.documents',
    url: '/documents',
    icon: FileText,
  },
  {
    titleKey: 'navigation.merchants',
    url: '/merchants',
    icon: Store,
  },
];

// Property items
const propertyItems: Array<{
  titleKey: string;
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}> = [
  {
    titleKey: 'navigation.property',
    url: '/property',
    icon: HomeIcon,
  },
  {
    titleKey: 'navigation.members',
    url: '/members',
    icon: Users,
  },
  {
    titleKey: 'navigation.connections',
    url: '/connections',
    icon: LinkIcon,
  },
];

export default function MainSidebar() {
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const t = useTranslations();

  const _logout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      alert(error.message);
    }

    window.location.reload();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex-1 flex items-center justify-center p-4">
          <Image src="/images/logo.svg" alt={t('common.logo')} width={130} height={100} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={pathname === '/' ? 'bg-accent' : ''}>
                  <Link href="/">
                    <Home />
                    <span>{t('navigation.home')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation.workspaces')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map(item => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild className={pathname === item.url ? 'bg-accent' : ''}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation.explorer')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {explorerItems.map(item => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild className={pathname === item.url ? 'bg-accent' : ''}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation.property')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {propertyItems.map(item => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild className={pathname === item.url ? 'bg-accent' : ''}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton data-testid="user-button">
                    <User2 />
                    {currentUser?.data?.email ? (
                      <span className="h-6 inline-flex items-center text-sm truncate flex-shrink">
                        {currentUser?.data?.email}
                      </span>
                    ) : (
                      <Skeleton className="h-6 w-full" />
                    )}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                  <DropdownMenuItem onClick={_logout}>
                    <LogOut className="h-[1.2rem] w-[1.2rem]" />
                    <span data-testid="logout-button">{t('actions.logout')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Monitor className="h-[1.2rem] w-[1.2rem]" />
                    <span>{t('actions.openSettings')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>

          <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
