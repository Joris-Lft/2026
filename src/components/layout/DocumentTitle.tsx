import { useEffect } from "react";
import { useMatches } from "react-router";
import { formatPageTitle } from "@/constants/branding";
import type { RouteHandle } from "@/types/route-handle";

export function DocumentTitle() {
  const matches = useMatches();

  useEffect(() => {
    const pageTitle = [...matches]
      .reverse()
      .map((match) => (match.handle as RouteHandle | undefined)?.title)
      .find(Boolean);

    document.title = formatPageTitle(pageTitle);
  }, [matches]);

  return null;
}
