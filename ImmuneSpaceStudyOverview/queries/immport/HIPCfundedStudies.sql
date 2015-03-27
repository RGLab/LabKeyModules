SELECT
study_accession
FROM 
study, 
workspace, 
contract_grant, 
program 
WHERE 
study.workspace_id = workspace.workspace_id AND 
workspace.contract_id = contract_grant.contract_grant_id AND 
contract_grant.program_id = program.program_id AND 
program.title = 'Human Immunology Project Consortium (HIPC)'
