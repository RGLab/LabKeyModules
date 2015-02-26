SELECT DISTINCT
 md5( cell_population_statistics.Filename ) as ParticipantID,
 1 as SequenceNum,
 cell_population_statistics.Panel,
 cell_population_statistics.Center,
 cell_population_statistics.Sample,
 cell_population_statistics.Replicate,
 cell_population_statistics.Filename
FROM
 cell_population_statistics

