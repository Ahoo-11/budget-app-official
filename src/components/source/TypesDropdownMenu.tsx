import { Link, useParams } from "react-router-dom";
import { useIncomeTypes } from "@/hooks/useIncomeTypes";
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
  const { sourceId } = useParams();
  const { incomeTypes, isIncomeTypeEnabled } = useIncomeTypes(sourceId);

  // Filter types based on source settings
  const enabledTypes = incomeTypes.filter((type) => isIncomeTypeEnabled(type.id));

  // Map income type names to their respective routes
  const getTypeRoute = (typeName: string) => {
    const routeMap: { [key: string]: string } = {
      "Products": "products",
      "Services": "services",
      "Inventory": "inventory",
      "Employment Income": "employment",
      "Gifts and Grants": "gifts",
      "Investment Income": "investment",
      "Other Income": "other"
    };
    return routeMap[typeName] || typeName.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Types</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {enabledTypes.map((type) => (
                <ListItem 
                  key={type.id}
                  href={`income/${getTypeRoute(type.name)}`} 
                  title={type.name}
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
};

const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <Link
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
    </li>
  );
});
ListItem.displayName = "ListItem";