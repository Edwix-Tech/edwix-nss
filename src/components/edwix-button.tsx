import { cn } from '@/lib/utils';
export const EdwixButton = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string | undefined;
}) => {
  return (
    <button
      className={cn(
        'flex justify-center border-black items-center w-fit max-w-full h-fit px-6  py-2  border rounded-full cursor-pointer shadow-[-5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-shadow duration-300 self-start',
        className
      )}
    >
      <span className="dark:text-black text-white">{children}</span>
    </button>
  );
};
