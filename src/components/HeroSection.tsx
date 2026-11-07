export default function HeroSection() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white overflow-hidden select-none">
      {/* Center Hero Typography */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-black leading-[0.88] uppercase tracking-wider text-white">
            THE
          </h1>
          <h1 className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black leading-[0.88] uppercase tracking-wider text-white">
            FOREST
          </h1>
        </div>
      </main>
    </div>
  );
}
