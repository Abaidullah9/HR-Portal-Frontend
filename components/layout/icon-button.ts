/* 40px is comfortable with a mouse, but the touch-target floor is 44x44, so
   coarse pointers get the extra 4px without inflating desktop chrome. */
export const ICON_BUTTON =
  'relative flex h-10 w-10 items-center justify-center rounded-xl border edge bg-white/50 text-foreground/70 press transition-all duration-200 hover:bg-white/80 hover:text-foreground hover:shadow-md hover:shadow-black/10 pointer-coarse:min-h-11 pointer-coarse:min-w-11 dark:surface-50 dark:text-foreground/60'
