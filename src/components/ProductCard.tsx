import { useState } from "react";
import { Check, ShoppingCart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact";
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState("");
  const compact = variant === "compact";
  const hasImage = Boolean(product.images.main);
  const isAvailable = product.availability === "Disponible" && product.stock > 0;

  const handleAddToCart = () => {
    const result = addItem(product);

    if (result === "added") {
      setFeedback("Agregado al carrito");
    } else if (result === "limit") {
      setFeedback("Ya agregaste todo el stock disponible");
    } else {
      setFeedback("Producto no disponible");
    }
  };

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#171222] transition-all duration-300 hover:-translate-y-1 hover:border-[#a78bfa]/40">
      <Link
        to={`/producto/${encodeURIComponent(product.id)}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#f6c945]"
        aria-label={`Ver detalles de ${product.name}`}
      >
        <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.2),rgba(23,18,34,0.15)_65%)] ${compact ? "p-2.5 lg:p-3" : "p-5"}`}>
          {hasImage ? (
            <img
              src={product.images.main}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Sparkles size={compact ? 28 : 38} className="text-[#a78bfa]/50" />
          )}

          {!isAvailable && (
            <span className={`absolute right-2 top-2 rounded-full bg-white/10 px-2 py-1 font-semibold text-white/80 backdrop-blur ${compact ? "text-[10px]" : "right-4 top-4 px-3 py-1.5 text-xs"}`}>
              Agotado
            </span>
          )}
        </div>

        <div className={compact ? "px-3 pb-2 pt-3 lg:px-3.5" : "px-5 pb-2 pt-5"}>
          <div className="flex min-w-0 items-center justify-between gap-1.5">
            <span className={`min-w-0 truncate font-semibold uppercase tracking-wider text-[#a78bfa] ${compact ? "text-[9px] lg:text-[10px]" : "text-xs"}`}>
              {product.brand || product.category}
            </span>
            <span className={`shrink-0 text-white/35 ${compact ? "text-[9px]" : "text-xs"}`}>{product.sku}</span>
          </div>

          <h3 className={compact ? "mt-2 min-h-10 line-clamp-2 text-sm font-bold leading-5" : "mt-3 min-h-12 text-lg font-bold leading-6"}>
            {product.name}
          </h3>

          {product.collection && (
            <p className={`truncate text-white/45 ${compact ? "mt-0.5 text-xs" : "mt-1 text-sm"}`}>
              {product.collection}
            </p>
          )}

          <div className={`flex min-w-0 items-center justify-between gap-1 border-t border-white/10 ${compact ? "mt-3 pt-3" : "mt-5 gap-3 pt-4"}`}>
            <span className={`min-w-0 truncate font-extrabold text-[#f6c945] ${compact ? "text-sm lg:text-base" : "text-lg"}`}>
              {currencyFormatter.format(product.price)}
            </span>

            {isAvailable && (
              <span className={`shrink-0 font-medium text-emerald-400 ${compact ? "text-[9px] lg:text-[10px]" : "text-xs"}`}>
                Disponible
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className={compact ? "px-2 pb-3 pt-2 sm:px-3" : "px-3 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3"}>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          aria-label={isAvailable ? `Agregar ${product.name} al carrito` : `${product.name}: agotado`}
          className={`inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full bg-[#f6c945] px-2 py-2 font-extrabold text-[#211807] transition-all hover:-translate-y-0.5 hover:bg-[#ffda68] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f6c945] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35 disabled:hover:translate-y-0 ${compact ? "text-[11px]" : "text-xs sm:min-h-11 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"}`}
        >
          {isAvailable ? (
            <>
              <ShoppingCart size={15} className="shrink-0" />
              {compact ? "Agregar" : (
                <>
                  <span className="sm:hidden">Agregar</span>
                  <span className="hidden sm:inline">Agregar al carrito</span>
                </>
              )}
            </>
          ) : (
            "Agotado"
          )}
        </button>

        {feedback && (
          <p
            aria-live="polite"
            className={`mt-2 flex min-h-4 items-center justify-center gap-1.5 text-center text-[#c4b5fd] ${compact ? "text-[10px]" : "text-xs"}`}
          >
            {feedback === "Agregado al carrito" && <Check size={13} />}
            {feedback}
          </p>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
