export default function LandingPage() {
  return (
    <div className="h-full">
      <div className="relative flex h-full w-full overflow-hidden">
        <div
          className="relative flex w-1/2 items-center justify-center"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(5, 10, 7, 0.68) 0%, rgba(5, 10, 7, 0.82) 100%), url("/Davidice_Image/Hero_BG_landing%20page/landing1.jfif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div
          className="relative flex w-1/2 items-center justify-center"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(5, 10, 7, 0.68) 0%, rgba(5, 10, 7, 0.82) 100%), url("/Davidice_Image/Hero_BG_landing%20page/landing2.jfif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="space-y-2 text-center sm:space-y-3">
            <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
              Every Draw
            </h2>
            <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
              Every Roll
            </h2>
            <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
              We Have It All
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
