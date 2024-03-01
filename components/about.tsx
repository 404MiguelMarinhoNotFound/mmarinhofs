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

      I began my journey in the ever so small country of Luxembourg & moved to Portugal at the age of 17 to pursue my studies.
      Ever since, carved out a niche for myself in the world of data, balancing the dual roles of a  data engineer & scientist.  </p>

  <p> 
I've always been a guy of odd interests. When I was younger I was really passionate about martial arts and computers.
This inherently led me to building my own computer and joining my first boxing gym. 
</p>
  <p>
Fast forward some years and I box on an amateur level with aspirations of becoming national champion in 2024, and also ... play chess.
Chess is my go-to chill activity. It's kind of like the calm, strategic counterpoint to the adrenaline rush of boxing. Some people find it odd, I find it complementary.
</p>
  <p>
Something that also defines me is my passion for meeting new & different people. 
Probably because I was born in Luxembourg and always surrounded by different cultures and languages. 
Regardless, this type of passion has made me pretty open-minded and really incited my passion for travelling.




</p>

  <p>
  Reach out!

</p>

    </motion.section>
  );
}
