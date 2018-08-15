-- List the datasets available (is also properly filtered by the Data Finder)
SELECT
    dataset_n.Name,
    dataset_n.Label,
    CAST(dataset_n.study_time_collected AS INTEGER) AS study_time_collected,
    dataset_n.study_time_collected_unit,
    dataset_n.study_time_collected || ' ' || dataset_n.study_time_collected_unit AS timepoint
FROM
    (
       SELECT
         study_time_collected,
         study_time_collected_unit,
         COUNT( participantid ) AS n,
         'fcs_analyzed_result' AS Name,
         'Flow Cytometry' AS Label
       FROM
          fcs_analyzed_result
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected,
         study_time_collected_unit,
         COUNT( participantid ) AS n,
         'mbaa' AS Name,
         'MBAA' AS Label
       FROM
          mbaa
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected,
         study_time_collected_unit,
         COUNT( participantid ) AS n,
         'elisa' AS Name,
         'ELISA' AS Label
       FROM
          elisa
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected,
         study_time_collected_unit,
         COUNT( participantid ) AS n,
         'elispot' AS Name,
         'ELISPOT' AS Label
       FROM
          elispot
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected,
         study_time_collected_unit,
         COUNT( participantid ) AS n,
         'hai' AS Name,
         'HAI' AS Label
       FROM
          hai
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION
       
       SELECT
         study_time_collected,
         study_time_collected_unit,
         COUNT( participantid ) AS n,
         'neut_ab_titer' AS Name,
         'NAB' AS Label
       FROM
         neut_ab_titer
       GROUP BY 
          study_time_collected, study_time_collected_unit

       UNION

       SELECT
         study_time_collected,
         study_time_collected_unit,
         COUNT( participantid ) AS n,
         'pcr' AS Name,
         'PCR' AS Label
       FROM
         pcr
       GROUP BY  
          study_time_collected, study_time_collected_unit

       UNION


       SELECT
         CAST(SPLIT_PART(coefficient, ' ', 1) AS DOUBLE) AS study_time_collected,
         SPLIT_PART(coefficient, ' ', 2) AS study_time_collected_unit,
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
ORDER BY
    dataset_n.study_time_collected_unit DESC, dataset_n.study_time_collected ASC
