import { prisma } from "@/utils/prisma";

const DEFAULT_HEADER_IMAGE =
  "https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

async function getHeaderImage(): Promise<string> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "headerImageUrl" },
    });
    return setting?.value || DEFAULT_HEADER_IMAGE;
  } catch {
    return DEFAULT_HEADER_IMAGE;
  }
}

const Header = async () => {
  const headerImageUrl = await getHeaderImage();

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${headerImageUrl}')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />

      {/* Content */}
      <div className="relative flex h-32 items-center justify-center px-4 sm:h-40 sm:px-6 md:h-56 lg:h-80">
        <h1 className="text-center text-2xl font-bold tracking-wider text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-7xl xl:text-[100px]">
          Bumpity Road
        </h1>
      </div>
    </div>
  );
};

export default Header;
