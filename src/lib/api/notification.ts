import { Tables } from '@/types/database';
import supabaseClient from '../supabase-client';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export async function getNotifications(userId: string) {
  const { data, error } = await supabaseClient
    .from('Notification')
    .select(
      `
      *,
      property: Property(name),
      file: File(title),
      issuer: Issuer(name)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getNewNotificationsCount(userId: string) {
  const { count, error } = await supabaseClient
    .from('Notification')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'New');

  if (error) {
    throw error;
  }

  return count;
}

export function useNewNotificationsCountQuery(userId: string) {
  return useQuery({
    queryKey: ['notifications', 'count', 'new', userId],
    queryFn: () => getNewNotificationsCount(userId),
    enabled: !!userId,
  });
}
export function useInfiniteNotificationsQuery(userId: string, status?: 'New' | 'Read') {
  return useInfiniteQuery({
    queryKey: ['notifications', 'infinite', userId, status],
    queryFn: async ({ pageParam = 0 }) => {
      const query = supabaseClient
        .from('Notification')
        .select(
          `
          *,
          property: Property(name),
          file: File(title),
          issuer: Issuer(name)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(pageParam * 10, (pageParam + 1) * 10 - 1);

      if (status) {
        query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return pages.length;
    },
    initialPageParam: 0,
    enabled: !!userId,
  });
}
export function useNotificationsQuery(userId: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getNotifications(userId),
    enabled: !!userId,
  });
}

export async function updateNotificationStatus(notificationId: string, status: 'New' | 'Read') {
  console.log('hug');
  const { error } = await supabaseClient
    .from('Notification')
    .update({ status })
    .eq('id', notificationId);

  if (error) {
    throw error;
  }
}

export function useUpdateNotificationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ notificationId, status }: { notificationId: string; status: 'New' | 'Read' }) =>
      updateNotificationStatus(notificationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
export async function createNotification(input: {
  type: Tables<'Notification'>['type'];
  user_id: string;
  status?: Tables<'Notification'>['status'];
  property_id?: string;
  file_id?: string;
  due_date_id?: string;
  issuer_id?: string;
}) {
  const { error } = await supabaseClient.from('Notification').insert({
    ...input,
    status: input.status || 'New',
  });

  if (error) {
    throw error;
  }
}
