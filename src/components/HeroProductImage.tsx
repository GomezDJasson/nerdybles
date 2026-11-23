import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";

const ROTATION_INTERVAL = 12 * 60 * 60 * 1000;
const STORAGE_KEY = "nerdybles:hero-product-selection";

interface HeroProductImageProps {
  products: Product[];
}

interface ProductSelection {
  productId: string;
  selectedAt: number;
}

function getRandomSelection(
  products: Product[],
  previousProductId?: string
): ProductSelection {
  const alternatives =
    products.length > 1
      ? products.filter((product) => product.id !== previousProductId)
      : products;

  const pool = alternatives.length > 0 ? alternatives : products;
  const product = pool[Math.floor(Math.random() * pool.length)];

  return {
    productId: product.id,
    selectedAt: Date.now(),
  };
}

function getInitialSelection(products: Product[]): ProductSelection {
  let storedSelection: ProductSelection | null = null;

  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (storedValue) {
      const parsed: unknown = JSON.parse(storedValue);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "productId" in parsed &&
        "selectedAt" in parsed &&
        typeof parsed.productId === "string" &&
        typeof parsed.selectedAt === "number"
      ) {
        storedSelection = {
          productId: parsed.productId,
          selectedAt: parsed.selectedAt,
        };
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const now = Date.now();
  const savedProduct = products.find(
    (product) => product.id === storedSelection?.productId
  );
  const isSelectionValid =
    savedProduct &&
    storedSelection &&
    now >= storedSelection.selectedAt &&
    now - storedSelection.selectedAt < ROTATION_INTERVAL;

  if (isSelectionValid && storedSelection) {
    return storedSelection;
  }

  return getRandomSelection(products, storedSelection?.productId);
}

function HeroProductImage({ products }: HeroProductImageProps) {
  const [selection, setSelection] = useState(() =>
    getInitialSelection(products)
  );

  const selectedProduct = products.find(
    (product) => product.id === selection.productId
  );

  useEffect(() => {
    if (!selectedProduct) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          productId: selectedProduct.id,
          selectedAt: selection.selectedAt,
        })
      );
    } catch {
      // La imagen sigue funcionando aunque el navegador no permita guardar datos.
    }

    const remainingTime = Math.max(
      0,
      selection.selectedAt + ROTATION_INTERVAL - Date.now()
    );

    const timeoutId = window.setTimeout(() => {
      setSelection(getRandomSelection(products, selectedProduct.id));
    }, remainingTime);

    return () => window.clearTimeout(timeoutId);
  }, [products, selectedProduct, selection.selectedAt]);

  if (!selectedProduct) return null;

  return (
    <Link
      to={`/producto/${encodeURIComponent(selectedProduct.id)}`}
      aria-label={`Ver producto: ${selectedProduct.name}`}
      className="relative z-10 flex h-[230px] w-full max-w-[510px] items-center justify-center rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6c945] sm:h-[400px]"
    >
      <img
        key={selectedProduct.id}
        src={selectedProduct.images.main}
        alt={selectedProduct.name}
        className="hero-product-image h-full w-full object-contain drop-shadow-[0_25px_55px_rgba(91,33,182,0.3)]"
      />
    </Link>
  );
}

export default HeroProductImage;
