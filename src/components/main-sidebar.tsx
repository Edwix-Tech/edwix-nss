'use client';
import { useState, useEffect, ForwardRefExoticComponent, RefAttributes } from 'react';
import { useDrop, DndProvider, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NativeTypes } from 'react-dnd-html5-backend';
import { LegacyRef } from 'react';
import {
  Sidebar,
  SidebarContent,
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
  Monitor,
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
import Image from 'next/image';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
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
    url: '/v3/contacts',
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
    url: '/v3/property',
    icon: HomeIcon,
  },
  {
    titleKey: 'navigation.members',
    url: '/members',
    icon: Users,
  },
  {
    titleKey: 'navigation.connections',
    url: '/v3/connections',
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

type DropItem = {
  files?: FileList;
};

export default function MainSidebar() {
  const currentProperty = useCurrentProperty();
  const pathname = usePathname();
  const t = useTranslations();
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOverAI, setIsDraggingOverAI] = useState(false);
  const [isDraggingOverNoAI, setIsDraggingOverNoAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const [{ isOver }, dropRef] = useDrop<DropItem, void, { isOver: boolean }>({
    accept: [NativeTypes.FILE],
    drop: (item: DropItem, monitor: DropTargetMonitor) => {
      if (!monitor.getClientOffset()) return;
      const offset = monitor.getClientOffset()!;
      const dropElement = document.getElementById('dropzone');
      if (!dropElement) return;

      const { top, height } = dropElement.getBoundingClientRect();
      const isUpperHalf = offset.y - top < height / 3;
      if (item.files && item.files.length > 0) {
        setIsDragging(false);
        setIsDraggingOverAI(false);
        setIsDraggingOverNoAI(false);
        setIsUploading(true);
        setUploadError(null);

        // Convert FileList to array for iteration
        const filesArray = Array.from(item.files);

        // Process each file
        void (async () => {
          try {
            for (const file of filesArray) {
              if (isUpperHalf) {
                await handleAISelection(file);
              } else {
                await handleNoAISelection(file);
              }
            }
            setIsUploading(false);
          } catch (error) {
            console.error('Error uploading files:', error);
            setUploadError(error instanceof Error ? error.message : 'Failed to upload files');
            setIsUploading(false);
          }
        })();
      }
    },
    hover: (_, monitor: DropTargetMonitor) => {
      if (!monitor.getClientOffset()) return;
      const offset = monitor.getClientOffset()!;
      const dropElement = document.getElementById('dropzone');
      if (!dropElement) return;

      const { top, height } = dropElement.getBoundingClientRect();
      const isUpperHalf = offset.y - top < height / 3;

      setIsDragging(true);
      setIsDraggingOverAI(isUpperHalf);
      setIsDraggingOverNoAI(!isUpperHalf);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    if (!isOver) {
      setIsDragging(false);
      setIsDraggingOverAI(false);
      setIsDraggingOverNoAI(false);
    }
  }, [isOver]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Sidebar>
        <div
          id="dropzone"
          className="h-full relative"
          ref={dropRef as unknown as LegacyRef<HTMLDivElement>}
        >
          {isDragging && (
            <div className="absolute inset-0 z-50 flex flex-col">
              <div
                className={`flex-1 bg-primary flex items-center justify-center transition-all ${isDraggingOverAI ? 'bg-primary/90' : ''} cursor-pointer backdrop-blur-sm border-8 ${isDraggingOverAI ? 'border-dotted border-primary-foreground/50' : 'border-transparent'}`}
              >
                <div className="flex flex-col items-center justify-center text-center space-y-2 p-4">
                  <Sparkle className="h-13 w-14 text-primary-foreground" />
                  <div className="text-1xl font-semibold text-primary-foreground leading-tight">
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
                <div className="flex flex-col items-center justify-center text-center space-y-2 p-4">
                  <svg
                    className="h-13 w-14 text-secondary-foreground"
                    fill="none"
                    viewBox="1 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <div className="text-1xl font-semibold text-secondary-foreground leading-tight">
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
            <div className="absolute z-10 w-full bottom-3 left-1/2 -translate-x-1/2 bg-background p-4 rounded-lg shadow-lg border">
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <span>Uploading file...</span>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="absolute z-10 bottom-3 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-1">
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
          <SidebarHeader>
            <div className="flex0 flex items-center justify-center p-4">
              <Image src="/images/logo.svg" alt={t('common.logo')} width={131} height={100} />
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
                    <SidebarMenuButton className="text-primary mb-1 hover:text-sidebar-primary-foreground border-2   p-2 rounded-md">
                      <Sparkle className="text-primary-foreground" />
                      <span>Drag file to upload</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="bg-secondary text-secondary-foreground hover:bg-secondary/91">
                      <svg
                        className="h-3 w-4"
                        fill="none"
                        viewBox="1 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span>Upload Without AI</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </div>
      </Sidebar>
    </DndProvider>
  );
}
