const Header = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />

      {/* Content */}
      <div className="w-full relative flex h-80 items-center justify-center px-6">
        <h1 className="text-xl font-bold tracking-wider text-white drop-shadow-lg sm:text-3xl md:text-[100px]">
          Bumpity Road
        </h1>
      </div>
    </div>
  );
};

export default Header;
