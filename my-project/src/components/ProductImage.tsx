import { ImageOff } from "lucide-react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export default function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-[#002a35] ${className}`}>
        <ImageOff className="text-gray-600" size={28} />
      </div>
    );
  }

  return <img src={src} alt={alt} className={`object-cover ${className}`} />;
}
