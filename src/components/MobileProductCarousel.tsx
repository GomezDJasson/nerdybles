import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "../types/product";

interface MobileProductCarouselProps {
  products: Product[];
  label: string;
  gridClassName: string;
}

function MobileProductCarousel({
  products,
  label,
  gridClassName,
}: MobileProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setCanScrollPrev(track.scrollLeft > 1);
    setCanScrollNext(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 1
    );
    setHasOverflow(track.scrollWidth > track.clientWidth + 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [products.length, updateControls]);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstCard = track?.querySelector<HTMLElement>("[data-product-card]");
    if (!track || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (firstCard.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  return (
    <>
      <div
        ref={trackRef}
        onScroll={updateControls}
        role="region"
        aria-label={label}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth md:hidden [@media(orientation:landscape)_and_(min-width:600px)]:hidden [@media(orientation:portrait)_and_(min-width:600px)]:!hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-product-card
            className="w-[calc((100%-1rem)/2)] shrink-0 snap-start"
          >
            <ProductCard product={product} variant="compact" />
          </div>
        ))}
      </div>

      {hasOverflow && (
        <div className="mt-5 flex justify-center gap-3 md:hidden [@media(orientation:portrait)_and_(min-width:600px)]:hidden">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canScrollPrev}
            aria-label={`Ver ${label.toLowerCase()} anteriores`}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#171222] text-white transition-colors hover:border-[#a78bfa]/50 hover:bg-[#6f3abe] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canScrollNext}
            aria-label={`Ver más ${label.toLowerCase()}`}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#171222] text-white transition-colors hover:border-[#a78bfa]/50 hover:bg-[#6f3abe] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <div className={`hidden ${gridClassName} md:grid [@media(orientation:landscape)_and_(min-width:600px)]:grid [@media(orientation:portrait)_and_(min-width:600px)]:!grid [@media(orientation:portrait)_and_(min-width:600px)]:!grid-cols-3`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="compact" />
        ))}
      </div>
    </>
  );
}

export default MobileProductCarousel;
