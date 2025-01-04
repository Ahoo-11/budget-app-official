import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
  },
  {
    title: "Products",
    href: "/products",
  },
  {
    title: "Services",
    href: "/services",
  },
  {
    title: "Employment Income",
    href: "/income/employment",
  },
  {
    title: "Gifts & Grants",
    href: "/income/gifts",
  },
  {
    title: "Investment Income",
    href: "/income/investments",
  },
  {
    title: "Other Income",
    href: "/income/other",
  },
];

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
