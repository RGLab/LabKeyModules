SELECT
GEM.ParticipantId,
GEM.study_time_collected,
GEM.study_time_collected_unit,
GEM.cohort,
GEM.cohort_type,
GEM.biosample_accession,
immex.exposure_material_reported,
immex.exposure_process_preferred
FROM
(
    SELECT
        *
    FROM
        study.HM_InputSamplesQuery
) AS GEM
LEFT JOIN immport.immune_exposure AS immex
ON immex.subject_accession = SPLIT_PART(GEM.ParticipantId, '.', 1)
