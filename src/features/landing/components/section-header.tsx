import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}

export function SectionHeader({ eyebrow, title, description, align = 'center' }: SectionHeaderProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
      <p className="text-xs font-semibold tracking-wider text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base text-pretty text-slate-600 sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
