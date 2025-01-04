import { useIncomeTypes } from "@/hooks/useIncomeTypes";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import React from "react";

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string;
  children: React.ReactNode;
  href: string;
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  ListItemProps
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          to={href}
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
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function TypesDropdownMenu() {
  const { sourceId } = useParams();
  const { incomeTypes, isIncomeTypeEnabled } = useIncomeTypes(sourceId);

  const enabledIncomeTypes = incomeTypes.filter((type) =>
    isIncomeTypeEnabled(type.id)
  );

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Types</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-background border rounded-md shadow-lg">
              {/* Product-related items */}
              <ListItem
                title="Products"
                href={`/source/${sourceId}/products`}
              >
                Manage your products inventory and catalog
              </ListItem>
              <ListItem
                title="Inventory"
                href={`/source/${sourceId}/inventory`}
              >
                Track and manage your inventory levels
              </ListItem>
              <ListItem
                title="Services"
                href={`/source/${sourceId}/services`}
              >
                Manage your service offerings
              </ListItem>

              {/* Income Types */}
              {enabledIncomeTypes.map((type) => (
                <ListItem
                  key={type.id}
                  title={type.name}
                  href={`/source/${sourceId}/settings#income-types`}
                >
                  {type.description || `Manage ${type.name.toLowerCase()}`}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}