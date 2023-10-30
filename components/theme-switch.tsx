"use client";

import React from "react";
import { BsLinkedin, BsMoon, BsSun } from "react-icons/bs";
import MouseEvent from "react";
import { motion } from "framer-motion";


export default function Link() {

  
   return (
    <motion.div
        className="linkedin"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
        }}
      >
    <a
          className="fixed bottom-5 right-5 bg-white w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border
          border-white border-opacity-40 shadow-2xl rounded-full 
          flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all dark:bg-gray-950"
          href="https://linkedin.com/in/mmarinhofs"
          target="_blank"
        >
          <BsLinkedin />
        </a>
        </motion.div>
    
  );
}