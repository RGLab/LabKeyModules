-- Make a dataset tables with all files
PARAMETERS($STUDY VARCHAR DEFAULT NULL)
SELECT DISTINCT
file_info.name AS file_info_name,
file_info.purpose,
file_info.filesize_bytes AS filesize,
biosample_2_expsample.expsample_accession,
biosample.biosample_accession,
biosample.subject_accession || '.' || SUBSTRING(biosample.study_accession,4) AS participantid,
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
FROM
biosample,
file_info,
biosample_2_expsample,
expsample_2_file_info,
arm_2_subject,
arm_or_cohort
WHERE
expsample_2_file_info.file_info_id = file_info.file_info_id AND
biosample_2_expsample.expsample_accession = expsample_2_file_info.expsample_accession AND
biosample.biosample_accession = biosample_2_expsample.biosample_accession AND
arm_2_subject.arm_accession = arm_or_cohort.arm_accession AND
biosample.study_accession = arm_or_cohort.study_accession AND
file_info.purpose IN ('Other', 'Clinical data', 'Archived', '')
AND ($STUDY IS NULL OR $STUDY = biosample.study_accession)
