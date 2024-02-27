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

      I began my journey in the ever so small country of Luxembourg & moved to Portugal at the tender age of 17 to pursue my studies.
      Ever since, carved out a niche for myself in the world of data, balancing the dual roles of a  data engineer & scientist.  </p>

  <p>
  But there’s more to life than numbers. I’m also a boxing enthusiast. 
  Everyday, you’ll find me training hard, dreaming big about clinching that national title.
   It’s tough, hard work, but it's the kind of challenge pushes me and my body to the next level.

</p>

  <p>
  Chess is my go-to chill activity. It's kind of like the calm, strategic counterpoint to the adrenaline rush of boxing. 
  Plus, it's cool to think a few moves ahead, both on the board and in life.
  </p>

  <p>
  Growing up in the multi-cultural environment that is Luxembourg  ignited my curiosity for exploring other cultures and languages.
   It’s like collecting pieces of the world, learning something new from each one. 
   This love for diversity has made me pretty open-minded and really incited my passion for travelling.

    

</p>

  <p>
  So, that’s me in a nutshell. 
  If you’re into data, have a passion for cultures, enjoy a good sports story, or are just up for sharing life’s quirky lessons, drop me a line. 
  I’m always up for connecting and exchanging cool ideas.

</p>

    </motion.section>
  );
}
