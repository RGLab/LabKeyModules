SELECT DISTINCT subjectid, type as cell_type, timepoint, ('SDY' || split_part(subjectid, '.', 2)) as studyid, assay, timepoint_sortorder
FROM immport.dimSample
	LEFT OUTER JOIN immport.dimSampleAssay sa on dimSample.sampleid = sa.sampleid
