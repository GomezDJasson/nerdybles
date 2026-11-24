import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "../types/product";

interface MobileProductCarouselProps {
  products: Product[];
  label: string;
}

function MobileProductCarousel({
  products,
  label,
}: MobileProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartScrollLeftRef = useRef<number | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

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

  const handleTrackScroll = () => {
    updateControls();


  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchStartScrollLeftRef.current = trackRef.current?.scrollLeft ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const startScrollLeft = touchStartScrollLeftRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;
    touchStartScrollLeftRef.current = null;

    const track = trackRef.current;
    if (!track || startX === null || startScrollLeft === null || endX === undefined) return;

    const deltaX = startX - endX;
    if (Math.abs(deltaX) < 30) return;

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const startedAtStart = startScrollLeft <= 1;
    const startedAtEnd = startScrollLeft >= maxScrollLeft - 1;

    if (deltaX > 0 && startedAtEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (deltaX < 0 && startedAtStart) {
      track.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
    }
  };

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstCard = track?.querySelector<HTMLElement>("[data-product-card]");
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
    <>
      <div
        ref={trackRef}
        onScroll={handleTrackScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label={label}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-product-card
            className="w-[calc((100%-1rem)/2)] shrink-0 snap-start [@media(orientation:portrait)_and_(min-width:600px)]:!w-[calc((100%-2rem)/3)] [@media(orientation:landscape)_and_(min-width:600px)]:w-[calc((100%-3rem)/4)] md:w-[calc((100%-3rem)/4)]"
          >
            <ProductCard product={product} variant="compact" />
          </div>
        ))}
      </div>

      {hasOverflow && (
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={`Ver ${label.toLowerCase()} anteriores`}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#171222] text-white transition-colors hover:border-[#a78bfa]/50 hover:bg-[#6f3abe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={`Ver más ${label.toLowerCase()}`}
            className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#171222] text-white transition-colors hover:border-[#a78bfa]/50 hover:bg-[#6f3abe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </>
  );
}

export default MobileProductCarousel;
