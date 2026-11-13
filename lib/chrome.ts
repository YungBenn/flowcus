/** Shared top-chrome surface tokens for SoundPanel, ModeToggle, and TopBarActions. */
export const chromeShell = "rounded-2xl border border-border bg-card";

/** Inner pill/segment radius; pairs with chromeShell + chromePad (outer = inner + padding). */
export const chromeSegment = "rounded-xl";

/** 44px tall, so every control in it is a full touch target on phones. */
export const chromeRow = "flex h-11 items-center";

export const chromeInset = "px-3.5";

export const chromePad = "p-1";

/** Square icon control inside a chrome row (36px). */
export const chromeIcon =
  "size-9 text-muted-foreground hover:text-foreground [&_svg:not([class*='size-'])]:size-[18px]";
