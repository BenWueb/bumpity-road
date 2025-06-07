"use client";

import { CldImage } from "next-cloudinary";

function CloudImage({
  images,
  single,
}: {
  images: { id: string; imageId: string }[];
  single: boolean;
}) {
  return single ? (
    <>
      <CldImage
        key={images[0].id}
        src={images[0].imageId}
        alt="Post Image"
        className=" max-h-[200px]  object-cover rounded-lg"
        width="800"
        height="600"
      />
    </>
  ) : (
    <>
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
    </>
  );
}

export default CloudImage;
