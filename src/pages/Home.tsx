import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ImageOff, Sparkles } from "lucide-react";
import MobileProductCarousel from "../components/MobileProductCarousel";
import HeroProductImage from "../components/HeroProductImage";
import InstagramFeed from "../components/InstagramFeed";
import { Link } from "react-router-dom";
import { useCatalog } from "../context/useCatalog";
import nerdBot from "../../nerdbot.png";

function Home() {
  const { catalog, loading, error } = useCatalog();

  const newestProducts = useMemo(
    () =>
      (catalog?.products ?? [])
        .filter(
          (product) =>
            product.dateAdded &&
            !Number.isNaN(Date.parse(product.dateAdded))
        )
        .sort(
          (a, b) =>
            Date.parse(b.dateAdded) - Date.parse(a.dateAdded)
        )
        .slice(0, 4),
    [catalog?.products]
  );

  const heroProducts = useMemo(
    () =>
      (catalog?.products ?? []).filter(
        (product) =>
          product.availability === "Disponible" &&
          product.stock > 0 &&
          Boolean(product.images.main?.trim())
      ),
    [catalog?.products]
  );

  const categories = catalog?.categories ?? [];
  const categoriesTrackRef = useRef<HTMLDivElement>(null);
  const [hasCategoriesOverflow, setHasCategoriesOverflow] = useState(false);

  const updateCategoriesControls = useCallback(() => {
    const track = categoriesTrackRef.current;
    if (!track) return;

    setHasCategoriesOverflow(track.scrollWidth > track.clientWidth + 1);
  }, []);

  useEffect(() => {
    const track = categoriesTrackRef.current;
    if (!track) return;

    updateCategoriesControls();
    track.addEventListener("scroll", updateCategoriesControls, { passive: true });
    window.addEventListener("resize", updateCategoriesControls);

    return () => {
      track.removeEventListener("scroll", updateCategoriesControls);
      window.removeEventListener("resize", updateCategoriesControls);
    };
  }, [categories.length, updateCategoriesControls]);

  const scrollCategories = (direction: -1 | 1) => {
    const track = categoriesTrackRef.current;
    const firstCard = track?.querySelector<HTMLElement>("[data-category-card]");
    if (!track || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const isAtStart = track.scrollLeft <= 1;
    const isAtEnd = track.scrollLeft >= maxScrollLeft - 1;

    if (direction === 1 && isAtEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction === -1 && isAtStart) {
      track.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
      return;
    }

    track.scrollBy({
      left: direction * (firstCard.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  return (
    <main>
        <section
          id="inicio"
          className="relative isolate scroll-mt-20"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_40%,rgba(111,58,190,0.28),transparent_42%),radial-gradient(ellipse_at_10%_90%,rgba(246,201,69,0.08),transparent_35%)]" />

          <div className="mx-auto grid min-h-[430px] max-w-7xl grid-cols-[1.1fr_0.9fr] items-center gap-x-2 gap-y-1 px-4 py-10 sm:min-h-[650px] sm:grid-cols-1 sm:gap-8 sm:px-8 sm:py-16 min-[900px]:grid-cols-[1.05fr_0.95fr] lg:grid-cols-[1.05fr_0.95fr] lg:py-20">

            {/* CONTENIDO DE TEXTO */}
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/25 bg-[#7c3aed]/10 px-2 py-1 text-[9px] font-semibold tracking-wide text-[#c4b5fd] sm:mb-7 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs">
                <Sparkles size={14} />
                UN UNIVERSO PARA COLECCIONISTAS
              </div>

              <h1 className="text-xl font-black leading-[1.08] tracking-[-0.045em] min-[380px]:text-2xl sm:text-6xl min-[900px]:text-5xl lg:text-7xl">
                Tu próximo
                <br />
                favorito está
                <br />
                <span className="bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-[#f6c945] bg-clip-text text-transparent">
                  aquí.
                </span>
              </h1>

              <p className="mt-2 max-w-lg text-[11px] leading-4 text-white/60 min-[380px]:text-xs sm:mt-7 lg:text-lg sm:leading-8 min-[900px]:text-base lg:text-lg">
                Figuras, personajes y objetos que conectan con eso que tanto te gusta.
                Descubre un espacio hecho para quienes disfrutan coleccionar.
              </p>
            </div>

            {/* IMAGEN ALEATORIA DE PRODUCTO */}
            <div className="relative mx-auto -mt-3 flex w-full min-w-0 max-w-[540px] items-center justify-center self-start sm:mt-0 sm:self-center min-[900px]:col-start-2 min-[900px]:row-span-2">
              <div className="absolute h-[75%] w-[75%] rounded-full bg-[#6d28d9]/25 blur-[90px]" />
              <div className="absolute bottom-[8%] h-8 w-[62%] rounded-[50%] bg-black/50 blur-2xl" />

              {heroProducts.length > 0 || loading ? (
                <HeroProductImage products={heroProducts} loading={loading} />
              ) : (
                <img
                  src={nerdBot}
                  alt="Mascota de Nerdybles junto a una figura coleccionable"
                  className="relative z-10 w-full max-w-[510px] object-contain drop-shadow-[0_25px_55px_rgba(91,33,190,0.3)]"
                />
              )}
            </div>

            {/* BOTONES: TERCER ELEMENTO DEL GRID */}
            <div className="col-span-2 mt-3 flex flex-row justify-center gap-2 sm:col-span-1 sm:mt-9 sm:justify-start sm:gap-3 min-[900px]:col-start-1 min-[900px]:row-start-2">
              <a
                href="#colecciones"
                className="inline-flex items-center justify-center gap-1 rounded-full bg-[#f6c945] px-3 py-2 text-[10px] font-extrabold text-[#211807] shadow-[0_10px_35px_rgba(246,201,69,0.16)] transition-all hover:-translate-y-1 hover:bg-[#ffda68] sm:gap-3 sm:px-7 sm:py-4 sm:text-sm"
              >
                Descubrir colecciones
                <ArrowRight size={14} />
              </a>

              <a
                href="#nosotros"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-2 text-[10px] font-semibold text-white/80 transition-colors hover:border-white/35 hover:bg-white/5 hover:text-white sm:px-7 sm:py-4 sm:text-sm"
              >
                Conoce Nerdybles
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-3 sm:mt-12 sm:gap-4 sm:pt-6 min-[900px]:col-start-1 min-[900px]:row-start-3">
                <span className="h-1 w-10 rounded-full bg-[#a78bfa]" />
                <p className="text-[9px] font-medium tracking-wide text-white/40 sm:text-xs">
                  COLECCIONA LO QUE TE HACE ÚNICO
                </p>
              </div>

          </div>
        </section>

        <section id="colecciones" className="scroll-mt-20 border-y border-white/10 bg-white/[0.025]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.22em] text-[#a78bfa]">
                  EXPLORA NUESTRO UNIVERSO
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Encuentra tu colección
                </h2>
              </div>
              <div className="flex items-end justify-between gap-4 sm:justify-end">
                <p className="max-w-md text-sm leading-7 text-white/50 sm:text-right">
                  Un catálogo pensado para descubrir nuevas piezas y encontrar
                  esos personajes que siempre has querido tener.
                </p>
                {hasCategoriesOverflow && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => scrollCategories(-1)}
                      aria-label="Ver categorías anteriores"
                      className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#171222] text-white transition-colors hover:border-[#a78bfa]/50 hover:bg-[#6f3abe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCategories(1)}
                      aria-label="Ver más categorías"
                      className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#171222] text-white transition-colors hover:border-[#a78bfa]/50 hover:bg-[#6f3abe] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error ? (
              <div className="rounded-3xl border border-red-400/20 bg-[#171222] px-6 py-12 text-center">
                <h3 className="text-xl font-bold">No pudimos cargar las categorías</h3>
                <p className="mt-2 text-sm text-white/50">
                  Estamos teniendo dificultades para conectar con nuestro catálogo.
                </p>
              </div>
            ) : loading ? (
              <div className="rounded-3xl border border-white/10 bg-[#171222] px-6 py-12 text-center">
                <p className="text-sm text-white/50">Cargando categorías...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#a78bfa]/30 bg-[#171222]/70 px-6 py-12 text-center">
                <h3 className="text-xl font-bold">Pronto tendremos colecciones</h3>
                <p className="mt-2 text-sm text-white/50">
                  Estamos preparando las categorías de nuestro catálogo.
                </p>
              </div>
            ) : (
              <div
                ref={categoriesTrackRef}
                onScroll={updateCategoriesControls}
                aria-label="Categorías disponibles"
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    data-category-card
                    to={`/tienda?categoria=${encodeURIComponent(category.name)}`}
                    className="group w-[calc((100%-2rem)/3)] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#171222] transition-all duration-300 hover:-translate-y-1 hover:border-[#a78bfa]/45 hover:bg-[#1d172b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c945] focus-visible:ring-offset-2 focus-visible:ring-offset-[#100d18] lg:w-[calc((100%-3rem)/4)] [@media(orientation:landscape)_and_(min-width:600px)]:w-[calc((100%-3rem)/4)] [@media(orientation:portrait)_and_(min-width:600px)]:w-[calc((100%-2rem)/3)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#211a30]">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#a78bfa]/60">
                          <ImageOff size={32} strokeWidth={1.5} aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <h3 className="px-3 py-4 text-center text-base font-bold text-white transition-colors group-hover:text-[#c4b5fd] lg:text-lg">
                      {category.name}
                    </h3>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="novedades" className="scroll-mt-20">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.22em] text-[#f6c945]">RECIÉN LLEGADOS</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Lo más nuevo</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-white/50">Descubre las últimas piezas que se suman al universo Nerdybles.</p>
            </div>

            {error ? (
              <div className="rounded-3xl border border-red-400/20 bg-[#171222] px-6 py-12 text-center">
                <h3 className="text-xl font-bold">No pudimos cargar las novedades</h3>
                <p className="mt-2 text-sm text-white/50">
                  Estamos teniendo dificultades para conectar con nuestro catálogo.
                </p>
              </div>
            ) : loading ? (
              <div className="rounded-3xl border border-white/10 bg-[#171222] px-6 py-12 text-center">
                <p className="text-sm text-white/50">Cargando las últimas incorporaciones...</p>
              </div>
            ) : newestProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#a78bfa]/30 bg-[#171222]/70 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7c3aed]/15 text-[#c4b5fd]">
                  <Sparkles size={25} />
                </div>
                <h3 className="mt-5 text-xl font-bold">Pronto tendremos novedades</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-white/50">
                  Estamos preparando nuevas incorporaciones para nuestra colección.
                </p>
              </div>
            ) : (
              <MobileProductCarousel
                products={newestProducts}
                label="Novedades"
                gridClassName="gap-3 md:grid-cols-4 md:gap-4 xl:gap-5 [@media(orientation:landscape)_and_(min-width:600px)]:grid-cols-4 [@media(orientation:portrait)_and_(min-width:600px)]:!grid-cols-3"
              />
            )}
          </div>
        </section>

        <section
          id="destacados"
          className="scroll-mt-20 border-y border-white/10 bg-white/[0.025]"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="mb-10">
              <p className="text-xs font-bold tracking-[0.22em] text-[#a78bfa]">
                SELECCIÓN NERDYBLES
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Productos destacados
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/50">
                Descubre algunas de las piezas seleccionadas de nuestro catálogo.
              </p>
            </div>

            {error ? (
              <div className="rounded-3xl border border-red-400/20 bg-[#171222] px-6 py-12 text-center">
                <h3 className="text-xl font-bold">
                  No pudimos cargar los productos
                </h3>
                <p className="mt-2 text-sm text-white/50">
                  Estamos teniendo dificultades para conectar con nuestro catálogo.
                </p>
              </div>
            ) : loading ? (
              <div className="rounded-3xl border border-white/10 bg-[#171222] px-6 py-12 text-center">
                <p className="text-sm text-white/50">
                  Cargando productos destacados...
                </p>
              </div>
            ) : catalog?.featured.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#a78bfa]/30 bg-[#171222]/70 px-6 py-12 text-center sm:px-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7c3aed]/15 text-[#c4b5fd]">
                  <Sparkles size={25} />
                </div>
                <h3 className="mt-5 text-xl font-bold">
                  Estamos preparando algo especial
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-white/50">
                  Pronto encontrarás aquí una selección de productos destacados.
                </p>
              </div>
            ) : (
              <MobileProductCarousel
                products={catalog?.featured ?? []}
                label="Productos destacados"
                gridClassName="gap-3 md:grid-cols-4 md:gap-4 xl:gap-5 [@media(orientation:landscape)_and_(min-width:600px)]:grid-cols-4"
              />
            )}
          </div>
        </section>

        <InstagramFeed />

        <section id="nosotros" className="scroll-mt-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 sm:px-8 md:grid-cols-[0.7fr_1.3fr] md:items-center">
            <div className="flex items-center justify-center">
              <img
                src={nerdBot}
                alt=""
                className="w-48 drop-shadow-[0_15px_35px_rgba(109,40,217,0.25)] sm:w-56"
              />
            </div>
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.22em] text-[#a78bfa]">
                MÁS QUE OBJETOS
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Cada colección cuenta una historia.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/55">
                Nerdybles nace para reunir productos y universos que despiertan
                la emoción de coleccionar. Queremos que explorar, descubrir y
                encontrar tu próxima pieza favorita sea parte de la experiencia.
              </p>
            </div>
          </div>
        </section>

    </main>
  );
}

export default Home;
