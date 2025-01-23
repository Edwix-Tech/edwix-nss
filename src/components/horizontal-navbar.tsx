'use client';
import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Home,
  User,
  LayoutDashboard,
  Wand2,
  Users,
  CheckSquare,
  Calendar,
  DollarSign,
  Bell,
  LogOut,
  Link as LinkIcon,
  Mail,
  CreditCard,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import supabaseClient from '@/lib/supabase-client';
import { useCurrentProperty } from '@/hooks/use-current-property';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getMemberships } from '@/lib/api/property';
import { EdwixButton } from './edwix-button';
import {
  useNewNotificationsCountQuery,
  useInfiniteNotificationsQuery,
  useUpdateNotificationStatus,
} from '@/lib/api/notification';

interface MenuItem {
  value: string;
  label: string;
  icon: React.ElementType;
  href?: string;
}

interface UserMenuItem {
  profile: {
    name: string;
    email: string;
  };
  mainItems: MenuItem[];
  settingsItems: MenuItem[];
  supportItems: MenuItem[];
}

const LogoSection = () => {
  return (
    <Link href="/" className="flex-shrink-0 flex items-center space-x-2 mr-4">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_1-pp43oODXmZFKxLifCO5k7464LyAlSW.svg"
        alt="Edwix Logo"
        className="h-8 w-auto"
        width={32}
        height={32}
      />
    </Link>
  );
};

