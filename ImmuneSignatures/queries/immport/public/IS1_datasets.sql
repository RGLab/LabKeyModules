SELECT Label, CategoryLabel,
FROM (SELECT COUNT(Label) as AssayCount, Label, CategoryLabel
   FROM dimstudyassay
   WHERE Study IN ('SDY63','SDY67','SDY80','SDY212','SDY400','SDY404')
   GROUP BY Label, CategoryLabel)
WHERE Label IN ('Gene expression microarray data files','Hemagglutination inhibition (HAI)')
