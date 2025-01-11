import { Link, useParams } from "react-router-dom";
import { useTypes } from "@/hooks/useTypes";
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
  const { types, isTypeEnabled } = useTypes(sourceId);

  // Filter types based on source settings
  const enabledTypes = types.filter((type) => isTypeEnabled(type.id));

  // Map type names to their respective routes
  const getTypeRoute = (typeName: string) => {
    const routeMap: { [key: string]: string } = {
      "Products": "types/products",
      "Services": "types/services",
      "Inventory": "types/inventory",
      "Employment Income": "types/employment",
      "Gifts and Grants": "types/gifts",
      "Investment Income": "types/investment",
      "Other Income": "types/other"
    };
    return routeMap[typeName] || `types/${typeName.toLowerCase().replace(/\s+/g, '-')}`;
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
                  href={getTypeRoute(type.name)} 
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