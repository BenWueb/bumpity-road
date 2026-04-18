const HEADER_IMAGE = "/cabin.webp";

const HeaderComponent = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage: `url('${HEADER_IMAGE}')`,
          backgroundPosition: "center 30%",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/60 to-black/40" />

      {/* Content */}
      <div className="relative flex flex-col h-48 items-center justify-center px-4 sm:h-56 sm:px-6 md:h-64 lg:h-80">
        <h1 className="text-center text-4xl font-bold tracking-wider text-white drop-shadow-lg  md:text-5xl lg:text-7xl xl:text-[100px]">
          Bumpity Road
        </h1>
        <h2 className="mt-12 text-white text-center text-sm font-bold tracking-wider text-sla drop-shadow-lg  md:text-lg lg:text-2xl ">
          A place for all things Cabin
        </h2>
      </div>
    </div>
  );
};

export default HeaderComponent;
