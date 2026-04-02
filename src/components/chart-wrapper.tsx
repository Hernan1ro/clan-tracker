"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ChartWrapper({
  children,
  height = 250,
}: {
  children: React.ReactNode;
  height?: number;
}) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div
        className="flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded-lg"
        style={{ height }}
      >
        Loading chart…
      </div>
    );
  }

  return <div style={{ height, minWidth: 0 }}>{children}</div>;
}
