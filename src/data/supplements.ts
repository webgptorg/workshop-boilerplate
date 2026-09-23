import { defineMeal } from "./defineMeal";

/**
 * Supplement served with every lunch. Water, milk and fruit tea are always offered.
 */
export const SUPPLEMENTS = [
  defineMeal({ id: "supplement-ovoce", course: "supplement", name: "Ovoce", icon: "🍎", description: "Čerstvé ovoce, voda, mléko, ovocný čaj", allergens: [7], diet: "vegetarian", basket: { vegetablesAndFruit: 90, dairy: 50 }, estimatedCostCzk: 5 }),
  defineMeal({ id: "supplement-kompot", course: "supplement", name: "Ovocný kompot", icon: "🍑", description: "Ovocný kompot, voda, mléko, ovocný čaj", allergens: [7], diet: "vegetarian", basket: { vegetablesAndFruit: 60, sugars: 6, dairy: 50 }, estimatedCostCzk: 4 }),
  defineMeal({ id: "supplement-salat", course: "supplement", name: "Zeleninový salát", icon: "🥒", description: "Zeleninový salát, voda, mléko, ovocný čaj", allergens: [7], diet: "vegetarian", basket: { vegetablesAndFruit: 70, fats: 2, dairy: 50 }, estimatedCostCzk: 5 }),
  defineMeal({ id: "supplement-repa-okurka", course: "supplement", name: "Červená řepa nebo kyselá okurka", icon: "🫙", description: "Sterilovaná zelenina, voda, mléko, ovocný čaj", allergens: [7], diet: "vegetarian", basket: { vegetablesAndFruit: 50, dairy: 50 }, estimatedCostCzk: 3 }),
];
