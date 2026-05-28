import type { RouteMeta } from "./route";

export interface SidebarItemProps {
  meta: RouteMeta;
  active: boolean;
  onSelect: () => void;
}
