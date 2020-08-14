import * as React from "react";

export const Tools = () => { 
    return(
        <div id="Tools">
            <h3>Online Bioinformatics Tools Created by HIPC Members:</h3>
            <a href="http://icahn.mssm.edu/immuneregulation" target="_blank">ImmuneRegulation</a>
            <p>
                Web platform that allows you to interactively explore the 
                regulation of genes of interest by querying the regulation 
                in the eQTL, Transcription Factor, and GQAS datasets. 
            </p>
            <a href="http://software.broadinstitute.org/gsea/msigdb/collection_details.jsp#C7" target="_blank">ImmuneSigDB</a> 
            <p>
                A collection of Immune Signatures gene sets that represent cell types, states, 
                and perturbations within the immune system developed by the Haining Lab.  
            </p>
            <a href="https://immcantation.readthedocs.io/en/stable/#" target="_blank">Immcantation</a>
            <p>
                The Immcantation framework provide a start-to-finish analytical ecosystem for 
                high-throughput AIRR-seq datasets. Beginning from raw reads, Python and R packages 
                are provided for pre-processing, population structure determination, and repertoire analysis.
            </p>
            <a href="http://insilico.utulsa.edu/index.php/reliefseq/" target="_blank">ReliefSeq</a>
            <p>
                Machine learning feature selection method for GWAS, RNA-Seq 
                and other high-dimensional data sets able to identify 
                genetic variables that influence continuous or dichotomous 
                outcomes through interactions with other genetic variables. 
            </p>
        </div>
    )
}