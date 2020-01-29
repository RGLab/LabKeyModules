SELECT * FROM (SELECT variable, category, 
  CASE 
    WHEN sortorder IS NULL THEN 
      CASE 
        WHEN category = 'Unknown' THEN 90
        WHEN category = 'Other' THEN 89
        ELSE 0
        END
    ELSE sortorder END 
  AS sortorder FROM (
      SELECT 'Timepoint' as variable, Timepoint as category, sortorder
      FROM (
	SELECT DISTINCT Timepoint, sortorder from immport.dimStudyTimepoint) _

      UNION ALL 

      SELECT 'Assay' as variable, Assay as category, NULL as sortorder
      FROM (SELECT DISTINCT Assay from immport.dimStudyAssay) _

      UNION ALL 

      SELECT 'SampleType' as variable, SampleType as category, NULL as sortorder
      FROM (
        SELECT DISTINCT type as SampleType from immport.dimSampleType) _

      UNION ALL 

      SELECT 'Species' as variable, species as category, NULL as sortorder
      FROM (
        SELECT DISTINCT species from immport.dimDemographic WHERE study IN (SELECT label as study_accession from study.Study )
        ) _

      UNION ALL 
      
      SELECT 'Gender' as variable, gender as category, NULL as sortorder
      FROM (
        SELECT DISTINCT gender from immport.dimDemographic WHERE study IN (SELECT label as study_accession from study.Study )
        ) _

      UNION ALL

      SELECT 'Race' as variable, race as category, NULL as sortorder
      FROM (
	SELECT DISTINCT race from immport.dimDemographic WHERE study IN (SELECT label as study_accession from study.Study )
      ) _

      UNION ALL
      
      SELECT 'Age' as variable, age as category, NULL as sortorder
      FROM (
	SELECT DISTINCT age from immport.dimDemographic
      ) _

      UNION ALL

      SELECT 'ExposureMaterial' as variable, exposure_material as category, NULL as sortorder
      FROM (
        SELECT DISTINCT exposure_material from immport.dimDemographic WHERE study IN (SELECT label as study_accession from study.Study )
      ) _

      UNION ALL

      SELECT 'ExposureProcess' as variable, exposure_process as category, NULL as sortorder
      FROM (
        SELECT DISTINCT exposure_process from immport.dimDemographic WHERE study IN (SELECT label as study_accession from study.Study )
      ) _

      UNION ALL

      SELECT 'Category' as variable, research_focus as category, NULL as sortorder
      FROM (
        SELECT DISTINCT research_focus from immport.study_categorization WHERE study_accession IN (SELECT label as study_accession from study.Study )
      ) _

      UNION ALL

      SELECT 'Condition' as variable, condition as category, NULL as sortorder
      FROM (
         SELECT DISTINCT condition from immport.dimStudyCondition WHERE study IN (SELECT label as study_accession from study.Study )
      ) _

      UNION ALL 

      SELECT 'Study' as variable, study as category, sortorder
      FROM (
        SELECT DISTINCT study, sortorder from immport.dimStudy WHERE study in (SELECT label as study_accession from study.Study )
      ) _
      
) _) _ ;