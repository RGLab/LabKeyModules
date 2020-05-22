import React, { useCallback, useMemo, Children } from "react";
import { FilterSummary } from "./FilterIndicator";
import { SelectedFilters, TotalCounts, GroupInfo } from "../../typings/CubeData";
import { ContentDropdown } from "./FilterDropdown";
import { SaveDropdown, LoadDropdown, DropdownButtons } from "./ActionButton";
import * as ParticipantGroupHelpers from "../helpers/ParticipantGroup_new"

interface BannerProps {
    groupSummary: GroupSummary;
    filters: SelectedFilters;
    counts: TotalCounts;
    manageGroupsDropdown: JSX.Element;
    links?: JSX.Element;
    dropdowns?: JSX.Element;
    filterBarId?: string;
}

export interface GroupSummary {
    label: string;
    id: number;
    isSaved: boolean;
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
}

interface HighlightedButtonProps {
    label: string;
    action?: () => void;
    href?: string;
}

export const Banner: React.FC<BannerProps> = ({
    filters,
    groupSummary,
    counts,
    links,
    dropdowns,
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
        </>
    );
};

const BannerTitleBar: React.FC<BannerTitleBarProps> = ({
    groupSummary,
    counts,
    manageGroupsDropdown
}) => {
    return (
        <div className="row df-banner-titlebar">
            <BannerTitleElement>
                <ParticipantGroupSummary
                    groupSummary={groupSummary}
                    counts={counts}
                />
            </BannerTitleElement>
            <BannerTitleElement>
                {manageGroupsDropdown}
            </BannerTitleElement>
            <BannerTitleElement>
                <ExploreGroupDropdown />
            </BannerTitleElement>
            <BannerTitleElement>
                <HighlightedButton label="Download Data" href="/immport/Studies/exportStudyDatasets.view?"/>
                <HighlightedButton label="Open in RStudio" href="/rstudio/start.view?"/>
            </BannerTitleElement>
        </div>
    );
};
const BannerTitleElement: React.FC = ({children}) => {
    return(
        <div style={{float: "left", padding: "10px"}}>
            {children}
        </div>
    )
}

export const ManageGroupsDropdown: React.FC<ManageGroupDropdownProps> = ({ groupSummary, setGroupSummary, loadParticipantGroup }) => {
    const [availableGroups, setAvailableGroups] = React.useState<GroupInfo[]>([])

    const saveAsCallback = (goToSendAfterSave) => {
        const aftersave = (saveData) => {
            ParticipantGroupHelpers.getAvailableGroups().then((data) => {
                const groups = ParticipantGroupHelpers.createAvailableGroups(data)
                setAvailableGroups(groups)
                setGroupSummary({
                    label: saveData.group.label,
                    id: saveData.group.rowId,
                    isSaved: true
                })
            })
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
                setGroupSummary((prevGroupSummary) => ({
                    label: data.label,
                    id: prevGroupSummary.id,
                    isSaved: true
                }))
            })
        } else {
            console.log("No group loaded!")
        }
    }

    React.useEffect(() => {
        ParticipantGroupHelpers.getAvailableGroups().then((data) => {
            const groups = ParticipantGroupHelpers.createAvailableGroups(data)
            groups.sort((a, b) => a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1)
            setAvailableGroups(groups)
        })
    }, [])

    const content = useMemo(() =>
        <>
            <SaveDropdown
                saveAs={() => saveAsCallback(false)}
                save={saveParticipantGroup}
                disableSave={false} />
            <LoadDropdown groups={availableGroups} loadParticipantGroup={loadParticipantGroup} />
            <a id="manage-participant-group-link" className="labkey-text-link" href="/study/Studies/manageParticipantCategories.view?">My Groups Dashboard</a>
            <a id="send-participant-group-link" className="labkey-text-link" href="#" onClick={() => sendParticipantGroup()}>Send</a>
        </>, [availableGroups])


    return (
        <>
            <ContentDropdown id={"manageGroupsDropdown"} label={"Manage Groups"} content={content} customMenuClass={""} />
        </>
    )
}

const ExploreGroupDropdown: React.FC = ({ }) => {
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
}



const ParticipantGroupSummary: React.FC<ParticipantGroupSummaryProps> = ({
    groupSummary,
    counts
}) => {
    return (
        <>
            <h3>
                <div className="df-banner-title">{groupSummary.label}</div>
            </h3>
            <div id="current-participant-group-info-banner" style={{ clear: "left" }}>
                {!groupSummary.isSaved && (
                    <>
                        <div style={{ color: "red", display: "inline-block" }}>
                            Changes have not been saved
            </div>
                        <div style={{ display: "inline-block" }}></div>
                    </>
                )}
                <p>
                    {counts.participant} participants from {counts.study} studies
        </p>
            </div>
        </>
    );
};

const HighlightedButton: React.FC<HighlightedButtonProps> = ({label, action, href}) => {
  return <a href={href ?? ""} >
      <button className="btn btn-warning df-highlighted-button" onClick={action ?? (() => {})}>
      {label}
      </button>
  </a>;
};



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
            filters: data.filters,
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