import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCatalog } from "../context/useCatalog";
import { useCart } from "../context/useCart";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function Cart() {
  const { loading } = useCatalog();
  const { items, totalQuantity, subtotal, updateQuantity, removeItem } = useCart();

  if (loading && items.length > 0 && items.every((item) => !item.product)) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-5 py-20">
        <p className="text-sm text-white/55">Cargando tu carrito...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center">
        <div className="flex size-20 items-center justify-center rounded-full border border-[#a78bfa]/20 bg-[#171222] text-[#a78bfa]">
          <ShoppingBag size={34} />
        </div>
        <h1 className="mt-6 text-3xl font-black">Tu carrito está vacío</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
          Todavía no has agregado piezas a tu colección. Explora nuestro catálogo
          y encuentra tu próximo coleccionable favorito.
        </p>
        <Link
          to="/tienda"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f6c945] px-6 py-3 text-sm font-extrabold text-[#211807] transition-all hover:-translate-y-0.5 hover:bg-[#ffda68]"
        >
          Explorar la tienda
        </Link>
      </main>
    );
  }

  const hasUnavailableItems = items.some(
    (item) =>
      !item.product ||
      item.product.availability !== "Disponible" ||
      item.product.stock <= 0 ||
      item.quantity > item.product.stock
  );

  return (
    <main className="min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <Link
          to="/tienda"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition-colors hover:text-[#c4b5fd]"
        >
          <ArrowLeft size={17} />
          Seguir explorando
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#a78bfa]">TU SELECCIÓN</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Carrito de compras</h1>
          </div>
          <p className="text-sm text-white/45">
            {totalQuantity} {totalQuantity === 1 ? "artículo" : "artículos"}
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-4" aria-label="Productos en el carrito">
            {items.map(({ product, productId, quantity }) => (
              <article
                key={productId}
                className="flex min-w-0 flex-col gap-4 rounded-2xl border border-white/10 bg-[#171222] p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#100d18] p-2">
                  {product?.images.main ? (
                    <img src={product.images.main} alt={product.name} className="h-full w-full object-contain" />
                  ) : (
                    <ShoppingBag size={28} className="text-white/25" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
                    {product?.brand || "Nerdybles"}
                  </p>
                  <h2 className="mt-1 font-bold text-white">
                    {product?.name || "Producto no disponible"}
                  </h2>
                  <p className="mt-1 text-xs text-white/35">
                    Referencia: {product?.sku || productId}
                  </p>
                  {product ? (
                    <>
                      <p className="mt-2 text-sm font-bold text-[#f6c945]">
                        {currencyFormatter.format(product.price)}
                      </p>
                      {product.stock > 0 && quantity > product.stock && (
                        <p className="mt-2 text-xs text-amber-300">
                          El inventario cambió. Ajusta la cantidad a {product.stock} unidades o menos.
                        </p>
                      )}
                      {product.stock <= 0 || product.availability === "Agotado" ? (
                        <p className="mt-2 text-xs text-amber-300">Actualmente agotado</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-amber-300">
                      Este producto ya no aparece en el catálogo.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#100d18] p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(productId, quantity - 1)}
                      disabled={quantity <= 1 || !product || product.stock <= 0}
                      aria-label={`Reducir cantidad de ${product?.name || "producto"}`}
                      className="flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="min-w-6 text-center text-sm font-bold tabular-nums">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(productId, quantity + 1)}
                      disabled={!product || product.stock <= 0 || quantity >= product.stock}
                      aria-label={`Aumentar cantidad de ${product?.name || "producto"}`}
                      className="flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-white">
                      {product ? currencyFormatter.format(product.price * quantity) : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(productId)}
                      aria-label={`Eliminar ${product?.name || "producto"} del carrito`}
                      className="rounded-lg p-2 text-white/35 transition-colors hover:bg-red-400/10 hover:text-red-300"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-2xl border border-white/10 bg-[#171222] p-5 sm:p-6">
            <h2 className="text-lg font-bold">Resumen del pedido</h2>
            <div className="mt-5 flex items-center justify-between text-sm text-white/55">
              <span>Productos ({totalQuantity})</span>
              <span className="font-semibold text-white">{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
              <span className="font-bold">Subtotal</span>
              <span className="text-xl font-black text-[#f6c945]">{currencyFormatter.format(subtotal)}</span>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/40">
              El costo de envío no está incluido. Se cotizará según tu ubicación al confirmar el pedido por WhatsApp.
            </p>
            {hasUnavailableItems && (
              <p className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-xs leading-5 text-amber-200">
                Hay productos cuya disponibilidad debe revisarse. Puedes retirarlos del carrito o ajustar sus cantidades.
              </p>
            )}
            <Link
              to="/checkout"
              aria-disabled={hasUnavailableItems}
              onClick={(event) => {
                if (hasUnavailableItems) event.preventDefault();
              }}
              className={`mt-6 block w-full rounded-full px-5 py-3 text-center text-sm font-bold transition-colors ${hasUnavailableItems ? "cursor-not-allowed bg-white/10 text-white/35" : "bg-[#f6c945] text-[#211807] hover:bg-[#ffda68]"}`}
            >
              Continuar con el pedido
            </Link>
            <p className="mt-3 text-center text-[11px] leading-5 text-white/30">
              Revisaremos disponibilidad y precio antes de confirmar tu pedido.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;
