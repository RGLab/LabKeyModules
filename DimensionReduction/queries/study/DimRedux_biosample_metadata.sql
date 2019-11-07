SELECT 
  ParticipantId, 
  biosample_accession, 
  featureset,
  featureset.vendor as fas_vendor,
  featureset.name as fas_name,
  biosample_accession.subtype,
  cohort_type
FROM HM_InputSamplesQuery;
