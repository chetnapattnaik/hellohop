import { LiveIndicator } from "./LiveIndicator";

interface HeaderProps {
  isLive: boolean;
}

export function Header({ isLive }: HeaderProps) {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sage flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-semibold text-sm">
                  HB+
                </span>
              </div>
              <div>
                <h1 className="font-serif text-lg font-medium text-foreground">
                  Call Intelligence
                </h1>
                <p className="text-xs text-muted-foreground">
                  Wellness-first guidance
                </p>
              </div>
            </div>
          </div>
          
          <LiveIndicator isLive={isLive} />
        </div>
      </div>
    </header>
  );
}
