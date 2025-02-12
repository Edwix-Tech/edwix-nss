'use client';

import * as React from 'react';
import { useEffect } from 'react';
import supabaseClient from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentProperty } from '@/hooks/use-current-property';

export default function AppIframe(props: { className?: string; pathname?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_EDWIX_APP_URL;
  const { currentProperty } = useCurrentProperty();

  const _postMessageToIframe = (data: {
    event: string;
    session?: Session | null;
    property?: { id: string; name: string } | null;
  }) => {
    // Get the iframe element
    const iframe = document.querySelector('iframe');
    if (!iframe || !iframe.contentWindow) return;

    console.log('posting message to iframe', data);

    iframe.contentWindow.postMessage(data, baseUrl ?? '');
  };

  useEffect(() => {
    const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
      _postMessageToIframe({ event, session });
    };

    const sub = supabaseClient.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, [baseUrl]);

  // Send initial property and handle property changes
  useEffect(() => {
    _postMessageToIframe({
      event: 'PROPERTY_CHANGED',
      property: currentProperty,
    });
  }, [currentProperty]);

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== baseUrl) {
        return;
      }

      const currentSession = await supabaseClient.auth.getSession();
      if (currentSession.error) return;

      console.log('handling message in container', e.data);

      if (e.data.event === 'URL_CHANGED') {
        const url = new URL(e.data.href);
        const nextPathname = url.pathname.replace(/^\/(en|fr)/, '');
        if (pathname !== nextPathname) {
          router.push(nextPathname);
        }

        return;
      }

      const tokenChanged =
        ['TOKEN_REFRESHED', 'SIGNED_IN'].includes(e.data.event) &&
        e.data.session &&
        e.data.session.access_token !== currentSession.data.session?.access_token;

      const initNewSession = e.data.event === 'INITIAL_SESSION' && e.data.session;

      if (tokenChanged || initNewSession) {
        const { access_token, refresh_token } = e.data.session;
        await supabaseClient.auth.setSession({ access_token, refresh_token });

        console.log('setting session', e.data.session);

        if (['SIGNED_IN'].includes(e.data.event)) {
          router.push('/');
        }

        return;
      }

      const signingOut = e.data.event === 'SIGNED_OUT' && currentSession.data.session?.access_token;
      const initEmptySession = e.data.event === 'INITIAL_SESSION' && !e.data.session;

      if (signingOut || initEmptySession) {
        await supabaseClient.auth.signOut();
        router.push('/auth/login');
        return;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [baseUrl]);

  if (!baseUrl) {
    return <div>Error: NEXT_PUBLIC_EDWIX_APP_URL is not configured</div>;
  }

  const url = new URL(props.pathname ?? '/', baseUrl);
  url.searchParams.set('hideMenu', '');
  const urlString = url.toString();

  return (
    <iframe
      key={urlString}
      src={urlString}
      className={cn('w-full h-full flex-grow', props.className)}
    />
  );
}
