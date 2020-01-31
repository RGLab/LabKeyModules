SELECT study_accession,
    CASE
        WHEN (
            condition_studied like '%healthy%' OR
            condition_studied like '%normal%' OR
            condition_studied like '%naive%'
        ) THEN 'Healthy'

        WHEN (
            condition_studied like '%influenza%' OR
            condition_studied like '%h1n1'
        ) THEN 'Influenza'

        WHEN condition_studied like '%cmv%' THEN 'CMV'

        WHEN condition_studied like '%tuberculosis%' THEN 'Tuberculosis'

        WHEN condition_studied like '%yellow fever%' THEN 'Yellow Fever'

        WHEN condition_studied like '%mening%' THEN 'Meningitis'

        WHEN condition_studied like '%malaria%' THEN 'Malaria'

        WHEN condition_studied like '%hiv%' THEN 'HIV'

        WHEN condition_studied like '%dengue%' THEN 'Dengue'

        WHEN condition_studied like '%zebov%' THEN 'Ebola'

        WHEN condition_studied like '%hepatitis%' THEN 'Hepatitis'

        WHEN (
            condition_studied like '%smallpox%' OR
            condition_studied like '%vaccinia%'
        ) THEN 'Smallpox'

        WHEN (
            condition_studied like '%jdm%' OR
            condition_studied like '%dermatomyositis%'
         ) THEN 'Dermatomyositis'

        WHEN condition_studied like '%west nile%' THEN 'West Nile'

        WHEN condition_studied like '%zika%' THEN 'Zika'

        WHEN condition_studied like '%varicella%' THEN 'Varicella Zoster'

        ELSE 'Unknown'
    
    END AS condition_studied 
FROM (SELECT study_accession, lower(condition_studied) condition_studied FROM immport.study) study;