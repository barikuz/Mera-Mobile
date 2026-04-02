import { useQuery } from "@tanstack/react-query";

type ShopCategory = {
  id: string | number;
  [key: string]: unknown;
};

type ShopProduct = {
  id: string | number;
  categoryId?: string | number;
  [key: string]: unknown;
};

async function fetchCategories(): Promise<ShopCategory[]> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const response = await fetch(`${baseUrl}/shop/categories`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const json = await response.json();

  if (Array.isArray(json)) {
    return json;
  }

  if (json && Array.isArray(json.data)) {
    return json.data;
  }

  return [];
}

async function fetchProducts(
  categoryId?: string | number,
): Promise<ShopProduct[]> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const url = new URL(`${baseUrl}/shop/products`);

  if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
    url.searchParams.set("categoryId", String(categoryId));
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const json = await response.json();

  if (Array.isArray(json)) {
    return json;
  }

  if (json && Array.isArray(json.data)) {
    return json.data;
  }

  return [];
}

export function useCategories() {
  return useQuery({
    queryKey: ["shop", "categories"],
    queryFn: fetchCategories,
  });
}

export function useProducts(categoryId?: string | number) {
  return useQuery({
    queryKey: ["shop", "products", categoryId ?? null],
    queryFn: () => fetchProducts(categoryId),
  });
}
