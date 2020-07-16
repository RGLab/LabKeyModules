import React, { useCallback, useMemo, Children } from "react";
import { FilterSummary } from "./FilterSummary";
import { SelectedFilters, TotalCounts, GroupInfo } from "../../typings/CubeData";
import { HighlightedButton } from "./reusable/Buttons";
import { DropdownButtons, InnerDropdownButtons, } from "./reusable/Dropdowns"
import * as ParticipantGroupHelpers from "../helpers/ParticipantGroup"
import { Record } from "immutable";
import { RowOfButtons } from "./reusable/Buttons";
import "./Banner.scss"
import { ParticipantGroup } from "../../typings/ParticipantGroup";

interface BannerProps {
    groupSummary: GroupSummary;
    filters: SelectedFilters;
    counts: TotalCounts;
    manageGroupsDropdown: JSX.Element;
    links?: JSX.Element;
    dropdowns?: JSX.Element;
    filterBarId?: string;
    id?: string
}

export interface IGroupSummary {
    label?: string;
    id?: number;
    isSaved?: boolean;
}

export class GroupSummary extends Record({
    label: "",
    id: 0,
    isSaved: true
}) {
    label: string;
    id: number;
    isSaved: boolean;

    constructor(params?: IGroupSummary) {
        params ? super(params) : super()
    }
    with(values: IGroupSummary) {
        return this.merge(values) as this;
    }
    recordSet(key: string, value: any) {
        return this.set(key, value) as this
    }
}

interface BannerTitleBarProps {
    groupSummary: GroupSummary;
    counts: TotalCounts;
    manageGroupsDropdown: JSX.Element;
}

interface ParticipantGroupSummaryProps {
    groupSummary: GroupSummary;
    counts: TotalCounts;
}

interface ManageGroupDropdownProps {
    groupSummary: GroupSummary;
    setGroupSummary: (groupSummary: React.SetStateAction<GroupSummary>) => void;
    loadParticipantGroup: (groupInfo: GroupInfo) => void;
    availableGroups: GroupInfo[];
    updateAvailableGroups: () => Promise<GroupInfo[]>
}

// Exports

const BannerFC: React.FC<BannerProps> = ({
    filters,
    groupSummary,
    counts,
    filterBarId,
    manageGroupsDropdown,
    id
}) => {
    return (
        <div id={id}>
            <BannerTitleBar
                groupSummary={groupSummary}
                counts={counts}
                manageGroupsDropdown={manageGroupsDropdown}
            />

            <div id={filterBarId || "df-filter-summary"}>
                <FilterSummary filters={filters} />
            </div>
            <hr className={"df-banner-separator"}></hr>
        </div>
    );
};

export const Banner = React.memo(BannerFC)

export const ManageGroupsDropdownFC : React.FC<ManageGroupDropdownProps> = (({ 
    groupSummary, 
    setGroupSummary, 
    loadParticipantGroup,
    availableGroups,
    updateAvailableGroups }) => {


    const saveAsCallback = (goToSendAfterSave) => {
        const aftersave = (saveData) => {
            const groupInfo = {
                id: saveData.group.rowId,
                label: saveData.group.label,
                filters: JSON.parse(saveData.group.filters),
                selected: true
            }
            updateAvailableGroups()
            loadParticipantGroup(groupInfo)
        }
        openSaveWindow("", goToSendAfterSave, aftersave)
    }

 

    const buttonData = [
        {
            label: "Save",
            action: () => {
                ParticipantGroupHelpers.saveParticipantGroup(groupSummary).then(() => {
                    updateAvailableGroups()
                })
                setGroupSummary((prevGroupSummary) => prevGroupSummary.with({isSaved: true})) },
            disabled: !(groupSummary.id > 0)
        },
        {
            label: "Save As",
            action: () => saveAsCallback(false)
        },
        {
            label: "My Groups Dashboard",
            icon: <i className="fa fa-link"></i>,
            href: "/study/Studies/manageParticipantCategories.view?",
        },
        {
            label: "Send",
            icon: <i className="fa fa-link"></i>,
            action: () => ParticipantGroupHelpers.sendParticipantGroup(groupSummary, saveAsCallback),
        },
        {
            label: "Load",
            buttonData: availableGroups.map((group) => {
                return ({
                    label: group.label,
                    action: () => loadParticipantGroup(group),
                })
            })
        },
    ]

    return (
        <>
            <DropdownButtons title="Manage" buttonData={buttonData}></DropdownButtons>
        </>
    )
})

