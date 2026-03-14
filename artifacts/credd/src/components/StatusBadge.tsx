import { cn } from "@/lib/utils";

type StatusType = 
  | 'active' | 'APPROVED' | 'ALLOW' | 'COMPLETED' | 'settled'
  | 'pending' | 'PENDING' | 'REVIEW' | 'attempted'
  | 'inactive' | 'closed' | 'terminated' | 'NONE' | 'disabled' | 'NOT_REQUIRED'
  | 'suspended' | 'frozen' | 'declined' | 'DECLINED' | 'DENY' | 'failed' | 'reversed' | 'EXPIRED';

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const normalizedStatus = status.toLowerCase();
  
  let variant = 'default';
  
  if (['active', 'approved', 'allow', 'completed', 'settled'].includes(normalizedStatus)) {
    variant = 'success';
  } else if (['pending', 'review', 'attempted'].includes(normalizedStatus)) {
    variant = 'warning';
  } else if (['suspended', 'frozen', 'declined', 'deny', 'failed', 'reversed', 'expired'].includes(normalizedStatus)) {
    variant = 'danger';
  } else if (['inactive', 'closed', 'terminated', 'none', 'disabled', 'not_required'].includes(normalizedStatus)) {
    variant = 'neutral';
  }

  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    default: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm uppercase tracking-wider",
      variants[variant as keyof typeof variants],
      className
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function PolicyTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 backdrop-blur-sm">
      {type.replace(/_/g, ' ')}
    </span>
  );
}
