import { useState, type FormEvent } from "react";
import { ArrowLeft, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCatalog } from "../context/useCatalog";
import { useCart } from "../context/useCart";
import { WHATSAPP_NUMBER } from "../constants/store";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  department: string;
  city: string;
  address: string;
  neighborhood: string;
  notes: string;
}

const initialDetails: CustomerDetails = {
  fullName: "",
  phone: "",
  email: "",
  department: "",
  city: "",
  address: "",
  neighborhood: "",
  notes: "",
};

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#100d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20";

function Checkout() {
  const { loading, error } = useCatalog();
  const { items, totalQuantity, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [details, setDetails] = useState<CustomerDetails>(initialDetails);
  const [accepted, setAccepted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState("");
  const [orderPrepared, setOrderPrepared] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const unavailableItems = items.filter(
    ({ product, quantity }) =>
      !product ||
      product.availability !== "Disponible" ||
      product.stock < quantity ||
      product.stock <= 0
  );

  const updateField = (field: keyof CustomerDetails, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (unavailableItems.length > 0) {
      setFormError(
        "Uno o más productos ya no tienen disponibilidad o stock suficiente. Regresa al carrito para revisarlos."
      );
      return;
    }

    if (!accepted || !acceptedTerms) {
      setFormError("Debes aceptar el tratamiento de tus datos y confirmar que has leído los términos y condiciones.");
      return;
    }

    const productLines = items.map(({ product, quantity }) => {
      if (!product) return "";
      return [
        `• ${product.name} (${product.sku})`,
        `  Cantidad: ${quantity}`,
        `  Precio unitario: ${currencyFormatter.format(product.price)}`,
        `  Total: ${currencyFormatter.format(product.price * quantity)}`,
      ].join("\n");
    });

    const message = [
      "Nuevo pedido desde Nerdybles",
      "",
      "Hola, quiero realizar el siguiente pedido:",
      "",
      "PRODUCTOS",
      ...productLines,
      "",
      `Subtotal: ${currencyFormatter.format(subtotal)}`,
      "Envío: Por cotizar",
      "",
      "DATOS DEL CLIENTE",
      `Nombre: ${details.fullName.trim()}`,
      `Teléfono/WhatsApp: ${details.phone.trim()}`,
      details.email.trim() ? `Correo: ${details.email.trim()}` : "",
      `Departamento: ${details.department.trim()}`,
      `Ciudad/municipio: ${details.city.trim()}`,
      `Dirección: ${details.address.trim()}`,
      details.neighborhood.trim() ? `Barrio: ${details.neighborhood.trim()}` : "",
      details.notes.trim() ? `Indicaciones: ${details.notes.trim()}` : "",
      "",
      "Entiendo que el envío no está incluido y que su costo se confirmará por WhatsApp. También entiendo que este mensaje es una solicitud y que Nerdybles verificará disponibilidad y precio antes de confirmar el pedido.",
    ].filter(Boolean);

    const nextWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message.join("\n"))}`;
    window.open(nextWhatsappUrl, "_blank", "noopener,noreferrer");
    setWhatsappUrl(nextWhatsappUrl);
    setOrderPrepared(true);
  };

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center px-5 py-20">
        <p className="text-sm text-white/55">Verificando tu pedido...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center">
        <p className="text-lg font-bold">No pudimos verificar el catálogo</p>
        <p className="mt-2 text-sm text-white/50">{error}</p>
        <Link to="/carrito" className="mt-6 text-sm font-bold text-[#c4b5fd] hover:text-white">
          Volver al carrito
        </Link>
      </main>
    );
  }

  if (orderPrepared) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-full border border-[#a78bfa]/20 bg-[#171222] text-[#a78bfa]">
          <MessageCircle size={36} />
        </div>
        <p className="mt-6 text-xs font-bold tracking-[0.2em] text-[#a78bfa]">PEDIDO PREPARADO</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">¡Gracias por elegir Nerdybles!</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/55">
          WhatsApp debería haberse abierto con los datos de tu solicitud. Revisa el mensaje y pulsa Enviar para que podamos recibirlo.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/5"
        >
          <MessageCircle size={17} />
          Abrir WhatsApp nuevamente
        </a>
        <button
          type="button"
          onClick={() => {
            clearCart();
            navigate("/", { replace: true });
          }}
          className="mt-4 w-full max-w-sm rounded-full bg-[#f6c945] px-6 py-3.5 text-sm font-extrabold text-[#211807] transition-all hover:-translate-y-0.5 hover:bg-[#ffda68]"
        >
          Ya envié mi pedido, volver al inicio
        </button>
        <p className="mt-4 max-w-md text-xs leading-5 text-white/35">
          Al confirmar, vaciaremos tu carrito y volverás a la página principal. Si todavía no has enviado el mensaje, hazlo antes de continuar.
        </p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center">
        <ShoppingBag size={38} className="text-[#a78bfa]" />
        <h1 className="mt-5 text-2xl font-black">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-white/50">Agrega productos antes de continuar con el pedido.</p>
        <Link to="/tienda" className="mt-6 rounded-full bg-[#f6c945] px-6 py-3 text-sm font-extrabold text-[#211807]">
          Explorar la tienda
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
        <Link to="/carrito" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition-colors hover:text-[#c4b5fd]">
          <ArrowLeft size={17} />
          Volver al carrito
        </Link>

        <div className="mb-8">
          <p className="text-xs font-bold tracking-[0.2em] text-[#a78bfa]">CASI LISTO</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Finalizar pedido</h1>
          <p className="mt-2 text-sm text-white/50">Completa tus datos para enviar la solicitud a Nerdybles por WhatsApp.</p>
        </div>

        {unavailableItems.length > 0 && (
          <div role="alert" className="mb-6 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-200">
            Hay productos sin disponibilidad o con cambios de inventario. Vuelve al carrito para revisar las cantidades antes de continuar.
            <Link to="/carrito" className="ml-1 font-bold underline underline-offset-4">Revisar carrito</Link>
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form onSubmit={handleSubmit} className="space-y-7 rounded-2xl border border-white/10 bg-[#171222] p-5 sm:p-7">
            <section>
              <h2 className="text-lg font-bold">Datos de contacto</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-white/75 sm:col-span-2">
                  Nombre completo <span className="text-[#f6c945]">*</span>
                  <input className={fieldClassName} name="fullName" autoComplete="name" required maxLength={100} value={details.fullName} onChange={(event) => updateField("fullName", event.target.value)} placeholder="Tu nombre y apellido" />
                </label>
                <label className="text-sm font-semibold text-white/75">
                  Teléfono / WhatsApp <span className="text-[#f6c945]">*</span>
                  <input className={fieldClassName} name="phone" type="tel" autoComplete="tel" required maxLength={25} value={details.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Ej. 300 123 4567" />
                </label>
                <label className="text-sm font-semibold text-white/75">
                  Correo electrónico <span className="font-normal text-white/35">(opcional)</span>
                  <input className={fieldClassName} name="email" type="email" autoComplete="email" maxLength={120} value={details.email} onChange={(event) => updateField("email", event.target.value)} placeholder="correo@ejemplo.com" />
                </label>
              </div>
            </section>

            <div className="border-t border-white/10" />

            <section>
              <h2 className="text-lg font-bold">Dirección de entrega</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-white/75">
                  Departamento <span className="text-[#f6c945]">*</span>
                  <input className={fieldClassName} name="department" autoComplete="address-level1" required maxLength={80} value={details.department} onChange={(event) => updateField("department", event.target.value)} placeholder="Ej. Cundinamarca" />
                </label>
                <label className="text-sm font-semibold text-white/75">
                  Ciudad / municipio <span className="text-[#f6c945]">*</span>
                  <input className={fieldClassName} name="city" autoComplete="address-level2" required maxLength={80} value={details.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Ej. Bogotá" />
                </label>
                <label className="text-sm font-semibold text-white/75 sm:col-span-2">
                  Dirección <span className="text-[#f6c945]">*</span>
                  <input className={fieldClassName} name="address" autoComplete="street-address" required maxLength={160} value={details.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Calle, carrera, número, apartamento..." />
                </label>
                <label className="text-sm font-semibold text-white/75">
                  Barrio <span className="font-normal text-white/35">(opcional)</span>
                  <input className={fieldClassName} name="neighborhood" maxLength={80} value={details.neighborhood} onChange={(event) => updateField("neighborhood", event.target.value)} placeholder="Nombre del barrio" />
                </label>
                <label className="text-sm font-semibold text-white/75 sm:col-span-2">
                  Indicaciones adicionales <span className="font-normal text-white/35">(opcional)</span>
                  <textarea className={fieldClassName + " min-h-24 resize-y"} name="notes" maxLength={500} value={details.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Referencias para encontrar la dirección u otra información útil" />
                </label>
              </div>
            </section>

            <div className="border-t border-white/10" />

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/65">
              <input type="checkbox" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-4 shrink-0 accent-[#a78bfa]" />
              <span>
                Autorizo a Nerdybles a utilizar los datos que proporciono para gestionar esta solicitud de pedido y contactarme sobre ella. He leído la{" "}
                <Link
                  to="/politica-de-tratamiento-de-datos"
                  className="font-semibold text-[#c4b5fd] underline underline-offset-4 hover:text-white"
                >
                  Política de Tratamiento de Datos Personales
                </Link>
                . Entiendo que el formulario no guarda mis datos en una cuenta o base de datos de Nerdybles; al continuar se abrirá WhatsApp para que yo envíe el mensaje.
                <span className="text-[#f6c945]"> *</span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/65">
              <input type="checkbox" required checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 size-4 shrink-0 accent-[#a78bfa]" />
              <span>
                He leído y acepto los{" "}
                <Link
                  to="/terminos-y-condiciones"
                  className="font-semibold text-[#c4b5fd] underline underline-offset-4 hover:text-white"
                >
                  Términos y Condiciones de Compra
                </Link>
                .
                <span className="text-[#f6c945]"> *</span>
              </span>
            </label>

            {formError && <p role="alert" className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm leading-5 text-amber-200">{formError}</p>}

            <button type="submit" disabled={unavailableItems.length > 0} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f6c945] px-6 py-3.5 text-sm font-extrabold text-[#211807] transition-all hover:-translate-y-0.5 hover:bg-[#ffda68] disabled:cursor-not-allowed disabled:opacity-40">
              <MessageCircle size={18} />
              Enviar pedido por WhatsApp
            </button>
            <p className="text-center text-xs leading-5 text-white/35">No se realizará ningún cobro en esta página. El pedido queda sujeto a confirmación por Nerdybles.</p>
          </form>

          <aside className="rounded-2xl border border-white/10 bg-[#171222] p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold">Resumen del pedido</h2>
            <p className="mt-1 text-xs text-white/40">{totalQuantity} {totalQuantity === 1 ? "artículo" : "artículos"}</p>
            <div className="mt-5 max-h-80 space-y-4 overflow-y-auto pr-1">
              {items.map(({ product, productId, quantity }) => (
                <div key={productId} className="flex gap-3">
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#100d18] p-1">
                    {product?.images.main ? <img src={product.images.main} alt="" className="h-full w-full object-contain" /> : <ShoppingBag size={20} className="text-white/30" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">{product?.name || "Producto no disponible"}</p>
                    <p className="mt-1 text-xs text-white/40">Cantidad: {quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold">{product ? currencyFormatter.format(product.price * quantity) : "—"}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-sm font-semibold">Subtotal</span>
              <span className="text-xl font-black text-[#f6c945]">{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#100d18] p-3 text-xs leading-5 text-white/50">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#a78bfa]" />
              Envío por cotizar. Confirmaremos su costo, disponibilidad y precio por WhatsApp antes de aceptar el pedido.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
