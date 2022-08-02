import * as React from "react";

export const DataStandards: React.FC = () => {
  return (
    <div id="DataStandards-content">
      <section className="DataStandards-standards">
        <div>
          <h2>HIPC DataStandards</h2>
        </div>
        <p>
          The HIPC data standards working group defines the metadata, assay
          results and controlled vocabularies used by HIPC centers to submit
          experimental results to NIAID/ImmPort. Most of the standards we
          develop are incorporated into the ImmPort data deposition templates.
          All HIPC centers submit data directly to ImmPort using the templates
          available on the{" "}
          <a href="http://www.immport.org/immport-open/public/home/dataTemplates">
            ImmPort Website
          </a>
          .
        </p>
        <p>HIPC specifies content for some experiment types. This includes:</p>
        <ul>
          <li>
            <strong>
              Transcriptional Profiling Experiments (e.g. microarray and
              RNA-seq)
            </strong>
            <br></br>In addition to the experimental metadata submission to
            ImmPort, HIPC requires submission of the underlying data to NCBI.
            For details, please see{" "}
            <a href="http://www.immport.org/images/home/HIPC.Transcriptional_Profiling_Data_Standards.txt">
              HIPC Standards Working Group Transcription Profiling standards
            </a>
            .
          </li>
          <li>
            <strong>Cell Cytometry Experiments</strong>
            <br></br>
            HIPC defines the standard for specifying cell population definitions
            and names. For details, please see{" "}
            <a href="https://www.immport.org/docs/standards/Cytometry_Data_Standard.pdf">
              HIPC Standards Working Group Cell Population Specification
            </a>
            . In addition to raw data in .fcs files, HIPC requires the
            submission of derived data (e.g., the cell population frequencies).
            For CyTOF and flow cytometry, these are submitted using the
            associated derived data templates available on the{" "}
            <a href="http://www.immport.org/immport-open/public/home/dataTemplates">
              ImmPort Website
            </a>
            .
          </li>
          <li>
            <strong>
              Multiplex Bead Array Assays (MBAA) Experiments (e.g. Luminex)
            </strong>
            <br></br>
            In addition to results from the assayed biological samples
            (experimental samples), HIPC requires submission of the results from
            the control samples and their standard curves. These are submitted
            using the control sample and standard curve templates available on
            the{" "}
            <a href="http://www.immport.org/immport-open/public/home/dataTemplates">
              ImmPort Website
            </a>
            .
          </li>
          <li>
            <strong>Hemagglutination Inhibition Assay (HAI) experiments</strong>
            <br></br>
            The virus strain names are validated using NCBI Taxon with links to
            Taxon IDs. HAI data are submitted using HAI results templates
            available on the{" "}
            <a href="http://www.immport.org/immport-open/public/home/dataTemplates">
              ImmPort Website
            </a>
            .
          </li>
          <li>
            <strong>Immune Exposure</strong>
            <br></br>
            HIPC specifies a structured format (immune exposure model) to
            characterize human immune responses/mechanisms elicited by
            vaccinations, adjuvants or natural infection. In addition, an immune
            exposure validator has been developed. The immune exposure metadata
            are entered using the human subject template available on the{" "}
            <a href="http://www.immport.org/immport-open/public/home/dataTemplates">
              ImmPort Website
            </a>
            .
          </li>
          <li>
            <strong>Human Subject</strong>
            <br></br>
            As part of the entry of the human subject’s demographic information,
            HIPC uses the Gazetteer ontology to standardize the country location
            with a link to the Gazetteer ID. For the United States, the location
            field also includes the name of the state. Location information is
            entered using the human subject template available on the{" "}
            <a href="http://www.immport.org/immport-open/public/home/dataTemplates">
              ImmPort Website
            </a>
            .
          </li>
          <li>
            <strong>
              Mass Spectrometry-based Metabolomics, Proteomics and Lipidomics
            </strong>
            <br></br>
            This HIPC data standard applies to mass spectrometry-based
            proteomics, metabolomics and lipidomics experimental data. For more
            information, consult{" "}
            <a href="https://docs.google.com/document/d/1Skov6t27I92PIAnU68pCPhX-Atr9Lin4VcCijqsv5Cw/edit?usp=sharing">
              this document
            </a>
            .
          </li>
          <li>
            <strong>Single cell RNA-seq</strong>
            <br></br>
            This HIPC data standard applies to single cell transcriptional
            profiling data (including possible feature barcoding). It includes
            the submission of metadata to ImmPort with raw and processed data
            submitted to GEO and SRA. For more information, consult{" "}
            <a href="https://docs.google.com/document/d/1ra1E2lg1YLAOF4Ny1aPMnJtr27POb_HmxvzlILR65jg/edit?usp=sharing">
              this document
            </a>
            .
          </li>
        </ul>
      </section>

      <section className="DataStandards-publications">
        <div>
          <h2>Publications</h2>
        </div>
        <p>
          The following paper describes how to report and connect cell type
          names and gating definitions through ontologies including the Cell
          Ontology and Protein Ontology:
        </p>
        <ul>
          <li>
            <p>
              <a href="https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-019-2725-5">
                James A. Overton JA, Vita R, Dunn P, Burel JG, Bukhari SAC,
                Cheung KH, Kleinstein SH, Diehl AD, Peters B. (2019) Reporting
                and connecting cell type names and gating definitions through
                ontologies. BMC Bioinformatics 20: 182
              </a>
              .
            </p>
          </li>
        </ul>
        <p>
          The following papers describe the development and use of a
          structured/ontological model to represent and validate human immune
          exposures elicited by vaccinations, adjuvants or natural infection:
        </p>
        <ul>
          <li>
            <p>
              <a href="https://academic.oup.com/database/article/doi/10.1093/database/baaa016/5818925">
                Vita R, Overton JA, Dunn P, Cheung KH, Kleinstein SH, Sette A,
                Bjoern Peters B. (2019) A structured model for immune exposures.
                Database 2020:baaa016
              </a>
              .
            </p>
          </li>
          <li>
            <p>
              <a href="http://ceur-ws.org/Vol-2285/ICBO_2018_paper_41.pdf">
                Vita R, Overton JA, Cheung KH, Kleinstein SH, Peter B.
                Proceedings of the 9th International Conference on Biological
                Ontology (ICBO 2018), Corvallis, Oregon, USA
              </a>
              .
            </p>
          </li>
          <li>
            <p>
              <a href="https://www.jimmunol.org/content/202/1_Supplement/130.26">
                Vita RJ, Overton JA, Cheung KH, Dunn P, Burel J, Bukhari SAC,
                Diehl AD, Kleinstein SH, Sette A, Peters B. (2019) Formal
                representation of immunology related data with ontologies. J
                Immunol May 1, 2019, 202 (1 Supplement) 130.26
              </a>
              .
            </p>
          </li>
        </ul>
      </section>

      <section className="DataStandards-footer">
        <p>
          <strong>Questions?</strong>
        </p>
        <p>
          For questions about ImmPort data depositions, email:{" "}
          <a href="mailto:bisc_helpdesk@niaid.nih.gov">
            bisc_helpdesk@niaid.nih.gov
          </a>
        </p>
        <p>
          For questions about HIPC data standards, email:{" "}
          <a href="mailto:hipc-standards@googlegroups.com">
            hipc-standards@googlegroups.com
          </a>
        </p>
        <p>
          More information about HIPC can be found at{" "}
          <a href="https://www.immuneprofiling.org/hipc/page/show">
            immuneprofiling.org
          </a>
        </p>
      </section>
    </div>
  );
};
