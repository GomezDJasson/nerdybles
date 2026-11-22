import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Package,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useCatalog } from "../context/useCatalog";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { catalog, loading, error } = useCatalog();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState("");
  const [cartFeedback, setCartFeedback] = useState("");
  const product = catalog?.products.find((item) => item.id === id);
  const images = product
    ? [product.images.main, product.images.additional1, product.images.additional2].filter(Boolean)
    : [];

  const activeImage = images.includes(selectedImage) ? selectedImage : images[0];
  const activeImageIndex = images.indexOf(activeImage);

  const showPreviousImage = () => {
    if (images.length > 1) {
      setSelectedImage(images[(activeImageIndex - 1 + images.length) % images.length]);
    }
  };

  const showNextImage = () => {
    if (images.length > 1) {
      setSelectedImage(images[(activeImageIndex + 1) % images.length]);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const result = addItem(product);
    if (result === "added") {
      setCartFeedback("Producto agregado al carrito.");
    } else if (result === "limit") {
      setCartFeedback("Ya tienes todas las unidades disponibles en el carrito.");
    } else {
      setCartFeedback("Este producto no está disponible actualmente.");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-5 py-20">
        <p className="text-sm text-white/55">Cargando producto...</p>
      </main>
    );
  }

  if (error || !catalog) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center">
        <h1 className="text-2xl font-bold">No pudimos cargar el producto</h1>
        <p className="mt-2 max-w-md text-sm text-white/50">
          Estamos teniendo dificultades para conectar con nuestro catálogo. Inténtalo de nuevo más tarde.
        </p>
        <Link to="/tienda" className="mt-6 rounded-full bg-[#f6c945] px-5 py-3 text-sm font-bold text-[#211807] transition-colors hover:bg-[#ffda68]">
          Volver a la tienda
        </Link>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center">
        <Sparkles size={36} className="text-[#a78bfa]" />
        <h1 className="mt-4 text-2xl font-bold">Producto no encontrado</h1>
        <p className="mt-2 text-sm text-white/50">
          Es posible que este producto ya no esté disponible en nuestro catálogo.
        </p>
        <Link to="/tienda" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f6c945] px-5 py-3 text-sm font-bold text-[#211807] transition-colors hover:bg-[#ffda68]">
          <ArrowLeft size={16} />
          Explorar la tienda
        </Link>
      </main>
    );
  }

  const whatsappMessage = [
    "Hola, quiero más información sobre este producto de Nerdybles:",
    "",
    `Producto: ${product.name}`,
    `Referencia: ${product.sku}`,
    `Precio publicado: ${currencyFormatter.format(product.price)}`,
    `Disponibilidad: ${product.availability}`,
    "",
    "¿Me pueden confirmar su disponibilidad y dar más información?",
  ].join("\n");
  const whatsappUrl = `https://wa.me/573156679984?text=${encodeURIComponent(whatsappMessage)}`;

  const specifications = [
    { label: "Marca", value: product.brand },
    { label: "Línea", value: product.line },
    { label: "Categoría", value: product.category },
    { label: "Número", value: product.number },
    { label: "Versión", value: product.variant },
    { label: "Colección", value: product.collection },
    { label: "Referencia", value: product.sku },
  ].filter((item) => item.value);

  return (
    <main className="min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-10">
        <Link
          to="/tienda"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition-colors hover:text-[#c4b5fd]"
        >
          <ArrowLeft size={17} />
          Volver a la tienda
        </Link>

        <div className="grid gap-9 lg:grid-cols-2 lg:gap-14">
          <section aria-label="Fotografías del producto" className="min-w-0">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(111,58,190,0.24),rgba(23,18,34,0.7)_70%)] p-6 sm:p-10">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-[#a78bfa]/50">
                  <Sparkles size={56} />
                  <span className="text-sm">Imagen próximamente</span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    aria-label="Ver fotografía anterior"
                    className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#100d18]/75 text-white shadow-lg backdrop-blur transition-colors hover:bg-[#6f3abe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945] sm:left-5 sm:size-12"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    aria-label="Ver fotografía siguiente"
                    className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#100d18]/75 text-white shadow-lg backdrop-blur transition-colors hover:bg-[#6f3abe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945] sm:right-5 sm:size-12"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              {product.availability === "Agotado" && (
                <span className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                  Agotado
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`Ver fotografía ${index + 1}`}
                    aria-pressed={activeImage === image}
                    className={`flex aspect-square items-center justify-center overflow-hidden rounded-2xl border bg-[#171222] p-3 transition-colors hover:border-[#a78bfa]/60 ${activeImage === image ? "border-[#a78bfa]" : "border-white/10"}`}
                  >
                    <img src={image} alt="" loading="lazy" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#a78bfa]">
                {product.brand || product.category || "Coleccionable"}
              </span>
              <span className="text-xs text-white/35">{product.sku}</span>
            </div>

            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            {product.collection && (
              <p className="mt-2 text-base text-white/45">{product.collection}</p>
            )}

            <p className="mt-6 text-3xl font-extrabold text-[#f6c945]">
              {currencyFormatter.format(product.price)}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm">
              {product.availability === "Disponible" ? (
                <>
                  <Check size={17} className="text-emerald-400" />
                  <span className="font-medium text-emerald-400">Disponible</span>
                  {product.stock > 0 && (
                    <span className="text-white/40">· {product.stock} en inventario</span>
                  )}
                </>
              ) : (
                <>
                  <Package size={17} className="text-amber-400" />
                  <span className="font-medium text-amber-300">Agotado</span>
                </>
              )}
            </div>

            {product.availability === "Disponible" && product.stock > 0 && (
              <div className="mt-7">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f6c945] px-6 py-3 text-sm font-extrabold text-[#211807] transition-all hover:-translate-y-0.5 hover:bg-[#ffda68] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6c945]"
                >
                  <ShoppingCart size={18} />
                  Agregar al carrito
                </button>
                {cartFeedback && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <p aria-live="polite" className="text-white/60">{cartFeedback}</p>
                    <Link to="/carrito" className="font-bold text-[#c4b5fd] transition-colors hover:text-white">
                      Ver carrito
                    </Link>
                  </div>
                )}
              </div>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all hover:border-[#a78bfa]/50 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6c945]"
            >
              <MessageCircle size={18} />
              Consultar por WhatsApp
            </a>
            <p className="mt-3 text-center text-xs leading-5 text-white/35">
              Confirma disponibilidad y detalles de entrega directamente con Nerdybles.
            </p>

            <div className="mt-8 border-t border-white/10 pt-7">
              <h2 className="text-lg font-bold">Descripción</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/60">
                {product.commercialDescription || product.technicalDescription || "Pronto agregaremos más información sobre este producto."}
              </p>
            </div>

            {specifications.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-7">
                <h2 className="text-lg font-bold">Detalles del producto</h2>
                <dl className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                  {specifications.map((item) => (
                    <div key={item.label} className="flex justify-between gap-3 border-b border-white/5 py-3 text-sm">
                      <dt className="text-white/40">{item.label}</dt>
                      <dd className="text-right font-medium text-white/80">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
