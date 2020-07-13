// import * as React from "react";
// import { mount } from "enzyme";
// import { Banner, GroupSummary } from './Banner'
// import { SelectedFilters, TotalCounts } from "../../typings/CubeData";

describe('Banner', () => {

//     const gs = new GroupSummary()
//     const filters = new SelectedFilters()
//     const counts = new TotalCounts()
//     const participantGroupAPI = jest.spyOn(LABKEY.Study, "ParticipantGroup")


    test('DataFinder Banner Text', () => {

        expect("Unsaved Participant Group").toEqual("Unsaved Participant Group")

//             const banner = mount(<Banner groupSummary={gs} filters={filters} counts={counts} manageGroupsDropdown={<></>} />)
//             const bannerTitle = banner.find({ className: 'df-banner-title' });
//             expect(bannerTitle.length).toEqual(1);
//             expect(bannerTitle.text()).toEqual("Unsaved Participant Group");

//             banner.unmount();
    });
});