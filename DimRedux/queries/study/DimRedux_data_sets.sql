-- List the datasets available (is also properly filtered by the Data Finder)
SELECT
    dataset_n.Name,
    dataset_n.Label,
    dataset_n.Timepoint,
FROM
    (
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'fcs_analyzed_result' AS Name,
         'Flow cytometry analyzed results' AS Label
       FROM
          fcs_analyzed_result
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'mbaa' AS Name,
         'Multiplex bead array asssay' AS Label
       FROM
          mbaa
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'kir_typing' AS Name,
         'Killer cell immunoglobulin-like receptors (KIR) typing' AS Label
       FROM
          kir_typing
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'elisa' AS Name,
         'Enzyme-linked immunosorbent assay (ELISA)' AS Label
       FROM
          elisa
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'elispot' AS Name,
         'Enzyme-Linked ImmunoSpot (ELISPOT)' AS Label
       FROM
          elispot
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'hai' AS Name,
         'Hemagglutination inhibition (HAI)' AS Label
       FROM
          hai
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'neut_ab_titer' AS Name,
         'Neutralizing antibody titer' AS Label
       FROM
         neut_ab_titer
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'hla_typing' AS Name,
         'Human leukocyte antigen (HLA) typing' AS Label,
       FROM
          hla_typing
       GROUP BY 
          study_time_collected, study_time_collected_unit
       
       UNION

       SELECT
         coefficient as Timepoint,
         COUNT(analysis_accession) AS n,
         'gene_expression' as Name,
         'Gene Expression' as Label
       FROM
          gene_expression.gene_expression_analysis
       GROUP BY
          coefficient

    ) AS dataset_n
WHERE
    dataset_n.n > 0
