import {
  Beef,
  Bean,
  Carrot,
  CookingPot,
  Dessert,
  Drumstick,
  Egg,
  Fish,
  Flame,
  Ham,
  Leaf,
  Pizza,
  Salad,
  Soup,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { getMealIconLabel, type MealIconName } from "@/lib/meals";

const MEAL_ICON_COMPONENTS: Readonly<Record<MealIconName, LucideIcon>> = {
  SOUP: Soup,
  FISH: Fish,
  CHICKEN: Drumstick,
  PORK: Ham,
  BEEF: Beef,
  EGG: Egg,
  PASTA: UtensilsCrossed,
  GRAIN: Wheat,
  LEGUMES: Bean,
  VEGETABLE: Carrot,
  SALAD: Salad,
  SWEET: Dessert,
  CHEESE: Pizza,
  FRIED: Flame,
  STEW: CookingPot,
  LEAF: Leaf,
};

export type MealIconProps = {
  name: MealIconName;
  size?: number;
};

export function MealIcon({ name, size = 24 }: MealIconProps) {
  const IconComponent = MEAL_ICON_COMPONENTS[name];

  return <IconComponent size={size} aria-label={getMealIconLabel(name)} role="img" />;
}
