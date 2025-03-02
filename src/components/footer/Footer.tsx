"use client";
import * as React from "react";
import FooterColumn from "./FooterColumn";
import SocialIcon from "./SocialIcon";
import Link from "next/link";
function NavigationFooter() {
  const socialIcons = [
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/199c9a3c64fa87237dabe74b1aff1fe617935141f37a07ba364b7012e90e628c?placeholderIfAbsent=true&apiKey=4d899c1d6c914f1faf09e222f1c91e7c",
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/b1bac3668b19309ab1c82835d154f9962b24bad9c262723d53374e3173c3e762?placeholderIfAbsent=true&apiKey=4d899c1d6c914f1faf09e222f1c91e7c",
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/c9c8d64becb556072cf4288b2dadd32d18a3ce8e19d5cc15f298f66d1125313b?placeholderIfAbsent=true&apiKey=4d899c1d6c914f1faf09e222f1c91e7c",
    },
    {
      src: "https://cdn.builder.io/api/v1/image/assets/TEMP/0828515f09127d365461d17e1036e88788811bd5c0258116139d171a870fbe56?placeholderIfAbsent=true&apiKey=4d899c1d6c914f1faf09e222f1c91e7c",
    },
  ];

  const resourceLinks = [
    { name: "Blog", href: "#" },
    { name: "Documentation", href: "#" },
    { name: "FAQ", href: "#" },
  ];

  const companyLinks = [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ];

  return (
    <footer className="overflow-hidden px-20 pb-12 bg-white max-md:px-5">
    <hr className="shrink-0 h-px border border-solid border-neutral-200 max-md:max-w-full" />

    <div className="flex flex-wrap justify-between gap-10 mt-12 w-full max-w-6xl mx-auto max-md:mt-10 max-md:max-w-full">
      <div className="self-start mt-10 flex flex-col gap-y-2">
        <Link href="https://thinkalignment.ai/">
          <h2 className="text-2xl text-black max-md:mr-2.5 text-center font-serif">Think Alignment</h2>
        </Link>

        <div className="flex gap-2 items-start mt-2 max-md:mt-10">
          {socialIcons.map((icon, index) => (
            <SocialIcon key={index} src={icon.src} />
          ))}
        </div>
      </div>

      <nav className="flex flex-auto justify-end max-md:max-w-full ml-auto">
        <div className="flex gap-5 max-md:flex-col">
          <div className="w-[33%] max-md:w-full">
            <FooterColumn title="Resources" links={resourceLinks} />
          </div>

          <div className="w-[33%] max-md:w-full">
            <FooterColumn title="Company" links={companyLinks} />
          </div>

          <div className="w-[33%] max-md:w-full">
            <FooterColumn title="Legal" links={legalLinks} />
          </div>
        </div>
      </nav>
    </div>
  </footer>
    
  );
}

export default NavigationFooter;
