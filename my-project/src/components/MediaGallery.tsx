import { useState } from "react";
import { Play } from "lucide-react";
import ProductImage from "./ProductImage";

interface MediaGalleryProps {
  name: string;
  images: string[];
  videos: string[];
}

type Media = { kind: "image" | "video"; src: string };

// Product photos and short videos: one large view with thumbnails beneath.
export default function MediaGallery({ name, images, videos }: MediaGalleryProps) {
  const media: Media[] = [
    ...images.map((src) => ({ kind: "image" as const, src })),
    ...videos.map((src) => ({ kind: "video" as const, src })),
  ];
  const [active, setActive] = useState(0);
  const current = media[active];

  return (
    <div className="w-full">
      {current?.kind === "video" ? (
        <video
          key={current.src}
          src={current.src}
          controls
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-64 md:h-80 rounded-xl bg-black object-contain"
        />
      ) : (
        <ProductImage src={current?.src ?? null} alt={name} className="w-full h-64 md:h-80 rounded-xl" />
      )}

      {media.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {media.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={item.kind === "video" ? `Play video ${i + 1}` : `Show photo ${i + 1}`}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                i === active ? "border-[#00DA6B]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {item.kind === "image" ? (
                <img src={item.src} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <video src={item.src} muted playsInline preload="metadata" className="w-full h-full object-cover" />
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
