import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, MessageCircle, ShoppingCart, X } from "lucide-react";
import SocialIcon, { type SocialNetwork } from "./SocialIcon";
import { useCart } from "../context/useCart";
import nerdBot from "../../nerdbot.png";

const navigation = [
  { label: "Inicio", to: "/" },
  { label: "Tienda", to: "/tienda" },
  { label: "Contacto", to: "/contacto" },
];

const socialLinks: { label: SocialNetwork; href: string }[] = [
  { label: "Instagram", href: "https://www.instagram.com/nerdybles/" },
  { label: "Facebook", href: "https://www.facebook.com/nerdybles" },
  { label: "TikTok", href: "https://www.tiktok.com/@juliethmar8" },
  { label: "X", href: "https://x.com/nerdybles" },
  { label: "YouTube", href: "https://www.youtube.com/@nerdybles" },
  { label: "Threads", href: "https://www.threads.net/@nerdybles" },
];

function CartIndicator() {
  const { totalQuantity } = useCart();

  return (
    <Link
      to="/carrito"
      aria-label={`Carrito de compras, ${totalQuantity} artículos`}
      className="relative flex size-10 items-center justify-center rounded-xl text-white/75 transition-colors hover:bg-white/5 hover:text-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
    >
      <ShoppingCart size={21} />
      {totalQuantity > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#f6c945] px-1 text-[10px] font-black leading-none text-[#211807]">
          {totalQuantity > 99 ? "99+" : totalQuantity}
        </span>
      )}
    </Link>
  );
}

function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#100d18] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#100d18]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="Nerdybles, ir al inicio"
            onClick={closeMenu}
          >
            <img src={nerdBot} alt="" className="h-11 w-11 rounded-xl object-contain" />
            <span className="brand-name text-xl font-bold tracking-tight">Nerdybles</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <nav className="flex items-center gap-8" aria-label="Navegación principal">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-sm font-medium text-white/65 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <CartIndicator />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <CartIndicator />
            <button
              type="button"
              className="rounded-xl p-2 text-white"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="border-t border-white/10 bg-[#171222] px-5 py-4 md:hidden"
            aria-label="Navegación móvil"
          >
            {navigation.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={closeMenu}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <Outlet />

      <footer id="contacto" className="scroll-mt-20 border-t border-white/10 bg-[#0b0910]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={nerdBot} alt="" className="h-10 w-10 object-contain" />
            <span className="brand-name text-lg font-bold tracking-tight">Nerdybles</span>
          </Link>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-white/40">
              Un universo para quienes disfrutan coleccionar.
            </p>
            <div className="flex flex-col items-start gap-2">
              <Link
                to="/terminos-y-condiciones"
                className="w-fit text-xs text-white/45 transition-colors hover:text-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6c945]"
              >
                Términos y condiciones de compra
              </Link>
              <Link
                to="/politica-de-tratamiento-de-datos"
                className="w-fit text-xs text-white/45 transition-colors hover:text-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6c945]"
              >
                Tratamiento de datos personales
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-white/70">Síguenos en redes</p>
            <div className="flex items-center gap-2 sm:gap-3" aria-label="Redes sociales de Nerdybles">
              {socialLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex size-10 items-center justify-center rounded-lg bg-white/[0.04] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
                >
                  <SocialIcon name={label} className="size-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.06] px-5 py-5 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Nerdybles. Todos los derechos reservados.
        </div>
      </footer>

      <a
        href="https://wa.me/573156679984"
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar a Nerdybles por WhatsApp"
        title="Escríbenos por WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full border border-white/15 bg-[#25D366] text-[#082b17] shadow-[0_8px_30px_rgba(37,211,102,0.3)] transition-transform hover:-translate-y-1 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6c945] sm:bottom-7 sm:right-7"
      >
        <MessageCircle size={25} />
      </a>
    </div>
  );
}

export default SiteLayout;
