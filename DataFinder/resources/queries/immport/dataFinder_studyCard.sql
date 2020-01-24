SELECT study.study_accession, brief_title, shared_study, restricted, condition_studied, P.name as program_title, pi_names, assays, sample_type, container_id
FROM immport.study 
LEFT OUTER JOIN 
	(
		SELECT study_accession, MIN(contract_grant_id) as contract_grant_id 
		FROM immport.contract_grant_2_study 
		GROUP BY study_accession
	) CG2S
	ON study.study_accession = CG2S.study_accession
LEFT OUTER JOIN immport.contract_grant C ON CG2S.contract_grant_id = C.contract_grant_id
LEFT OUTER JOIN immport.program P on C.program_id = P.program_id
LEFT OUTER JOIN
    (
    	SELECT GROUP_CONCAT(DISTINCT(first_name || ' ' || last_name), ', ') AS pi_names, study_accession
    	FROM immport.study_personnel
    	WHERE role_in_study LIKE '%Principal%'
    	GROUP BY study_accession
    ) pi 
	ON study.study_accession = pi.study_accession
LEFT OUTER JOIN
	(
		SELECT GROUP_CONCAT(DISTINCT assay, ', ') as assays, study as study_accession
		FROM immport.dimstudyassay
		GROUP BY study
	) A
	ON study.study_accession = A.study_accession
LEFT OUTER JOIN
	(
		SELECT GROUP_CONCAT(DISTINCT sample_type, ', ') as sample_type, studyid as study_accession
		FROM 
			(
			SELECT ('SDY' || split_part(subjectid, '.', 2)) as studyid, type as sample_type
			FROM immport.dimsampletype
			) 
		GROUP BY studyid
	) st
	ON study.study_accession = st.study_accession
RIGHT OUTER JOIN 
	(
		SELECT Label as study_name, Container as container_id 
		FROM study.StudyProperties
	) containers
	ON study.study_accession = containers.study_name