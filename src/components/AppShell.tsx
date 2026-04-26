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
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <TopBar subtitle={subtitle} />
      <main className="flex-1 mx-auto w-full max-w-screen-md">{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
};
