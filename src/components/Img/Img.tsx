import { useEffect, useState } from "react";
import styles from "./Img.module.css";
import { StateUpdater } from "../../scripts/types";

type ImageProps = {
  src: string;
  alt: string;
  type?: string;
  onClick?: () => void;
};

type ImageDimensions = {
  width?: number;
  height?: number;
};

interface LoadImageProps {
  setImageDimensions: StateUpdater<ImageDimensions>;
  imageUrl: string;
}

const loadImage = ({ setImageDimensions, imageUrl }: LoadImageProps) => {
  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {
    setImageDimensions({
      height: img.height,
      width: img.width,
    });
  };
  img.onerror = (err: Event | string) => {
    console.log("img error");
    console.error(err);
  };
};

export default function Img({ src, alt, type, onClick }: ImageProps) {
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({});

  useEffect(() => {
    loadImage({ setImageDimensions, imageUrl: src });
  }, [src]);

  return (
    <img
      src={src}
      alt={alt}
      width={imageDimensions.width}
      height={imageDimensions.height}
      className={type ? styles[type] : ""}
      onClick={onClick}
    />
  );
}
