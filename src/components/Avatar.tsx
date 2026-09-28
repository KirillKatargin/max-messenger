import { cn } from '../utils/cn';

const PALETTE = [
  'bg-violet-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-rose-500',
  'bg-indigo-500',
];

function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md';
};

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex shrink-0 select-none items-center justify-center rounded-full font-medium text-white',
        colorFor(name),
        size === 'md' ? 'h-12 w-12 text-xl' : 'h-10 w-10 text-base',
      )}
    >
      {initial}
    </div>
  );
}
