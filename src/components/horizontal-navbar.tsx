'use client';
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
import * as React from 'react';
import supabaseClient from '@/lib/supabase-client';
import { useUploadFileWithAiSource } from '@/lib/api/upload-file';
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center justify-center text-sm font-medium w-10 relative rounded-full p-1 ${
          theme === 'dark' ? 'bg-gray-800 text-white ' : 'text-gray-700 border '
        }`}
      >
        <Bell className="h-6 w-6  dark:text-white text-gray-800" />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium bg-red ring-red dark:ring-gray-800">
          2
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={`w-72 ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}>
        <div className="px-2 py-1.5">
          <h4 className="text-sm font-semibold">New Notifications</h4>
        </div>
        <DropdownMenuItem>
          <div className="flex items-center">
            <Bell className="mr-2 h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm">New message from John</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                2 minutes ago
              </p>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex items-center">
            <Bell className="mr-2 h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm">Document shared by Sarah</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                1 hour ago
              </p>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <h4 className="text-sm font-semibold">Read</h4>
        </div>
        <DropdownMenuItem>
          <div className="flex items-center">
            <Bell className="mr-2 h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm">Task completed</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Yesterday
              </p>
            </div>
          </div>
        </DropdownMenuItem>
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
  const mutation = useUploadFileWithAiSource();
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
  console.log(user.data?.profile.firstname);
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
  console.log(theme);

  // Create refs for file inputs
  const withAiInputRef = React.useRef<HTMLInputElement>(null);
  const withoutAiInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null, withAi: boolean) => {
    try {
      if (!files || files.length === 0) {
        throw new Error('No file selected');
      }
      const file = files[0];

      if (!file) {
        throw new Error('Invalid file');
      }

      await mutation.mutateAsync({
        file: file,
        aiSource: withAi,
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
                <input
                  type="file"
                  ref={withAiInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  onChange={e => {
                    try {
                      handleFileUpload(e.target.files, true);
                      e.target.value = ''; // Reset input after upload
                      alert('File uploaded successfully with AI!');
                    } catch (error) {
                      console.error('Error uploading with AI:', error);
                      alert('Error uploading file. Please try again.');
                    }
                  }}
                />
                <input
                  type="file"
                  ref={withoutAiInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      try {
                        handleFileUpload(e.target.files, false);
                        e.target.value = ''; // Reset input after upload
                        alert('File uploaded successfully without AI!');
                      } catch (error) {
                        console.error('Error uploading without AI:', error);
                        alert('Error uploading file. Please try again.');
                      }
                    }
                  }}
                />
                <DropdownMenuItem className="flex items-center cursor-pointer py-4 hover:bg-[#28A0C2] focus:bg-[#28A0C2]">
                  <div className="flex items-center space-x-2">
                    <div className="bg-black rounded-full p-2">
                      <Wand2 className="h-4 w-4 text-white" />
                    </div>
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
                        mutation.mutate({
                          file: files[0],
                          aiSource: false,
                        });
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
