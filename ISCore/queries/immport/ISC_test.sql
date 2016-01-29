PARAMETERS($STUDY VARCHAR DEFAULT NULL)
SELECT DISTINCT
ge_links.name AS file_info_name,
ge_links.file_link AS file_link,
ge_links.geo_link AS geo_link,
ge_links.expsample_accession,
biosample.biosample_accession,
biosample.subject_accession || '.' || SUBSTRING(biosample.study_accession,4) as participantid,
COALESCE(biosample.study_time_collected,9999.0000) as sequencenum,
biosample.biosampling_accession,
biosample.description,
biosample.name AS biosample_name,
biosample.type,
biosample.subtype,
biosample.study_time_collected,
biosample.study_time_collected_unit,
biosample.study_time_t0_event,
biosample.study_time_t0_event_specify,
biosample.study_accession,
arm_or_cohort.arm_accession,
arm_or_cohort.name AS arm_name
FROM (
  SELECT
  (CASE WHEN (gef_name IS NULL OR gef_name = '') THEN gel_name ELSE gef_name END) AS name,
  (CASE WHEN (gef_es IS NULL OR gef_es = '') THEN gel_es ELSE gef_es END) AS expsample_accession,
  file_link,
  geo_link
  FROM (
    -- Both in GEF and GEO
    SELECT
    AAgefiles.expsample_accession AS gef_es,
    AAgefiles.name AS gef_name,
    AAgefiles.file_link,
    AAgelinks.expsample_accession AS gel_es,
    AAgelinks.name AS gel_name,
    AAgelinks.geo_link,
    FROM AAgefiles INNER JOIN AAgelinks ON AAgefiles.name = AAgelinks.name
                                       AND AAgefiles.expsample_accession = AAgelinks.expsample_accession
    
    UNION ALL
    
    -- Only on GEF
    SELECT
    AAgefiles.expsample_accession AS gef_es,
    AAgefiles.name AS gef_name,
    AAgefiles.file_link,
    CAST( NULL AS VARCHAR(50)),
    CAST( NULL AS VARCHAR(50)),
    CAST( NULL AS VARCHAR(50))
    FROM
    AAgefiles
    WHERE NOT EXISTS ( SELECT * FROM AAgelinks WHERE AAgefiles.name = AAgelinks.name
                                                 AND AAgefiles.expsample_accession = AAgelinks.expsample_accession)
    
    UNION ALL
    
    -- Only on GEO
    SELECT
    CAST( NULL AS VARCHAR(50)),
    CAST( NULL AS VARCHAR(50)),
    CAST( NULL AS VARCHAR(50)),
    AAgelinks.expsample_accession AS gel_es,
    AAgelinks.name AS gel_name,
    AAgelinks.geo_link
    FROM
    AAgelinks
    WHERE NOT EXISTS ( SELECT * FROM AAgefiles WHERE AAgefiles.name = AAgelinks.name
                                                 AND AAgefiles.expsample_accession = AAgelinks.expsample_accession)
  ) AS ge_links
) AS ge_links,
biosample, biosample_2_expsample, arm_2_subject, arm_or_cohort
WHERE
biosample.biosample_accession = biosample_2_expsample.biosample_accession AND
biosample_2_expsample.expsample_accession = ge_links.expsample_accession AND
biosample.subject_accession = arm_2_subject.subject_accession AND
arm_2_subject.arm_accession = arm_or_cohort.arm_accession AND
biosample.study_accession = arm_or_cohort.study_accession
AND ($STUDY IS NULL OR $STUDY = biosample.study_accession)
