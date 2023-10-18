"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-3">
      
  As a <span className="font-medium">data science professional</span> with an international background, I am fluent in <span className="font-medium">Portuguese, English, and French</span>, and currently enhancing my skills in German. My academic journey led me to complete a Master's degree in <span className="font-medium">Business Analytics</span> with a focus on Data Science at Católica SBE. During this time, I authored a thesis centered on using <span className="italic">Deep Learning algorithms for melanoma classification</span>. Prior to this, I earned a Bachelor's degree in Economics from Nova SBE. 
</p>

<p>
  Professionally, I am associated with <span className="font-medium">Nokia</span> in a data science role. My work encompasses a wide array of domains including <span className="font-medium">machine learning, big data technologies, and data engineering solutions</span>. My toolkit comprises expertise in <span className="font-medium">Python, R, SQL, and Tableau</span>, mainly on platforms like Azure and Celonis. 
</p>

<p>
  <span className="italic">Outside the realm of data</span>, I am an amateur boxer and have a keen interest in chess. These pursuits reflect my dedication to personal growth, mirroring my passion for analytics. I am always excited about the convergence of data with real-world applications and the endless learning it offers.
</p>


    </motion.section>
  );
}
