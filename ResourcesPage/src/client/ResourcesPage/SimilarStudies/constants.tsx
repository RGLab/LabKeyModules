export const DROPDOWN_OPTIONS = [
    {value: 'assays', label: 'Assay Data Available'},
    {value: 'studyDesign', label:  'Study Design'},
    {value: 'condition', label: 'Condition Studied'}
]

export const LABELS = {
    assays: [
        'elisa',
        'elispot',
        'hai',
        'neutralizingAntibodyTiter',
        'geneExpression',
        'flowCytometry',
        'pcr',
        'mbaa'
    ],
    condition: [
        'healthy',
        'influenza',
        'cmv',
        'tuberculosis',
        'yellowFever',
        'meningitis',
        'malaria',
        'hiv',
        'dengue',
        'ebola',
        'hepatitis',
        'smallpox',
        'dermatomyositis',
        'westNile',
        'zika',
        'varicellaZoster',
        'unknown'
    ],
    studyDesign: [
        'minimumAge',
        'maximumAge',
        'numberOfParticipants',
        'clinicalTrial'
    ]
}

export var categoricalLabels = LABELS.assays
                          .concat(LABELS.condition)
                          .concat('clinicalTrial')