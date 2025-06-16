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
  
] as const;

export const experiencesData = [
  {
    title: "GenAI Engineer",
    location: "NOKIA",
    description:"Led end-to-end development of a production-grade GenAI/LLM Retrieval-Augmented Generation (RAG) application on Databricks, integrating Nokia SharePoint supply-chain documents and metadata to power a conversational AI assistant for self-service reporting.",
    icon: React.createElement(FaReact),
    date: "2024 Sep - Present",
  },
  {
    title: "Data Scientist/Engineer",
    location: "NOKIA",
    description:"In charge of creating & enhancing complex supply chain data objects that can be used by business to facilitate end-to-end reporting, transforming their business requests to data solutions. \nUtilizing PySpark for automation & data manipulations & ETL in Databricks environment.",
    
    icon: React.createElement(FaReact),
    date: "2023 Sep - 2024 Sep",
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
    date: "2022 Mar - 2023 Jun",
  },

  {
    title: "Data Science Trainee in Rotational Program",
    location: "NOKIA - Process Mining Team ",
    description:
      "Automating daily data extraction and API updates from Celonis API using Azure Function Apps. Automated extraction, processing, and ingestion of Celonis audit logs API data into data pools using Python. Developed star schema, associated tables (SQL), & dashboard.  Classification project using Celonis Machine Learning Workbench: Predict discount classification: Descriptive analysis using Matplotlib, coded using skicit-learn  ",
    icon: React.createElement(CgWorkAlt),
    date: "2022 Dec - 2023 Mar",
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
    title: "LLM RAG Application",
    description:
      "built GenAI LLM Retrieval-Augmented Generation (RAG) application on Databricks: integrated SharePoint documents powering a conversational AI assistant",
    tags: [
      "Pyspark",
      "Databricks",
      "LangGraph",
      "CI/CD",
      "MLflow",
      "DBX Vector Search",
      "DBX Model Serving",

    ],
    imageUrl: deia.src,
  },
{
    title: "Thesis on CNNs for Melanoma Classification",
    description:
      "Built a CNN pipeline on Azure for melanoma detection using transfer learning and advanced data augmentation, with real-time SMS prognostics via Twilio.",
    tags: [
      "Python",
      "TensorFlow",
      "Keras",
      "Azure ML",
      "CNN",
      "Twilio"
    ],
    imageUrl: thesImg.src,
    showButton: true, // Optional button
  },{
    title: "Databricks Server Comparator ",
    description:
      "Implemented a scalable Databricks-based comparator using PySpark and Spark SQL for PK-level, cross-table row validation—detecting mismatches in Delta Lake tables at scale.",
tags: [
      "Python",
      "PySpark",
      "Spark SQL",
      "Databricks",
      "ETL",
    ],    imageUrl: delta.src,

  },

];

export const skillsData = [
  "Python",
  "R",
  "SQL & Spark SQL",
  "PySpark",
  "Databricks",
  "Azure",
  "Azure Machine learning Studio",
  "CI/CD - Azure Devops",
"Delta Lake/Azure Data Lake Storage",
"ETL/ELT pipelines",
"Data modeling & warehousing",
"Databricks Medallion Architecture",
"Machine learning frameworks (TensorFlow, PyTorch, Keras, scikit-learn) ",
  "Deep Learning",
"Hugging Face Transformers",
"langchain",
"langgraph",
"LLMOps (vector search, model serving, MLflow)",

  ,

] as const;
