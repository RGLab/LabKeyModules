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
         'Flow Cytometry' AS Label
       FROM
          fcs_analyzed_result
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'mbaa' AS Name,
         'MBAA' AS Label
       FROM
          mbaa
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'kir_typing' AS Name,
         'KIR Typing' AS Label
       FROM
          kir_typing
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'elisa' AS Name,
         'ELISA' AS Label
       FROM
          elisa
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'elispot' AS Name,
         'ELISPOT' AS Label
       FROM
          elispot
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'hai' AS Name,
         'HAI' AS Label
       FROM
          hai
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'neut_ab_titer' AS Name,
         'NAB' AS Label
       FROM
         neut_ab_titer
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected || ' ' || study_time_collected_unit as Timepoint,
         COUNT( participantid ) AS n,
         'hla_typing' AS Name,
         'HLA typing' AS Label,
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
