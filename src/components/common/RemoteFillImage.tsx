/**
 * Use for arbitrary external image URLs (e.g. admin-pasted menu images).
 * Avoids next/image hostname allowlist requirements.
 */
export default function RemoteFillImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  /** Maps to loading="eager" when true */
  priority?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
