import { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export const AppShell = ({
  children,
  subtitle,
  hideNav,
}: {
  children: ReactNode;
  subtitle?: string;
  hideNav?: boolean;
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar subtitle={subtitle} />
      <main className="mx-auto max-w-screen-md pb-32">{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
};
