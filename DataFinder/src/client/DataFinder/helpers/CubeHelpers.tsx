import { CubeMdx } from "../../typings/Cube";
import { SelectedFilters, CubeData } from "../../typings/CubeData";

// Create appropriate queries from SelectedFilters to create appropriate filters for cube request

// Create CubeData object from cube response

// Update StudyDict from cube response

export const createCubeData = (mdx: CubeMdx, filters: SelectedFilters) => {
    const cd: CubeData = {
        subject: {
            race: [],
            age: [{ label: "0-10", value: 15 }],
            gender: []
        },
        study: {
            name: [],
            program: [],
            condition: [],
            species: [],
            exposureMaterial: [],
            exposureProcess: []
        },
        data: {
            assay: {
                assay: [],
                timepoint: [],
                sampleType: []
            },
            timepoint: [],
            sampleType: []
        }
    }
    return (
        cd
    )
}