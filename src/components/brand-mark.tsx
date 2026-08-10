import Image from "next/image";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "size-12" }: BrandMarkProps) {
  return (
    <Image
      alt=""
      className={className}
      height={48}
      priority
      src="/logo.png"
      width={48}
    />
  );
}
