import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

// Loads only when scrolled near, and fades in once it has arrived.
export default function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-[#002a35] ${className}`}>
        <ImageOff className="text-gray-600" size={28} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`object-cover bg-[#002a35] transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
