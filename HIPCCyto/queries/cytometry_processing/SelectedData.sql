SELECT
gating_set,
wsid,
workspace,
group_id,
group_name,
num_samples,
num_unique_days,
num_unique_tube,
panels,
fw_version,
study
FROM gatingSetMetaData
WHERE gatingSetMetaData.container IN (SELECT Container FROM study.participant)
