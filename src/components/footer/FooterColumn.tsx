import React from "react";

interface LinkItem {
  name: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: LinkItem[];
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, links }) => {
  return (
    <div className="flex flex-col grow justify-center text-base font-medium text-zinc-700 max-md:mt-8">
      <h3 className="text-black font-serif text-lg mb-2">{title}</h3>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="mt-6 hover:text-black transition-colors text-sm font-serif"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
};

export default FooterColumn;