const MainMenuSelect = ({
  theme,
  menuItems,
}: {
  theme: string | undefined;
  menuItems: MenuItem[];
}) => {
  return (
    <div className="w-48">
      <Select defaultValue="drive">
        <SelectTrigger
          className={`w-[180px]  justify-start rounded-full ${
            theme === 'dark' ? 'bg-gray-800 text-white' : ''
          }`}
        >
          <SelectValue placeholder="Drive" />
        </SelectTrigger>

        <SelectContent className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}>
          <SelectGroup>
            <SelectLabel>Links</SelectLabel>
            {menuItems.map((item: MenuItem) => (
              <SelectItem key={item.value} value={item.value}>
                <div className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4 text-inherit" />
                  {item.label}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

const AddButton = ({ theme }: { theme: string | undefined }) => {
  return (
    <button className="bg-[#2CAACE] text-black border-2 border-black rounded-full font-semibold justify-center filter drop-shadow-[-4px_4px_0px_rgba(0,0,0,1)] text-sm py-1 px-3 h-8 flex items-center">
      <span
        className="bg-black rounded-full p-1 mr-2 flex items-center justify-center"
        style={{ width: '20px', height: '20px' }}
      >
        <Plus className={`h-3 w-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
      </span>
      Add...
    </button>
  );
};

const SearchButton = ({ theme }: { theme: string | undefined }) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-10 w-10 ${
        theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'
      }`}
    >
      <Search className="h-5 w-5 text-inherit" />
    </button>
  );
};

const PropertySelect = ({ theme }: { theme: string | undefined }) => {
  const router = useRouter();
  const user = useCurrentUser();
  const { currentProperty, setCurrentProperty } = useCurrentProperty();
  const { data: memberships, isLoading } = useQuery({
    queryKey: ['memberships', user?.data?.id],
    queryFn: () => {
      if (!user?.data?.id) {
        throw new Error('User ID is required');
      }
      return getMemberships(user.data.id);
    },
  });

  if (isLoading) {
    return (
      <div className="w-[150px] h-10 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (!memberships) {
    return null;
  }

  return (
    <Select
      value={currentProperty?.id}
      onValueChange={value => {
        if (value === 'new') {
          router.push('/properties/new');
          return;
        }
        const property = memberships.find(m => m.property_id === value)?.Property;
        if (property) {
          setCurrentProperty({
            id: property.id,
            name: property.name || '',
          });
        }
      }}
    >
      <SelectTrigger
        className={`rounded-full w-[150px] ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}
      >
        <Home className="mr-2 h-6 w-6 text-inherit" />
        <SelectValue placeholder={currentProperty?.name || memberships[0]?.Property?.name} />
      </SelectTrigger>
      <SelectContent className={theme === 'dark' ? 'bg-gray-800 text-white' : ''}>
        <SelectGroup>
          <SelectLabel>Owner</SelectLabel>
          {memberships
            .filter(m => m.role === 'owner')
            .map(membership => (
              <SelectItem key={membership.property_id} value={membership.property_id}>
                {membership.Property.name}
              </SelectItem>
            ))}
        </SelectGroup>

        {memberships.some(m => m.role === 'owner') && memberships.some(m => m.role !== 'owner') && (
          <SelectSeparator />
        )}
        {memberships.some(m => m.role !== 'owner') && (
          <SelectGroup>
            <SelectLabel>Member</SelectLabel>
            {memberships
              .filter(m => m.role !== 'owner')
              .map(membership => (
                <SelectItem key={membership.property_id} value={membership.property_id}>
                  {membership.Property.name}
                </SelectItem>
              ))}
          </SelectGroup>
        )}

        <SelectSeparator />
        <SelectItem value="new">Add New Property</SelectItem>
      </SelectContent>
    </Select>
  );
};
const NotificationsSelect = ({ theme }: { theme: string | undefined }) => {
  const user = useCurrentUser();
  const router = useRouter();
  const [realTimeCount, setRealTimeCount] = useState(0);
  const [realTimeNotifications, setRealTimeNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'read'>('new');
  const mutateNotif = useUpdateNotificationStatus();

  const {
    data: infiniteNewData,
    fetchNextPage: fetchNextNewPage,
    hasNextPage: hasNextNewPage,
    isFetchingNextPage: isFetchingNextNewPage,
    isLoading: isLoadingNew,
  } = useInfiniteNotificationsQuery(user.data?.id || '', 'New');

  const {
    data: infiniteReadData,
    fetchNextPage: fetchNextReadPage,
    hasNextPage: hasNextReadPage,
    isFetchingNextPage: isFetchingNextReadPage,
    isLoading: isLoadingRead,
  } = useInfiniteNotificationsQuery(user.data?.id || '', 'Read');

  const notif_count = useNewNotificationsCountQuery(user.data?.id || '');

  const newNotifications = [
    ...realTimeNotifications,
    ...(infiniteNewData?.pages.flatMap(page => page) || []),
  ];

  const readNotifications = infiniteReadData?.pages.flatMap(page => page) || [];

  useEffect(() => {
    if (!user.data?.id) return;
    const subscription = supabaseClient
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `user_id=eq.${user.data.id}`,
        },
        payload => {
          setRealTimeCount(current => current + 1);
          setRealTimeNotifications(current => [payload.new, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(subscription);
    };
  }, [user.data?.id]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center justify-center text-sm font-medium w-10 relative rounded-full p-1 ${
          theme === 'dark' ? 'bg-gray-800 text-white ' : 'text-gray-700 border '
        }`}
      >
        <Bell className="h-6 w-6  dark:text-white text-gray-800" />
        {!isLoadingNew && (realTimeCount > 0 || notif_count.data) && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex bg-red items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium ring-red dark:ring-gray-800">
            {realTimeCount || notif_count.data}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`w-72 ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}>
        <div className="flex border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-sidebar z-10">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'new'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('new')}
          >
            New
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'read'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('read')}
          >
            Read
          </button>
        </div>

        <div
          className="max-h-[400px] overflow-y-auto"
          onScroll={e => {
            const target = e.target as HTMLDivElement;
            if (
              target.scrollTop + target.clientHeight >= target.scrollHeight - 250 &&
              ((activeTab === 'new' && hasNextNewPage && !isFetchingNextNewPage) ||
                (activeTab === 'read' && hasNextReadPage && !isFetchingNextReadPage))
            ) {
              void (activeTab === 'new' ? fetchNextNewPage() : fetchNextReadPage());
            }
          }}
        >
          {(activeTab === 'new' && isLoadingNew) || (activeTab === 'read' && isLoadingRead) ? (
            <div className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ) : (
            <>
              {(activeTab === 'new' ? newNotifications : readNotifications).map(
                (notification, index) => (
                  <DropdownMenuItem
                    key={`${notification.id}-${index}`}
                    onClick={() => {
                      if (activeTab === 'new') {
                        mutateNotif.mutate({
                          notificationId: notification.id,
                          status: 'Read',
                        });
                      }
                      if (notification.file_id) {
                        router.push(`/my-documents/${notification.file_id}`);
                      } else if (notification.property_id) {
                        router.push(`/properties/${notification.property_id}`);
                      } else if (notification.due_date_id) {
                        router.push(`/calendar/${notification.due_date_id}`);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <Bell
                        className={`mr-2 h-4 w-4 ${activeTab === 'new' ? 'text-red-500' : 'text-gray-500'}`}
                      />
                      <div>
                        <p className="text-sm">
                          {notification.file?.title ||
                            notification.due_date_id ||
                            'New notification'}
                        </p>
                        <p
                          className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                )
              )}
              {((activeTab === 'new' && isFetchingNextNewPage) ||
                (activeTab === 'read' && isFetchingNextReadPage)) && (
                <div className="p-2 text-center">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              )}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
const UserMenuSelect = ({
  theme,
  userMenuItems,
}: {
  theme: string | undefined;
  userMenuItems: UserMenuItem;
}) => {
  const _logout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      alert(error.message);
    }

    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center justify-center text-sm font-medium h-9 w-10 relative rounded-full p-1 ${
          theme === 'dark' ? 'bg-gray-800 text-white ' : 'text-gray-700 border '
        }`}
      >
        <User className="h-5 w-5 dark:text-white text-gray-800" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`w-56 ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}>
        <div className="px-2 py-1.5 text-sm font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userMenuItems.profile.name}</p>
            <p
              className={`text-xs leading-none ${
                theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
              }`}
            >
              {userMenuItems.profile.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-gray-200" />
        {userMenuItems.mainItems.map((item: MenuItem) => (
          <DropdownMenuItem key={item.value} asChild>
            <Link href={item.href || ''} className="flex items-center">
              <item.icon className="mr-2 h-4 w-4 text-inherit" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-gray-200" />
        {userMenuItems.settingsItems.map((item: MenuItem) => (
          <DropdownMenuItem key={item.value} asChild>
            <Link href={item.href || ''} className="flex items-center">
              <item.icon className="mr-2 h-4 w-4 text-inherit" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-gray-200" />
        {userMenuItems.supportItems.map((item: MenuItem) => (
          <DropdownMenuItem key={item.value} asChild>
            <Link href={item.href || ''} className="flex items-center">
              <item.icon className="mr-2 h-4 w-4 text-inherit" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-gray-200" />
        <DropdownMenuItem onClick={_logout}>
          <div className="flex items-center">
            <LogOut className="mr-2 h-4 w-4 text-inherit" />
            Log out
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navbar = () => {
  const menuItems = [
    { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { value: 'extractor', label: 'Extractor', icon: Wand2 },
    { value: 'drive', label: 'Drive', icon: FileText },
    { value: 'contacts', label: 'Contacts', icon: Users },
    { value: 'todos', label: 'Todos', icon: CheckSquare },
    { value: 'calendar', label: 'Calendar', icon: Calendar },
    { value: 'finance', label: 'Finance', icon: DollarSign },
  ];
  const user = useCurrentUser();
  const userMenuItems = {
    profile: {
      name: user.data?.profile.firstname || '',
      email: user.data?.email || '',
    },
    mainItems: [
      { value: 'connectors', label: 'Connectors', icon: LinkIcon, href: '/connectors' },
      { value: 'goemail', label: 'GoEmail', icon: Mail, href: '/goemail' },
      { value: 'properties', label: 'Properties', icon: Home, href: '/properties' },
    ],
    settingsItems: [
      { value: 'profile', label: 'Profile', icon: User, href: '/v2' },
      { value: 'billing', label: 'Billing', icon: CreditCard, href: '/billing' },
    ],
    supportItems: [
      { value: 'support', label: 'Support', icon: HelpCircle, href: '/support' },
      { value: 'feedback', label: 'Feedback', icon: MessageSquare, href: '/feedback' },
    ],
  };

  const { theme } = useTheme();
  return (
    <div className="  z-50 top-0 w-full sticky">
      <nav className={` w-full bg-sidebar`}>
        <div className="px-8 h-16 flex items-center">
          <LogoSection />
          {/* <MainMenuSelect theme={theme} menuItems={menuItems} /> */}

          <div className="flex-grow"></div>
          <div className="flex items-center space-x-4">
            <EdwixButton className=" w-fit bg-[#2caace] hover:bg-[#157FC2] transition">
              <span className="flex items-center font-semibold">
                UPLOAD DOCUMENT
                <span className="ml-2 bg-black rounded-full w-6 h-6 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </span>
              </span>
            </EdwixButton>

            {/* <SearchButton theme={theme} /> */}

            <PropertySelect theme={theme} />
            <NotificationsSelect theme={theme} />
            <UserMenuSelect theme={theme} userMenuItems={userMenuItems} />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
