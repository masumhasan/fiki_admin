import { BrandMark } from "@/components/brand-mark";

export function AuthBrand() {
  return (
    <div className="flex flex-col items-center">
      <span className="mb-3 grid size-14 place-items-center rounded-2xl bg-white shadow-[0_6px_22px_rgba(8,37,82,0.08)]">
        <BrandMark className="size-11" />
      </span>
      <div className="text-[22px] font-extrabold leading-none tracking-[-0.04em] text-brand-navy">
        FIKI <span className="text-brand-yellow">TRANSIT</span>
      </div>
      <p className="mt-1.5 text-[10px] font-medium tracking-[0.04em] text-brand-muted">
        Admin Portal
      </p>
    </div>
  );
}
