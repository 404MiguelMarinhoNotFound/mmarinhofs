import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import thesImg from "@/public/thes.png";
import deia from "@/public/deia.png";
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
    title: "Data Scientist/Engineer",
    location: "NOKIA",
    description:"In charge of creating & enhancing complex supply chain data objects that can be used by business to facilitate end-to-end reporting, transforming their business requests to data solutions",
    
    icon: React.createElement(FaReact),
    date: "2023 Sep - Present",
  },
  {
    title: "Data Science Trainee in Rotational Program",
    location: "NOKIA - Financial Planning and Reporting Analytics",
    description:
      "Lead in optimizing SAP report generation by recreating complex reports using advanced SQL queries on a centralized data platform with ingested SAP tables, significantly reducing processing time. Python scripts for automated validation of reports. ",
    icon: React.createElement(CgWorkAlt),
    date: "2022 Jun - 2023 Sep",
  },
  {
    title: "Data Science Trainee in Rotational Program",
    location: "NOKIA - Data Semantics Team",
    description:
      "Contributed on data migration tasks from on-premises server to Azure cloud by doing User Acceptance Testing (UAT) with SQL. Lead in developing a Python-based Excel File Comparator program, ensuring data consistency between on-premise servers and Azure cloud by precisely locating and reporting any discrepancies. ",
    icon: React.createElement(CgWorkAlt),
    date: "2022 Mar - 2023 May",
  },

  {
    title: "Data Science Trainee in Rotational Program",
    location: "NOKIA - Process Mining Team ",
    description:
      "Automating daily data extraction and API updates from Celonis API using Azure Function Apps. Automated extraction, processing, and ingestion of Celonis audit logs API data into data pools using Python. Developed star schema, associated tables (SQL), & dashboard.  Classification project using Celonis Machine Learning Workbench: Predict discount classification: Descriptive analysis using Matplotlib, coded using skicit-learn  ",
    icon: React.createElement(CgWorkAlt),
    date: "2022 Dec - 2023 Feb",
  },
  {
    title: "Data Science Trainee in Rotational Program",
    location: "NOKIA - Supply Chain Advanced Analytics Team  ",
    description:
"   Involved in classification project using Azure Cloud Machine Learning Studio to accurately predict on-time delivery of supply chain products. Migrated data pipelines from on-premises databases to Azure SQL Database, leveraging Azure Data Factory."
    ,icon: React.createElement(CgWorkAlt),
    date: "2022 Sep - 2022 Dec",
  },
  {
    title: "Master of Analytics Specialization in Data Science",
    location: "Católica Lisbon SBE",
    description:
      "I graduated with a data science applied to business masters, where I truly fell passionate to the arts of Data Science",
    icon: React.createElement(LuGraduationCap),
    date: "2021-2023",
  },
  {
    title: "Bachelors in Economics",
    location: "Nova Lisbon SBE",
    description:
      "I graduated with an Economics bachelors",
    icon: React.createElement(LuGraduationCap),
    date: "2017-2021",
  },
  {
    title: "PC Assembly",
    location: "Lisbon, Portugal",
    description:
      "I built my own computer from scratch for fun!",
    icon: React.createElement(LuGraduationCap),
    date: "2017",
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
  {
    title: "DEIA",
    description:
      "Fine-Tuned LLM on custom database containing metadata of data objects, designed to enhance comprehension of data object complexity",
    tags: ["Python", "Transformers", "huggingface",  "Databricks", "MLFlow"],
    imageUrl: deia.src,

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
