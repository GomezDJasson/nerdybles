import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";

const ROTATION_INTERVAL = 12 * 60 * 60 * 1000;
const STORAGE_KEY = "nerdybles:hero-product-selection";

interface HeroProductImageProps {
  products: Product[];
  loading: boolean;
}

interface ProductSelection {
  productId: string;
  productName: string;
  imageUrl: string;
  selectedAt: number;
}

function isFreshSelection(selection: ProductSelection | null): selection is ProductSelection {
  if (!selection) return false;

  const age = Date.now() - selection.selectedAt;
  return age >= 0 && age < ROTATION_INTERVAL;
}

function readStoredSelection(): ProductSelection | null {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return null;

    const parsed: unknown = JSON.parse(storedValue);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("productId" in parsed) ||
      !("productName" in parsed) ||
      !("imageUrl" in parsed) ||
      !("selectedAt" in parsed) ||
      typeof parsed.productId !== "string" ||
      typeof parsed.productName !== "string" ||
      typeof parsed.imageUrl !== "string" ||
      typeof parsed.selectedAt !== "number" ||
      !parsed.productId ||
      !parsed.productName ||
      !parsed.imageUrl
    ) {
      return null;
    }

    const selection: ProductSelection = {
      productId: parsed.productId,
      productName: parsed.productName,
      imageUrl: parsed.imageUrl,
      selectedAt: parsed.selectedAt,
    };

    return isFreshSelection(selection) ? selection : null;
  } catch {
    // El almacenamiento puede estar deshabilitado o contener datos inválidos.
    return null;
  }
}

function getRandomSelection(
  products: Product[],
  previousProductId?: string
): ProductSelection | null {
  if (products.length === 0) return null;

  const alternatives =
    products.length > 1
      ? products.filter((product) => product.id !== previousProductId)
      : products;
  const pool = alternatives.length > 0 ? alternatives : products;
  const product = pool[Math.floor(Math.random() * pool.length)];

  return {
    productId: product.id,
    productName: product.name,
    imageUrl: product.images.main,
    selectedAt: Date.now(),
  };
}

function HeroProductImage({ products, loading }: HeroProductImageProps) {
  const [selection, setSelection] = useState<ProductSelection | null>(
    readStoredSelection
  );

  const savedProduct =
    !loading && isFreshSelection(selection)
      ? products.find((product) => product.id === selection.productId)
      : undefined;

  const fallbackSelection = useMemo(() => {
    if (loading || savedProduct) return null;
    return getRandomSelection(products, selection?.productId);
  }, [loading, products, savedProduct, selection?.productId]);

  const effectiveSelection = useMemo(() => {
    if (loading) {
      return isFreshSelection(selection) ? selection : null;
    }

    if (savedProduct && isFreshSelection(selection)) {
      return {
        productId: savedProduct.id,
        productName: savedProduct.name,
        imageUrl: savedProduct.images.main,
        selectedAt: selection.selectedAt,
      };
    }

    return fallbackSelection;
  }, [loading, selection, savedProduct, fallbackSelection]);

  const selectedProduct = effectiveSelection
    ? products.find((product) => product.id === effectiveSelection.productId)
    : undefined;

  useEffect(() => {
    if (loading || !effectiveSelection || !selectedProduct) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(effectiveSelection));
    } catch {
      // La imagen sigue funcionando aunque el navegador no permita guardar datos.
    }

    const remainingTime = Math.max(
      0,
      effectiveSelection.selectedAt + ROTATION_INTERVAL - Date.now()
    );

    const timeoutId = window.setTimeout(() => {
      setSelection(getRandomSelection(products, effectiveSelection.productId));
    }, remainingTime);

    return () => window.clearTimeout(timeoutId);
  }, [loading, products, effectiveSelection, selectedProduct]);

  const productName = effectiveSelection?.productName;
  const imageUrl = effectiveSelection?.imageUrl;
  const productId = effectiveSelection?.productId;

  if (!productId || !productName || !imageUrl) {
    return (
      <div
        aria-label="Cargando producto destacado"
        role="status"
        className="relative z-10 h-[230px] w-full max-w-[510px] sm:h-[400px]"
      />
    );
  }

  return (
    <Link
      to={`/producto/${encodeURIComponent(productId)}`}
      aria-label={`Ver producto: ${productName}`}
      className="relative z-10 flex h-[230px] w-full max-w-[510px] items-center justify-center rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6c945] sm:h-[400px]"
    >
      <img
        key={productId}
        src={imageUrl}
        alt={productName}
        className="hero-product-image h-full w-full object-contain drop-shadow-[0_25px_55px_rgba(91,33,190,0.3)]"
      />
    </Link>
  );
}

export default HeroProductImage;
