import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import ProductImage from "./ProductImage";

interface MediaGalleryProps {
  name: string;
  images: string[];
  videos: string[];
}

type Media = { kind: "image" | "video"; src: string };

// Product photos and short videos in a strip you can swipe through with a
// finger (or the arrows and thumbnails). Only the video on screen plays.
// "#t=0.1" makes iPhones show a video's first frame instead of a grey box.
export default function MediaGallery({ name, images, videos }: MediaGalleryProps) {
  const media: Media[] = [
    ...images.map((src) => ({ kind: "image" as const, src })),
    ...videos.map((src) => ({ kind: "video" as const, src })),
  ];
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === active) video.play().catch(() => {});
      else video.pause();
    });
  }, [active]);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== active) setActive(index);
  };

  const goTo = (index: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(media.length - 1, index));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 hidden md:flex w-9 h-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition disabled:opacity-0";

  return (
    <div className="w-full">
      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex w-full h-64 md:h-80 rounded-xl overflow-x-auto overscroll-x-contain snap-x snap-mandatory bg-[#002a35] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {media.length === 0 && <ProductImage src={null} alt={name} className="w-full h-full shrink-0" />}
          {media.map((item, i) => (
            <div key={item.src} className="w-full h-full shrink-0 snap-center">
              {item.kind === "image" ? (
                <ProductImage src={item.src} alt={name} className="w-full h-full" />
              ) : (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={`${item.src}#t=0.1`}
                  controls
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full bg-black object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {media.length > 1 && (
          <>
            <span className="pointer-events-none absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {active + 1}/{media.length}
            </span>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Previous"
              className={`${arrowClass} left-3`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === media.length - 1}
              aria-label="Next"
              className={`${arrowClass} right-3`}
            >
              <ChevronRight size={20} />
            </button>
            <div className="pointer-events-none absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {media.map((item, i) => (
                <span
                  key={item.src}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-5 bg-[#00DA6B]" : "w-1.5 bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {media.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={item.kind === "video" ? `Play video ${i + 1}` : `Show photo ${i + 1}`}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                i === active ? "border-[#00DA6B]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {item.kind === "image" ? (
                <img src={item.src} alt="" loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <>
                  <video
                    src={`${item.src}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play size={18} className="fill-white text-white" />
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
