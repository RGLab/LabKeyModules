SELECT
gating_set,
wsID,
workspace,
group_id,
group_name,
num_samples,
num_unique_days,
num_unique_tube,
panels,
fw_version,
study,
Run.created,
Run.createdby
FROM Data
WHERE Data.Folder IN (SELECT Container FROM study.participant)
