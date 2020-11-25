SELECT Label, CategoryLabel,
FROM (SELECT COUNT(Label) as AssayCount, Label, CategoryLabel
   FROM dimstudyassay
   WHERE Study IN ('SDY56','SDY61','SDY63','SDY67','SDY80','SDY180','SDY212','SDY269','SDY270','SDY400','SDY404','SDY520','SDY640','SDY984','SDY1119','SDY1260','SDY1264','SDY1276','SDY1289','SDY1291','SDY1293','SDY1294','SDY1325','SDY1328','SDY1364','SDY1368','SDY1370','SDY1373','SDY1529')
   GROUP BY Label, CategoryLabel)
WHERE Label IN ('Gene expression microarray data files','Hemagglutination inhibition (HAI)', 'Enzyme-linked immunosorbent assay (ELISA)','Neutralizing antibody titer')
