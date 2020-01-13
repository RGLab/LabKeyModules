
interface LabKey {
    defaultHeaders: any;
    devMode: boolean;
    container: any;
    contextPath: string;
    moduleContext: any;
    user: any;
    vis: any;
    query: any;
    Ajax: any;
    ActionURL: any
}
interface SelectRowsResponse {
    schemaName: string;
    queryName: string;
    formatVersion: number;
    metaData: SelectRowsMetadata;
    rowCount: number;
    rows: any[];
}
interface SelectRowsMetadata {
    description: string;
    fields: any[];
    id: string;
    importMessage: string;
    importTemplates: any[];
    root: string;
    title: string;
    totalProperty: string;
}


// Filter-related types
// interface Filter {
//     name: string;
//     members: Array<string>;
//     operator: string;
// }
// interface GroupedFilters {
//     participant: Filter[];
//     sample: Filter[];
//     study: Filter[];
// }

// // Component props
// interface FlagProps {
//     filter: Filter;
//     filterClass: string;
// }
// interface ListProps {
//     filterClass: string;
//     filters: Array<Filter>;
//     title: string;
// }
// interface AppliedFilterProps {
//     filters: GroupedFilters
// }



/* App globals */
declare const LABKEY: LabKey;