import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Income",
    href: "/",
  },
  {
    title: "Expense",
    href: "/expense",
  },
  {
    title: "Types",
    href: "#",
    children: [
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
        title: "Investment Income",
        href: "/income/investments",
      },
      {
        title: "Gifts & Grants",
        href: "/income/gifts",
      },
      {
        title: "Other Income",
        href: "/income/other",
      },
    ],
  },
  {
    title: "Categories",
    href: "/categories",
  },
  {
    title: "Suppliers",
    href: "/suppliers",
  },
  {
    title: "Settings",
    href: "/settings",
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
        item.children ? (
          <div key={item.href} className="relative group">
            <button className="text-sm font-medium transition-colors hover:text-primary">
              {item.title}
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg hidden group-hover:block z-50">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  to={child.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {child.title}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Link
            key={item.href}
            to={item.href}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {item.title}
          </Link>
        )
      ))}
    </nav>
  );
}