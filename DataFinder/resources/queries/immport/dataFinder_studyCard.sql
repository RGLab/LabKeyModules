SELECT study.study_accession, brief_title, shared_study, restricted, research_focus, P.name as program_title, pi_names, assays, sample_type, container_id
FROM immport.dimStudy as study
RIGHT OUTER JOIN 
	(
		SELECT Label as study_name, Container as container_id 
		FROM study.StudyProperties
	) containers
	ON study.study_accession = containers.study_name