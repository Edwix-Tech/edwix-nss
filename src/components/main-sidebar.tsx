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
import { Sparkle } from 'lucide-react';
import {
  Home,
  User2,
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
  BookOpen,
  HelpCircle,
  Lightbulb,
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
import { uploadFileWithAiSource } from '@/lib/api/upload-file';
import { useCurrentProperty } from '@/hooks/use-current-property';

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
    url: '/my-documents/folders',
    icon: FileText,
  },
  {
    titleKey: 'navigation.merchants',
    url: '/v2/contacts',
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
    url: '/v2/property',
    icon: HomeIcon,
  },
  {
    titleKey: 'navigation.members',
    url: '/members',
    icon: Users,
  },
  {
    titleKey: 'navigation.connections',
    url: '/v2/connections',
    icon: LinkIcon,
  },
];

// Support items
const supportItems: Array<{
  titleKey: string;
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}> = [
  {
    titleKey: 'navigation.documentation',
    url: 'https://help.edwix.com',
    icon: BookOpen,
  },
  {
    titleKey: 'navigation.support',
    url: '#',
    icon: HelpCircle,
  },
  {
    titleKey: 'navigation.tips',
    url: 'https://edwix.com/blog',
    icon: Lightbulb,
  },
];
export default function MainSidebar() {
  const currentUser = useCurrentUser();
  const currentProperty = useCurrentProperty();
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
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOverAI, setIsDraggingOverAI] = useState(false);
  const [isDraggingOverNoAI, setIsDraggingOverNoAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const { clientY } = e;
    const { top, height } = e.currentTarget.getBoundingClientRect();
    const isUpperHalf = clientY - top < height / 2;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setIsDragging(false);
      setIsDraggingOverAI(false);
      setIsDraggingOverNoAI(false);
      setIsUploading(true);
      setUploadError(null);

      try {
        if (isUpperHalf) {
          await handleAISelection(file);
        } else {
          await handleNoAISelection(file);
        }
        setIsUploading(false);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
        setIsUploading(false);
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    const { clientY } = e;
    const { top, height } = e.currentTarget.getBoundingClientRect();
    const isUpperHalf = clientY - top < height / 2;

    setIsDragging(true);
    setIsDraggingOverAI(isUpperHalf);
    setIsDraggingOverNoAI(!isUpperHalf);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();

    // Check if mouse has left the entire sidebar
    if (!e.currentTarget.contains(e.relatedTarget as Node) || e.relatedTarget === null) {
      setIsDragging(false);
      setIsDraggingOverAI(false);
      setIsDraggingOverNoAI(false);
    }
  };

  const handleAISelection = async (file: File) => {
    setIsDragging(false);
    setIsDraggingOverAI(false);
    setIsDraggingOverNoAI(false);

    const result = await uploadFileWithAiSource({
      file,
      aiSource: true,
      currentProperty: currentProperty,
    });
    return result;
  };

  const handleNoAISelection = async (file: File) => {
    setIsDragging(false);
    setIsDraggingOverAI(false);
    setIsDraggingOverNoAI(false);

    const result = await uploadFileWithAiSource({
      file,
      aiSource: false,
      currentProperty: currentProperty,
    });
    return result;
  };
  return (
    <>
      <Sidebar>
        <div
          className="h-full relative"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
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
                    <SidebarMenuButton
                      asChild
                      className={
                        pathname === '/' ? 'text-blue [&_svg]:bg-blue [&_svg]:text-white' : ''
                      }
                    >
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
                      <SidebarMenuButton
                        asChild
                        className={
                          pathname === item.url
                            ? 'text-blue [&_svg]:bg-blue [&_svg]:text-white'
                            : ''
                        }
                      >
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
                      <SidebarMenuButton
                        asChild
                        className={
                          pathname === item.url
                            ? 'text-blue [&_svg]:bg-blue [&_svg]:text-white'
                            : ''
                        }
                      >
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
                      <SidebarMenuButton
                        asChild
                        className={
                          pathname === item.url
                            ? 'text-blue [&_svg]:bg-blue [&_svg]:text-white'
                            : ''
                        }
                      >
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
              <SidebarGroupLabel>{t('navigation.support')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {supportItems.map(item => (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <item.icon />
                          <span>{t(item.titleKey)}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Upload Documents</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-primary mb-2 hover:text-sidebar-primary-foreground border-2   p-2 rounded-md">
                      <Sparkle className="text-primary-foreground" />
                      <span>Drag file to upload</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span>Upload Without AI</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                      <DropdownMenuItem asChild>
                        <Link href="/v2/profile">
                          <User2 className="h-[1.2rem] w-[1.2rem]" />
                          <span>{t('navigation.profile')}</span>
                        </Link>
                      </DropdownMenuItem>
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

          {isDragging && (
            <div className="absolute inset-0 flex flex-col">
              <div
                className={`flex-1 bg-primary flex items-center justify-center transition-all ${isDraggingOverAI ? 'bg-primary/90' : ''} cursor-pointer backdrop-blur-sm border-8 ${isDraggingOverAI ? 'border-dotted border-primary-foreground/50' : 'border-transparent'}`}
              >
                <div className="flex flex-col items-center justify-center text-center space-y-3 p-4">
                  <Sparkle className="h-14 w-14 text-primary-foreground" />
                  <div className="text-2xl font-semibold text-primary-foreground leading-tight">
                    Drop to Process with AI
                  </div>
                  <div className="text-sm text-primary-foreground/90 max-w-[240px]">
                    Enhanced processing with machine learning
                  </div>
                </div>
              </div>
              <div
                className={`flex-1 bg-secondary flex items-center justify-center transition-all ${isDraggingOverNoAI ? 'bg-secondary/90' : ''} cursor-pointer backdrop-blur-sm border-8 ${isDraggingOverNoAI ? 'border-dotted border-secondary-foreground/50' : 'border-transparent'}`}
              >
                <div className="flex flex-col items-center justify-center text-center space-y-3 p-4">
                  <svg
                    className="h-14 w-14 text-secondary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <div className="text-2xl font-semibold text-secondary-foreground leading-tight">
                    Drop to Upload
                  </div>
                  <div className="text-sm text-secondary-foreground/90 max-w-[240px]">
                    Standard file upload without AI processing
                  </div>
                </div>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="absolute bottom-4 right-4 bg-background p-4 rounded-lg shadow-lg border">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <span>Uploading file...</span>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="absolute bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <span>Upload failed: {uploadError}</span>
                <button
                  onClick={() => setUploadError(null)}
                  className="text-sm underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </Sidebar>
    </>
  );
}