export const ManageGroupsDropdown = React.memo(ManageGroupsDropdownFC)


// ------- sub-components --------

const BannerTitleBarFC: React.FC<BannerTitleBarProps> = (({
    groupSummary,
    counts,
    manageGroupsDropdown
}) => {
    return (
        <div className="df-banner-titlebar">
            <RowOfButtons>
                <ParticipantGroupSummary
                    groupSummary={groupSummary}
                    counts={counts}
                />
                <div className="df-banner-button">
                    <ExploreGroupDropdown />
                </div>
                <div className="df-banner-button">
                    {manageGroupsDropdown}
                </div>
                <div className="df-banner-button">
                <HighlightedButton label="Download Data" href="/immport/Studies/exportStudyDatasets.view?"/>
                <HighlightedButton label="Open in RStudio" href="/rstudio/start.view?"/>
                </div>
            </RowOfButtons>
        </div>
    );
});

const BannerTitleBar = React.memo(BannerTitleBarFC)

const BannerTitleElement = React.memo(({children}) => {
    return(
        <div style={{float: "left", padding: "3px 10px"}}>
            {children}
        </div>
    )
})


const ExploreGroupDropdown = React.memo(({ }) => {
    const search = window.location.search
    const params = new URLSearchParams(search)
    let title = params.get("pageId")
    if (title == "Find") title = "Select Participants"

    const buttonData = ["Select Participants", "Visualize", "Analyze"].map(
      (label) => {
          let link = label
          if (label== "Select Participants" ) link = "Find"
          return({
        label: label,
        action: () => {},
        disabled: false,
        href: "/project/Studies/begin.view?pageId="+link,
      })
    }
    );
    return (
        <>
        <span style={{display: "inline-block"}}>
        Explore Data: 
        </span>
        <div style={{display: "inline-block"}}>
        <DropdownButtons title={title || "Select Participants"} buttonData={buttonData} id="df-explore-data" />
        </div>
        </>
    )
})

const ParticipantGroupSummary = React.memo<ParticipantGroupSummaryProps>(({
    groupSummary,
    counts
}) => {
    return (
        <>
            <h3>
                <div className="df-banner-title">{groupSummary.label || "Unsaved Participant Group"}</div>
            </h3>
            <div id="current-participant-group-info-banner" style={{ clear: "left" }}>
                {!groupSummary.isSaved && (
                        <div style={{ color: "red", display: "inline-block" }}>
                            Changes have not been saved
                            </div>
                )}
                <p className={"df-group-summary-counts"}>
                    {counts.participant} participants from {counts.study} studies
                </p>
            </div>
        </>
    );
});



// ------- Helpers -------

// save participant group
export const openSaveWindow = (groupLabel = "", goToSendAfterSave = false, aftersave = (data) => { }) => {
    // save the group with applied filters in localStorage
    const studySubject = {
        nounSingular: 'Participant',
        nounPlural: 'Participants',
        tableName: 'Participant',
        columnName: 'ParticipantId'
    }
    ParticipantGroupHelpers.getSessionParticipantGroup().then((data: any) => {
        const description = JSON.parse(data.description)
        if (description) {
            description.summary = {label: groupLabel, isSaved: true}
        }
        const window = Ext4.create('Study.window.ParticipantGroup', {
            subject: studySubject,
            groupLabel: groupLabel,
            participantIds: data.participantIds,
            filters: JSON.parse(data.filters),
            description: description,
            goToSendAfterSave: goToSendAfterSave
        });
        window.show()
        window.on("aftersave", (saveData) => {
            if (goToSendAfterSave) ParticipantGroupHelpers.goToSend(saveData.group.rowId)
            aftersave(saveData)
        })
    })
}