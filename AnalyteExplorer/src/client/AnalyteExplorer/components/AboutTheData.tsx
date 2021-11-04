import React from "react";

export const AboutTheData: React.FC = () => {
  return (
    <p>
      Analyte Explorer currently supports gene expression data for blood transcription 
      modules (BTMs) published by <a href="https://www.nature.com/articles/ni.2789"> 
      Li et al. </a> and genes. Gene metadata is pulled from <a href="https://mygene.info/"> 
      mygene.info</a>. For details about our data processing methods, visit our 
      <a href="/project/home/begin.view?tab=GeneExpression"> Data Processing page </a> and
      <a href="https://github.com/RGLab/AnalyteExplorer"> GitHub repository</a>.
    </p>
  )
}