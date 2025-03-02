import React from "react";

interface SocialIconProps {
  src: string;
  alt?: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({
  src,
  alt = "Social media icon",
}) => {
  return (
    <a href="#" className="inline-block">
      <img
        src={src}
        alt={alt}
        className="object-contain shrink-0 w-10 rounded aspect-square hover:opacity-80 transition-opacity"
      />
    </a>
  );
};

export default SocialIcon;
