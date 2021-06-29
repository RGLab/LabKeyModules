SELECT dimStudy.study as study_accession, brief_title, shared_study, restricted, research_focus, program as program_title, pi_names, assays, sample_types as sample_type, container_id, start_date
FROM immport.dimStudy
RIGHT OUTER JOIN 
	(
		SELECT Label as study_name, Container as container_id, StartDate as start_date
		FROM study.StudyProperties
	) containers
	ON dimStudy.study = containers.study_name;