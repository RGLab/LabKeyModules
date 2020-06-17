import React, { useCallback, useMemo, Children } from "react";
import { FilterSummary } from "./FilterSummary";
import { SelectedFilters, TotalCounts, GroupInfo } from "../../typings/CubeData";
import { HighlightedButton } from "./reusable/Buttons";
import { DropdownButtons, InnerDropdownButtons, } from "./reusable/Dropdowns"
import * as ParticipantGroupHelpers from "../helpers/ParticipantGroup_new"
import { Record } from "immutable";
import { RowOfButtons } from "./reusable/Buttons";
import "./Banner.scss"

interface BannerProps {
    groupSummary: GroupSummary;
    filters: SelectedFilters;
    counts: TotalCounts;
    manageGroupsDropdown: JSX.Element;
    links?: JSX.Element;
    dropdowns?: JSX.Element;
    filterBarId?: string;
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
    updateAvailableGroups: () => void;
}


const BannerFC: React.FC<BannerProps> = ({
    filters,
    groupSummary,
    counts,
    filterBarId,
    manageGroupsDropdown
}) => {
    return (
        <>
            <BannerTitleBar
                groupSummary={groupSummary}
                counts={counts}
                manageGroupsDropdown={manageGroupsDropdown}
            />

            <div id={filterBarId || "df-filter-summary"}>
                <FilterSummary filters={filters} />
            </div>
            <hr className={"df-banner-separator"}></hr>
        </>
    );
};

export const Banner = React.memo(BannerFC)

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
                <ExploreGroupDropdown />
                {manageGroupsDropdown}
                <>
                <HighlightedButton label="Download Data" href="/immport/Studies/exportStudyDatasets.view?"/>
                <HighlightedButton label="Open in RStudio" href="/rstudio/start.view?"/>
                </>
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

export const ManageGroupsDropdownFC : React.FC<ManageGroupDropdownProps> = (({ 
    groupSummary, 
    setGroupSummary, 
    loadParticipantGroup,
    availableGroups,
    updateAvailableGroups }) => {


    const saveAsCallback = (goToSendAfterSave) => {
        const aftersave = (saveData) => {
            updateAvailableGroups()

            setGroupSummary((prevGroupSummary) => prevGroupSummary.with({
                label: saveData.group.label,
                id: saveData.group.rowId,
                isSaved: true
            }))
        }
        openSaveWindow("", goToSendAfterSave, aftersave)
    }

    const sendParticipantGroup = () => {
        if (groupSummary.isSaved && groupSummary.id > 0) {
            ParticipantGroupHelpers.goToSend(groupSummary.id)
        } else {
            const allowSave = groupSummary.id > 0;
            if (!groupSummary.isSaved || !allowSave) {
                Ext4.Msg.show({
                    title: 'Save Group Before Sending',
                    msg: 'You must save a group before you can send a copy.',
                    icon: Ext4.Msg.INFO,
                    buttons: allowSave ? Ext4.Msg.YESNOCANCEL : Ext4.Msg.OKCANCEL,
                    buttonText: allowSave ? { yes: 'Save', no: 'Save As' } : { ok: 'Save As' },
                    fn: function (buttonId) {
                        if (buttonId === 'yes')
                            ParticipantGroupHelpers.getSessionParticipantGroup().then((data) => {
                                ParticipantGroupHelpers.updateParticipantGroup(groupSummary.id, data)
                            })
                        else if (buttonId === 'no' || buttonId === 'ok')
                            saveAsCallback(true)
                    }
                })
            }
        }
    }

    const saveParticipantGroup = () => {
        if (groupSummary.id > 0) {
            ParticipantGroupHelpers.getSessionParticipantGroup().then((data) => {
                if (data.description) {
                    const description = JSON.parse(data.description)
                    data.label = description.label
                }                
                ParticipantGroupHelpers.updateParticipantGroup(groupSummary.id, data)
                setGroupSummary((prevGroupSummary) => (prevGroupSummary.with({
                    label: data.label,
                    isSaved: true
                })))
            })
        } 
    }

    const buttonData = [
        {
            label: "Save",
            action: saveParticipantGroup,
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
            action: () => sendParticipantGroup(),
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
            <DropdownButtons title="Options" buttonData={buttonData}></DropdownButtons>
        </>
    )
})

export const ManageGroupsDropdown = React.memo(ManageGroupsDropdownFC)

const ExploreGroupDropdown = React.memo(({ }) => {
    const search = window.location.search
    const params = new URLSearchParams(search)
    const title = params.get("pageId")

    const buttonData = ["Find", "Visualize", "QC", "Analyze"].map(
      (pageId) => ({
        label: pageId,
        action: () => {},
        disabled: false,
        href: "/project/Studies/begin.view?pageId="+pageId,
      })
    );
    return (
        <>
        <span style={{display: "inline-block"}}>
        Explore Data: 
        </span>
        <div style={{display: "inline-block"}}>
        <DropdownButtons title={title || "Find"} buttonData={buttonData} />
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
        const window = Ext4.create('Study.window.ParticipantGroup', {
            subject: studySubject,
            groupLabel: groupLabel,
            participantIds: data.participantIds,
            filters: JSON.parse(data.filters),
            goToSendAfterSave: goToSendAfterSave
        });
        window.show()
        window.on("aftersave", (saveData) => {
            console.log("saveData")
            console.log(saveData)
            if (goToSendAfterSave) ParticipantGroupHelpers.goToSend(saveData.group.rowId)
            ParticipantGroupHelpers.setSessionParticipantGroup(
                saveData.group.rowId
            )
            aftersave(saveData)
        })
    })
}