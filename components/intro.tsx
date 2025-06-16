"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import { TypeAnimation } from "react-type-animation";


export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  return (
    <section
      ref={ref}
      id="home"
      className="mb-28 max-w-[50rem] text-center sm:mb-0 scroll-mt-[100rem]"
    >
      
      <div className="flex items-center justify-center">
        <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="col-span-4 place-self-right mt-4 lg:mt-0"
        >
          
            <Image
              src="/eu.png"
              alt="eu"
              width={300}
              height={300}
              quality="95"
              priority={true}
              className="
               rounded-full object-cover border-4  
              border-transparent shadow-2xl hover:shadow-3xl transition-shadow 
              duration-300 ease-in-out bg-gradient-to-r from-lightblue-400 via-purple-400 to-teal-400 hover:scale-105 transform"
              />
          </motion.div>

          <motion.span
            className="absolute bottom-0 center-0 text-2xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 125,
              delay: 0.1,
              duration: 0.7,
            }}
          >
            
          </motion.span>
        </div>
      </div>


      
      {/*     
      <motion.h1
        className="mb-10 mt-4 px-4 text-2xl font-medium !leading-[1.5] sm:text-2xl "
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-600">
              Hello there, I&apos;m{" "}
            </span>
        Data scientist by day, boxing chessmaster by night. Passionate about making every single second count by exploring the world's hidden gems.
      </motion.h1>
      */}
<div className="flex justify-center items-center h-full">
<h1 className="text-gray-150 mb-100 mt-5 text-2xl sm:text-3xl lg:text-3xl lg:leading-normal font-extrabold self-center">
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 animate-pulse opacity-90">
      Hello, I&apos;m{" "}
    </span>
  </h1>
  </div>
              <div className="flex justify-center items-center h-full">
              <br></br>
  <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="col-span-12 place-self-center text-center sm:text-center justify-self-start"
          >
            <h1 className="text-gray-150 mb-2 text-3xl sm:text-3xl lg:text-3xl lg:leading-normal font-extrabold">
            
              
              
              <TypeAnimation
                sequence={[
                  "Miguel👋 ",
                  2400,
                  "a Data Scientist📊",
                  1000,
                  "a Machine learning expert🧠🤖",
                  1000,
                 
                  "a GenAI Engineer🔧",
                  1000,
                  "Ready for any challenge💪",
                  10000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
              
            </h1>

          </motion.div>
          
      </div>
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 text-lg font-medium"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
        }}
      >
        
<br></br>
        <a
          className="group bg-white px-5 py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10"
          href="/CV.pdf"
          download
        >
          CV{" "}
          <HiDownload className="opacity-60 group-hover:translate-y-1 transition" />
        </a>

        <a
          className="bg-white p-4 text-gray-700 hover:text-gray-950 flex items-center gap-2 rounded-full focus:scale-[1.15] hover:scale-[1.15] active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10 dark:text-white/60"
          href="https://linkedin.com/in/mmarinhofs"
          target="_blank"
        >
          <BsLinkedin />
        </a>

        <a
          className="bg-white p-4 text-gray-700 flex items-center gap-2 text-[1.35rem] rounded-full focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10 dark:text-white/60"
          href="https://github.com/404MiguelMarinhoNotFound"
          target="_blank"
        >
          <FaGithubSquare />
        </a>
      </motion.div>
    </section>
  );
}
