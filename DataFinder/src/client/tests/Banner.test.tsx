import * as React from "react";
import { mount } from "enzyme";
import { FilterBanner } from '../Banner/FilterBanner'

describe('Banner', () => {

    test('DataFinder Banner Text', () => {

            const banner = mount(<FilterBanner show={true} />)
            // Verify Hello World! text
            const bannerTitle = banner.find({ className: 'df-banner-title' });
            expect(bannerTitle.length).toEqual(1);
            expect(bannerTitle.text()).toEqual("");

            // Verify snapshot
            // expect(toJson(helloWorld)).toMatchSnapshot();
            banner.unmount();
    });
});