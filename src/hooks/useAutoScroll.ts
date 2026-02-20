import { useEffect, useRef } from "react";

export function useAutoScroll<T>(
  dependency: T,
  behavior: ScrollBehavior = "auto",
) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, [behavior, dependency]);

  return bottomRef;
}
