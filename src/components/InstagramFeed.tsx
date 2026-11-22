import { useEffect, useState } from "react";
import { Instagram, ExternalLink } from "lucide-react";

type InstagramPost = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
};

type InstagramFeedResponse = {
  success: boolean;
  data?: InstagramPost[];
  message?: string;
};

function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        const response = await fetch("/api/instagram/feed", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Instagram feed request failed");
        }

        const result = (await response.json()) as InstagramFeedResponse;

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(result.message ?? "Invalid Instagram feed response");
        }

        setPosts(result.data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setHasError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPosts();

    return () => controller.abort();
  }, []);

  return (
    <section
      id="instagram"
      aria-labelledby="instagram-heading"
      className="scroll-mt-20 border-y border-white/10 bg-white/[0.025]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#f6c945]">
              SÍGUENOS EN INSTAGRAM
            </p>
            <h2
              id="instagram-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              El universo Nerdybles
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/50">
              Descubre nuestras últimas publicaciones, novedades y momentos coleccionistas.
            </p>
          </div>

          <a
            href="https://www.instagram.com/nerdybles/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-[#a78bfa]/50 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6c945]"
          >
            <Instagram size={17} aria-hidden="true" />
            @nerdybles
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        {loading ? (
          <div
            aria-label="Cargando publicaciones de Instagram"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-2xl border border-white/10 bg-white/[0.06]"
              />
            ))}
          </div>
        ) : hasError ? (
          <div className="rounded-3xl border border-white/10 bg-[#171222] px-6 py-10 text-center">
            <p className="text-sm text-white/60">
              En este momento no podemos mostrar las publicaciones. Visita nuestro Instagram para ver las novedades.
            </p>
            <a
              href="https://www.instagram.com/nerdybles/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#c4b5fd] transition-colors hover:text-white"
            >
              Ver Instagram <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#a78bfa]/30 bg-[#171222]/70 px-6 py-10 text-center">
            <p className="text-sm text-white/60">
              Pronto compartiremos nuevas publicaciones.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
            {posts.map((post) => {
              const imageUrl =
                post.media_type === "VIDEO"
                  ? post.thumbnail_url ?? post.media_url
                  : post.media_url;

              return (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    post.caption
                      ? `Ver publicación de Instagram: ${post.caption.slice(0, 100)}`
                      : "Ver publicación de Nerdybles en Instagram"
                  }
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#211a30] transition-all duration-300 hover:-translate-y-1 hover:border-[#a78bfa]/50 hover:shadow-[0_12px_35px_rgba(109,40,217,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6c945]"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={post.caption?.slice(0, 120) || "Publicación de Nerdybles"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-xs text-white/50">
                      Publicación de Instagram
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="line-clamp-3 text-xs leading-5 text-white">
                      {post.caption || "Ver publicación"}
                    </span>
                  </div>

                  {post.media_type === "VIDEO" && (
                    <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white">
                      VIDEO
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default InstagramFeed;
