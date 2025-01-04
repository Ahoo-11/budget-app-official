import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const TypesDropdownMenu = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Types</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem href="products" title="Products">
                Manage your product inventory
              </ListItem>
              <ListItem href="services" title="Services">
                Manage your service offerings
              </ListItem>
              <ListItem href="income/employment" title="Employment Income">
                Manage employment-related income
              </ListItem>
              <ListItem href="income/investments" title="Investment Income">
                Track investment returns
              </ListItem>
              <ListItem href="income/gifts" title="Gifts and Grants">
                Record gifts and grant income
              </ListItem>
              <ListItem href="income/other" title="Other Income">
                Manage miscellaneous income
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  const currentPath = window.location.pathname;
  const sourceId = currentPath.split('/').pop();
  
  return (
    <li>
      <Link
        to={`${href}`}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </li>
  );
});
ListItem.displayName = "ListItem";