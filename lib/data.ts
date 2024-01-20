import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import thesImg from "@/public/thes.png";
import delta from "@/public/delta.png";
import rmtdevImg from "@/public/rmtdev.png";
import wordanalyticsImg from "@/public/wordanalytics.png";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [
  {
    title: "PC Assembly",
    location: "Lisbon, Portugal",
    description:
      "I built my own computer, why is this here? It was fun.",
    icon: React.createElement(LuGraduationCap),
    date: "2017",
  },
  {
    title: "Bsc in Economics",
    location: "Nova Lisbon SBE",
    description:
      "I graduated with an Economics bachelors",
    icon: React.createElement(LuGraduationCap),
    date: "2017-2021",
  },
  {
    title: "Master of Analytics Specialization in Data Science",
    location: "Católica Lisbon SBE",
    description:
      "I graduated with a data science applied to business masters, where I truly fell passionate to the arts of Data Science, more specifically Machine Learning",
    icon: React.createElement(LuGraduationCap),
    date: "2021-2023",
  },
  {
    title: "Data Science Trainee",
    location: "NOKIA",
    description:
      "Rotational program-- falar das 4 fasess",
    icon: React.createElement(CgWorkAlt),
    date: "2022 - 2023",
  },
  {
    title: "Data Engineer",
    location: "NOKIA",
    description:"In charge of creating & enhancing complex supply chain data objects that can be used by business to facilitate end-to-end reporting, transforming their business requests to data solutions",
    
    icon: React.createElement(FaReact),
    date: "2023 - present",
  },
] as const;

export const projectsData = [
  {
    title: "Thesis on Deep Learning for Melanoma Classification",
    description:
      "Deployed DL model on Azure for melanoma diagnosis, enabling real-time, SMS-based cancer prognosis",
    tags: ["Python", "Tensorflow", "Skicit-Learn",  "Azure", "twilio"],
    
    imageUrl: thesImg.src,
    showButton: true, // Optional button

  },{
    title: "Server Comparator ",
    description:
      "Scaled comparator to accurately pinpoint table mismatches across servers in DataBase migration project",
    tags: ["Python", "Pyodbc", "Datacompy",  "Azure", "Oracle"],
    imageUrl: delta.src,

  },
  
];

export const skillsData = [
  "Python",
  "Machine Learning Algorithms",
  "Deep Learning",
  "Scikit-Learn",
  "TensorFlow",
  "Keras",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "Seaborn",
  "Dask",
  "R",
  "SQL", 
  "Hadoop",
  "Spark",
  "Tableau",
  "SSMS",
  "Oracle",
  "Azure Devops",

] as const;
