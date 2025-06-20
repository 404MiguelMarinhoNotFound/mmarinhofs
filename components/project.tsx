"use client";

import { useRef } from "react";
import { projectsData } from "@/lib/data";
import Image from "next/image";
import { HiDownload } from "react-icons/hi";
import { motion, useScroll, useTransform } from "framer-motion";

interface ProjectProps {
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  showButton?: boolean; // Optional button
}

export default function Project({
  title,
  description,
  tags,
  imageUrl,
  showButton = false,

}: ProjectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const scaleProgess = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgess = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  return (
    <motion.div
      ref={ref}
      style={{
        scale: scaleProgess,
        opacity: opacityProgess,
      }}
      className="group mb-3 sm:mb-8 last:mb-0"
    >
      <section className="bg-gray-100 max-w-[42rem] border border-black/5 rounded-lg overflow-hidden sm:pr-8 relative sm:h-[20rem]
       hover:bg-gray-200 transition sm:group-even:pl-8 dark:text-white dark:bg-white/10 dark:hover:bg-white/20">
        <div className="pt-4 pb-7 px-5 sm:pl-10 sm:pr-2 sm:pt-10 sm:max-w-[60%] flex flex-col h-full sm:group-even:ml-[18rem] justify-center items-center">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
            {description}
          </p>
          
          <ul className="flex flex-wrap mt-4 gap-2 sm:mt-auto">
            {tags.map((tag, index) => (
              <li
                className="bg-black/[0.7] px-3 py-1 text-[0.7rem] uppercase tracking-wider text-white rounded-full dark:text-white/70"
                key={index}
              >
                {tag}
                
              </li>
            ))}
          </ul>
          

          
        </div>
        
        <Image
          src={imageUrl}
          alt="Project I worked on"
          quality={95}
          width={500} // specify the width
          height={500} // specify the height
          className="absolute hidden sm:block top-8 -right-40 w-[28.25rem] rounded-t-lg shadow-2xl
        transition 
        group-hover:scale-[1.04]
        group-hover:-translate-x-3
        group-hover:translate-y-3
        group-hover:-rotate-2

        group-even:group-hover:translate-x-3
        group-even:group-hover:translate-y-3
        group-even:group-hover:rotate-2

        group-even:right-[initial] group-even:-left-40"
        />


      </section>
      
<div className="button-wrapper mt-4 flex justify-end">
          {showButton && (
            <a
              className="bg-white p-4 rounded-full flex items-center justify-center w-14 h-14 focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl border border-gray-200 dark:bg-white/10 dark:text-white/60 dark:border-white/20 dark:hover:bg-white/20"
              href="/Thesis.pdf"
              download
              aria-label="Download thesis PDF"
            >
              <HiDownload className="opacity-70 hover:opacity-100 text-lg transition-all duration-200" />
            </a>
          )}{" "}
          {/* Conditional Button */}
        </div>
      </motion.div>

        );
}
