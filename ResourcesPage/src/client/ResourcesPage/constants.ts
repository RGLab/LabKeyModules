export const TAB_REPORTS = "Reports";
export const TAB_STUDYSTATS = "StudyStats";
export const TAB_MOSTACCESSED = "MostAccessed";
export const TAB_MOSTCITED= "MostCited";
export const TAB_SIMILARSTUDIES = "SimilarStudies";
export const TAB_TOOLS = "Tools";
export const TAB_IMMUNESPACER = "ImmuneSpaceR";

export const tabInfo = [
    {
        id: "reports",
        tag: TAB_REPORTS,
        text: "Highlighted Reports"
    },
    {
        id: "study-stats",
        tag: TAB_STUDYSTATS,
        text: "Study Statistics",
        subMenu: [
            {
                id: "most-accessed",
                tag: TAB_MOSTACCESSED,
                text: "Most Accessed"
            },
            {
                id: "most-cited",
                tag: TAB_MOSTCITED,
                text: "Most Cited"
            },
            {
                id: "similar-studies",
                tag: TAB_SIMILARSTUDIES,
                text: "Similar Studies"
            }
        ]
    },
    {
        id: "tools",
        tag: TAB_TOOLS,
        text: "HIPC Tools",
    },
    {
        id: "immunespacer",
        tag: TAB_IMMUNESPACER,
        text: "ImmuneSpaceR"
    }   
]