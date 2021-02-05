// import ParticipantGroupAPI  from './ParticipantGroup'

interface LabKey {
    defaultHeaders: any;
    devMode: boolean;
    container: any;
    contextPath: string;
    moduleContext: any;
    user: any;
    vis: any;
    query: any;
    Query: any;
    Ajax: any;
    ActionURL: any;
    Utils: any;
    WebPart: any;
    QueryWebPart: any;
    Study: any;
}

interface Ext4 {
    create: any;
    Msg: any;
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
declare const Ext4: Ext4;