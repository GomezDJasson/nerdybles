import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useCatalog } from "../context/useCatalog";
import type { Product } from "../types/product";

type AvailabilityFilter = "Todos" | "Disponible" | "Agotado";

const PAGE_SIZE = 12;
const EMPTY_PRODUCTS: Product[] = [];

function Shop() {
  const { catalog, loading, error } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("Todas");
  const [availability, setAvailability] = useState<AvailabilityFilter>("Todos");
  const [pagination, setPagination] = useState({
    filterKey: "",
    count: PAGE_SIZE,
  });

  const resetPagination = () => {
    setPagination({
      filterKey: "",
      count: PAGE_SIZE,
    });
  };

  const products = catalog?.products ?? EMPTY_PRODUCTS;

  const categories = catalog?.categories ?? [];
  const categoryNames = categories.map((item) => item.name);

  const requestedCategory = searchParams.get("categoria") ?? "Todas";
  const category = categoryNames.includes(requestedCategory) ? requestedCategory : "Todas";

  const updateCategory = (value: string) => {
    resetPagination();
    const nextParams = new URLSearchParams(searchParams);
    if (value === "Todas") {
      nextParams.delete("categoria");
    } else {
      nextParams.set("categoria", value);
    }
    setSearchParams(nextParams);
  };

 const brands = [
    ...new Set(products.map((product) => product.brand).filter(Boolean)),
  ].sort();

  const filteredProducts = products.filter((product) => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");

    const matchesSearch =
      !normalizedSearch ||
      [product.name, product.brand, product.collection, product.sku, product.category]
        .some((value) => value.toLocaleLowerCase("es").includes(normalizedSearch));

    const matchesCategory = category === "Todas" || product.category === category;
    const matchesBrand = brand === "Todas" || product.brand === brand;
    const matchesAvailability =
      availability === "Todos" || product.availability === availability;

    return matchesSearch && matchesCategory && matchesBrand && matchesAvailability;
  });

  const filterKey = JSON.stringify([search, category, brand, availability]);

  const visibleCount =
    pagination.filterKey === filterKey ? pagination.count : PAGE_SIZE;

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  const hasActiveFilters =
    search !== "" || category !== "Todas" || brand !== "Todas" || availability !== "Todos";

  const clearFilters = () => {
    setSearch("");
    setSearchParams({});
    setBrand("Todas");
    setAvailability("Todos");
    resetPagination();
  };

  return (
    <main className="min-h-[70vh]">
      <section className="border-b border-white/10 bg-[radial-gradient(ellipse_at_75%_20%,rgba(111,58,190,0.22),transparent_45%)]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-bold tracking-[0.22em] text-[#f6c945]">
            DESCUBRE TU PRÓXIMA PIEZA
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Nuestra tienda
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Explora el catálogo Nerdybles y encuentra figuras y coleccionables
            para darle un nuevo lugar a tus universos favoritos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex flex-col gap-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-extrabold">Explora el catálogo</h2>
              <p className="mt-1 text-sm text-white/45">
                {loading ? "Cargando productos..." : `${filteredProducts.length} productos encontrados`}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#c4b5fd] transition-colors hover:text-white sm:self-auto"
              >
                <X size={16} />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#171222] p-4 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(140px,1fr))]">
            <label className="relative block sm:col-span-2 lg:col-span-1">
              <span className="sr-only">Buscar productos</span>
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPagination();
                }}
                placeholder="Buscar por nombre, colección o SKU..."
                className="w-full rounded-xl border border-white/10 bg-[#100d18] py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#a78bfa]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-white/45">Categoría</span>
              <select
                value={category}
                onChange={(event) => updateCategory(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#100d18] px-3 py-3 text-sm text-white outline-none focus:border-[#a78bfa]"
              >
                <option value="Todas">Todas las categorías</option>
                {categoryNames.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-white/45">Marca</span>
              <select
                value={brand}
                onChange={(event) => {
                  setBrand(event.target.value);
                  resetPagination();
                }}
                className="w-full rounded-xl border border-white/10 bg-[#100d18] px-3 py-3 text-sm text-white outline-none focus:border-[#a78bfa]"
              >
                <option value="Todas">Todas las marcas</option>
                {brands.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-white/45">Disponibilidad</span>
              <select
                value={availability}
                onChange={(event) => {
                  setAvailability(event.target.value as AvailabilityFilter);
                  resetPagination();
                }}
                className="w-full rounded-xl border border-white/10 bg-[#100d18] px-3 py-3 text-sm text-white outline-none focus:border-[#a78bfa]"
              >
                <option value="Todos">Cualquier estado</option>
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
              </select>
            </label>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-400/20 bg-[#171222] px-6 py-14 text-center">
            <h3 className="text-xl font-bold">No pudimos cargar la tienda</h3>
            <p className="mt-2 text-sm text-white/50">
              Estamos teniendo dificultades para conectar con nuestro catálogo.
            </p>
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-white/10 bg-[#171222] px-6 py-14 text-center">
            <p className="text-sm text-white/50">Cargando catálogo...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#a78bfa]/30 bg-[#171222]/70 px-6 py-14 text-center">
            <SlidersHorizontal size={28} className="mx-auto text-[#a78bfa]" />
            <h3 className="mt-4 text-xl font-bold">
              {category !== "Todas" ? `Aún no hay productos en ${category}` : products.length === 0 ? "Pronto tendremos productos disponibles" : "No encontramos productos"}
            </h3>
            <p className="mt-2 text-sm text-white/50">
              {category !== "Todas"
                ? "Estamos preparando esta colección. Explora otras categorías mientras tanto."
                : products.length === 0
                  ? "Estamos preparando el catálogo. Vuelve pronto para descubrir nuestras piezas."
                  : "Prueba con otros términos de búsqueda o modifica los filtros."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full bg-[#f6c945] px-5 py-2.5 text-sm font-bold text-[#211807] transition-colors hover:bg-[#ffda68]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 xl:gap-5 [@media(orientation:landscape)_and_(min-width:600px)]:grid-cols-4 [@media(orientation:portrait)_and_(min-width:600px)]:!grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="compact" />
              ))}
            </div>

            {hasMoreProducts && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-xs text-white/40">
                  Mostrando {visibleProducts.length} de {filteredProducts.length} productos
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setPagination({
                      filterKey,
                      count: visibleCount + PAGE_SIZE,
                    })
                  }
                  className="min-h-11 rounded-full border border-[#a78bfa]/40 bg-[#a78bfa]/10 px-7 py-3 text-sm font-bold text-[#ddd0ff] transition-colors hover:border-[#a78bfa] hover:bg-[#a78bfa]/20 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f6c945]"
                >
                  Ver más productos
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default Shop;
