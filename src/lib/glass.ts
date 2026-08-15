// Shared frosted-glass utility strings. Plain Tailwind classes (not a custom CSS
// class) so tailwind-merge can still resolve conflicts when a consumer overrides
// the background (e.g. Card's bg-primary hero variant on HomePage).
export const GLASS = 'bg-card/70 backdrop-blur-xl border border-border/60'
export const GLASS_STRONG = 'bg-card/85 backdrop-blur-[28px] border border-border/50'
export const GLASS_TOOLTIP = 'bg-card/92 backdrop-blur-[12px] border border-border/50'
export const GLASS_HEADER = 'bg-background/70 backdrop-blur-xl'
