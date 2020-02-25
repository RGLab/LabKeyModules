SELECT
GEM.Run,
GEM.ParticipantId,
GEM.study_time_collected,
GEM.study_time_collected_unit,
GEM.cohort,
GEM.cohort_type,
GEM.biosample_accession,
GROUP_CONCAT(DISTINCT immex.exposure_material_reported, ';') AS exposure_material_reported,
GROUP_CONCAT(DISTINCT immex.exposure_process_preferred, ';') AS exposure_process_preferred,
FROM 
(
    SELECT
        *
    FROM
        study.HM_InputSamplesQuery
) AS GEM
LEFT JOIN immport.immune_exposure AS immex
ON immex.subject_accession = SPLIT_PART(GEM.ParticipantId, '.', 1)
GROUP BY ParticipantId, Run, study_time_collected, study_time_collected_unit, cohort, cohort_type, biosample_accession
