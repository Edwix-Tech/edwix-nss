import {
  Plus,
  Home,
  User,
  LogOut,
  Wand2,
  Link as LinkIcon,
  Mail,
  CreditCard,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import * as React from 'react';
import supabaseClient from '@/lib/supabase-client';
import { uploadFileWithAiSource, getCurrentUserUploadLimit } from '@/lib/api/upload-file';
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
import { NotificationsSelect } from './notifcation-select';
import { getMemberships } from '@/lib/api/property';
import { useGetAdsByPartnerId, Ad } from '@/lib/api/ads';

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
  const user = useCurrentUser();

  const { data: quotaData } = useQuery({
    queryKey: ['userQuotas'],
    queryFn: async () => {
      const fileSize = 0;
      const nbAiExtractions = 1;
      return getCurrentUserUploadLimit({
        userId: user?.data?.id || '',
        fileSize,
        nbAiExtractions,
      });
    },
    enabled: !!user?.data?.id,
  });

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
  const property = useCurrentProperty();

  const handleFileUpload = async (files: FileList | null, withAi: boolean) => {
    try {
      if (!files || files.length === 0) {
        throw new Error('No file selected');
      }
      const file = files[0];

      if (!file) {
        throw new Error('Invalid file');
      }

      await uploadFileWithAiSource({
        file: file,
        aiSource: withAi,
        currentProperty: property,
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return (
    <div className="z-50 top-0 w-full sticky">
      <nav className={`w-full bg-sidebar`}>
        <div className="px-8 h-16 flex items-center">
          <LogoSection />

          <div className="flex-grow"></div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex justify-center border-black items-center w-fit max-w-full h-fit px-6 py-2 bg-[#2CAACE] border rounded-full cursor-pointer shadow-[-5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-shadow duration-300 self-start">
                  <span className="flex items-center font-semibold dark:text-black text-white">
                    UPLOAD DOCUMENT
                    <span className="ml-2 bg-black rounded-full w-6 h-6 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-white" />
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} -p-1 border-2 border-black rounded-xl shadow-[-5px_5px_0px_0px_rgba(0,0,0,1)]`}
                align="end"
              >
                <DropdownMenuItem
                  className={`flex items-center cursor-pointer py-4 ${!quotaData ? 'hover:bg-[#28A0C2] focus:bg-[#28A0C2]' : 'opacity-50 cursor-not-allowed'}`}
                  onClick={() => {
                    if (quotaData) return;

                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.pdf,.doc,.docx';
                    fileInput.onchange = e => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files && files.length > 0) {
                        handleFileUpload(files, true);
                      }
                    };
                    fileInput.click();
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="bg-black rounded-full p-2">
                      <Wand2 className="h-4 w-4 text-white" />
                    </div>
                    <span
                      className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                    >
                      Upload with AI {quotaData && '(Quota Reached)'}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center cursor-pointer py-4 hover:bg-[#28A0C2] focus:bg-[#28A0C2]"
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.pdf,.doc,.docx';
                    fileInput.onchange = e => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files && files.length > 0) {
                        handleFileUpload(files, false);
                      }
                    };
                    fileInput.click();
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="bg-black rounded-full p-2">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <span
                      className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                    >
                      Upload without AI
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
