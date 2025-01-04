import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Home,
  Settings,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";

const routes = [
  {
    title: "Overview",
    icon: Home,
    href: "/",
  },
  {
    title: "Stats",
    icon: BarChart3,
    href: "/stats",
  },
  {
    title: "Products",
    icon: ShoppingCart,
    href: "/products",
  },
  {
    title: "Services",
    icon: Store,
    href: "/services",
  },
  {
    title: "Users",
    icon: Users,
    href: "/users",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function SidebarNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {routes.map((route) => (
        <NavLink
          key={route.href}
          to={route.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent" : "transparent"
            )
          }
        >
          <route.icon className="h-4 w-4" />
          {route.title}
        </NavLink>
      ))}
    </nav>
  );
}