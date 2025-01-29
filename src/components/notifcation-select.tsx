import { Bell } from 'lucide-react';
import supabaseClient from '@/lib/supabase-client';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  useUpdateNotificationStatus,
  useInfiniteNotificationsQuery,
  useNewNotificationsCountQuery,
} from '@/lib/api/notification';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';

type Notification = {
  id: string;
  user_id: string;
  created_at: string;
  file_id?: string;
  property_id?: string;
  due_date_id?: string;
  file?: {
    title: string;
  };
};

//fix router
export const NotificationsSelect = ({ theme }: { theme: string | undefined }) => {
  const user = useCurrentUser();
  const [realTimeCount, setRealTimeCount] = useState(0);
  const [realTimeNotifications, setRealTimeNotifications] = useState<Notification[]>([]);
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
        (payload: { new: Notification }) => {
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
                  <a
                    key={`${notification.id}-${index}`}
                    onClick={() => {
                      console.log('clicked', notification);
                      if (activeTab === 'new') {
                        mutateNotif.mutate({ notificationId: notification.id, status: 'Read' });
                      }
                    }}
                    href={
                      notification.file_id
                        ? `/my-documents/${notification.file_id}`
                        : notification.property_id
                          ? `/properties/${notification.property_id}`
                          : notification.due_date_id
                            ? `/calendar/${notification.due_date_id}`
                            : '/notifications' + (activeTab === 'new' ? `/${notification.id}` : '')
                    }
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
                  </a>
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
