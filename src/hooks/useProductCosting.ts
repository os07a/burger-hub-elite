import { useMemo } from "react";
import { useProductRecipes } from "./useRecipes";
import { useProducts } from "./useProducts";

// Convert one unit-amount expressed in `recipeUnit` into the inventory's stored unit.
// Mirrors logic of the deduct_inventory_on_sale trigger.
export const unitFactor = (recipeUnit: string, invUnit: string): number => {
  const r = (recipeUnit ?? "").toLowerCase().trim();
  const i = (invUnit ?? "").toLowerCase().trim();
  if (r === i) return 1;
  if (r === "جرام" && (i === "كجم" || i === "kg")) return 1 / 1000;
  if (r === "مل" && (i === "لتر" || i === "l")) return 1 / 1000;
  if (r === "كجم" && (i === "جرام" || i === "g")) return 1000;
  if (r === "لتر" && (i === "مل" || i === "ml")) return 1000;
  return 1;
};

export interface CostingResult {
  computedCost: number;
  ingredientsCount: number;
  margin: number; // percent
  marginValue: number; // sar
  missingIngredients: { name: string; required: number; available: number }[];
  loaded: boolean;
}

export const useProductCosting = (productId?: string) => {
  const { data: recipes = [], isLoading: rLoading } = useProductRecipes(productId);
  const { data: products = [], isLoading: pLoading } = useProducts();
  const product = products.find((p) => p.id === productId);

  return useMemo<CostingResult>(() => {
    if (!product) {
      return { computedCost: 0, ingredientsCount: 0, margin: 0, marginValue: 0, missingIngredients: [], loaded: !rLoading && !pLoading };
    }
    let cost = 0;
    const missing: CostingResult["missingIngredients"] = [];
    for (const r of recipes) {
      const inv = r.inventory_items;
      if (!inv) continue;
      const f = unitFactor(r.unit, inv.unit);
      const required = Number(r.quantity_per_unit) * f * (1 + Number(r.waste_percentage) / 100);
      cost += required * Number(inv.cost_per_unit);
      if (Number(inv.quantity) < required) {
        missing.push({ name: inv.name, required, available: Number(inv.quantity) });
      }
    }
    const price = Number(product.price);
    const marginValue = price - cost;
    const margin = price > 0 ? (marginValue / price) * 100 : 0;
    return {
      computedCost: cost,
      ingredientsCount: recipes.length,
      margin,
      marginValue,
      missingIngredients: missing,
      loaded: !rLoading && !pLoading,
    };
  }, [recipes, product, rLoading, pLoading]);
};
