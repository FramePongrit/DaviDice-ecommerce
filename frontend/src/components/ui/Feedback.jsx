export function Notice({ type = 'info', children, onClose }) {
  const tone = {
    info: 'border-brand/20 bg-brand-light text-brand-dark',
    success: 'border-crypto-green/20 bg-crypto-green/10 text-crypto-green',
    error: 'border-crypto-red/25 bg-crypto-red/10 text-crypto-red',
    warning: 'border-brand-gold/40 bg-brand-light text-ink',
  }[type] || 'border-brand/20 bg-brand-light text-brand-dark';

  return (
    <div className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${tone}`}>
      <span>{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="text-current opacity-70 transition hover:opacity-100" aria-label="Dismiss">
          X
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="app-card-soft flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-xl font-black text-brand shadow-sm">
        D
      </div>
      <h2 className="text-xl font-black text-ink">{title}</h2>
      {message && <p className="mt-2 max-w-md text-sm leading-6 text-slate">{message}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="app-button mt-6 px-5 py-2.5 text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="app-card flex items-center justify-center gap-3 px-6 py-14 text-slate">
      <span className="h-3 w-3 animate-pulse rounded-full bg-brand" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

export function ProductGridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="app-card overflow-hidden">
          <div className="aspect-square animate-pulse bg-snow" />
          <div className="space-y-3 p-3">
            <div className="h-3 w-2/5 animate-pulse rounded-full bg-ui-border" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-ui-border" />
            <div className="h-8 w-full animate-pulse rounded-xl bg-brand-light" />
          </div>
        </div>
      ))}
    </div>
  );
}
