"use client";

import { CldImage } from "next-cloudinary";

function CloudImage({ images }: { images: { id: string; imageId: string }[] }) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image) => (
        <CldImage
          key={image.id}
          src={image.imageId}
          alt="Post Image"
          className="w-full h-auto rounded-lg"
          width="800"
          height="600"
        />
      ))}
    </div>
  );
}

export default CloudImage;
