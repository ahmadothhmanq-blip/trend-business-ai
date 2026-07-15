export default function MarketingLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#050505]" aria-busy="true">
      <div className="size-8 animate-pulse rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37]" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
