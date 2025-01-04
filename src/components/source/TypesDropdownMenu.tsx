import { useIncomeTypes } from "@/hooks/useIncomeTypes";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import React from "react";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
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
        </a>
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
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {/* Product-related items */}
              <ListItem
                title="Products"
                href={`/source/${sourceId}/products`}
                as={Link}
              >
                Manage your products inventory and catalog
              </ListItem>
              <ListItem
                title="Inventory"
                href={`/source/${sourceId}/inventory`}
                as={Link}
              >
                Track and manage your inventory levels
              </ListItem>
              <ListItem
                title="Services"
                href={`/source/${sourceId}/services`}
                as={Link}
              >
                Manage your service offerings
              </ListItem>

              {/* Income Types */}
              {enabledIncomeTypes.map((type) => (
                <ListItem
                  key={type.id}
                  title={type.name}
                  href={`/source/${sourceId}/settings#income-types`}
                  as={Link}
                >
                  {type.description || `Manage ${type.name.toLowerCase()}`}
                </ListItem>
              ))}

              {/* Settings Link */}
              <ListItem
                title="Income Type Settings"
                href={`/source/${sourceId}/settings#income-types`}
                as={Link}
                className="col-span-2 bg-muted/50"
              >
                Enable or disable income types
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}