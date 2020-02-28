var $=$||jQuery;

var formatNumber = function(number) { return number.toLocaleString(); };
function console_log(x) {console.log(x);}

var DIV = React.DOM.div;
var SPAN = React.DOM.span;
var HR = React.DOM.hr;
var A = React.DOM.a;
var TABLE = React.DOM.table;
var TBODY = React.DOM.tbody;
var TR = React.DOM.tr;
var TD = React.DOM.td;
var UL = React.DOM.ul;
var LI = React.DOM.li;
var I = React.DOM.i;
var INPUT = React.DOM.input;
var SELECT = React.DOM.select;
var OPTION = React.DOM.option;
var NBSP = '\u00A0';
var BR  = React.DOM.br;


var detailShowing = null;

function showPopup(url)
{
    if (detailShowing)
    {
        detailShowing.hide();
        detailShowing.destroy();
        detailShowing = null;
    }

    var detailWindow = Ext4.create('Ext.window.Window', {
        width: 800,
        maxHeight: 600,
        resizable: true,
        layout: 'fit',
        border: false,
        cls: 'labkey-study-detail',
        autoScroll: true,
        loader: {
            autoLoad: true,
            url: url // 'immport-studyDetail.view?_frame=none&study=' + member
        }
    });
    var viewScroll = Ext4.getBody().getScroll();
    var viewSize = Ext4.getBody().getViewSize();
    var region = [viewScroll.left, viewScroll.top, viewScroll.left + viewSize.width, viewScroll.top + viewSize.height];
    var proposedXY = [region[0] + viewSize.width / 2 - 400, region[1] + viewSize.height / 2 - 300];
    proposedXY[1] = Math.max(region[1], Math.min(region[3] - 400, proposedXY[1]));
    detailWindow.setPosition(proposedXY);
    detailShowing = detailWindow;
    detailShowing.show();
}

// NOTE LABKEY.ext4.Util.resizeToViewport only accepts an ext component
function resizeToViewport(el, width, height, paddingX, paddingY, offsetX, offsetY)
{
    el = Ext4.get(el);
    if (!el)
        return null;

    if (width < 0 && height < 0)
        return null;

    var padding = [];
    if (offsetX === undefined || offsetX == null)
        offsetX = 35;
    if (offsetY === undefined || offsetY == null)
        offsetY = 35;

    if (paddingX !== undefined && paddingX != null)
        padding.push(paddingX);
    else
    {

        var bp = Ext4.get('bodypanel');
        if (bp)
        {
            var t = Ext4.query('table.labkey-proj');
            if (t && t.length > 0)
            {
                t = Ext4.get(t[0]);
                padding.push((t.getWidth() - (bp.getWidth())) + offsetX);
            }
            else
                padding.push(offsetX);
        }
        else
            padding.push(offsetX);
    }
    if (paddingY !== undefined && paddingY != null)
        padding.push(paddingY);
    else
        padding.push(offsetY);

    var xy = el.getXY();
    var size = {
        width: Math.max(100, width - xy[0] - padding[0]),
        height: Math.max(100, height - xy[1] - padding[1])
    };

    if (width < 0)
        el.setHeight(size.height);
    else if (height < 0)
        el.setWidth(size.width);
    else
        el.setSize(size);
    return size;
}

var cellSetHelper =
{
    getRowPositions : function(cellSet)
    {
        return cellSet.axes[1].positions;
    },

    getRowPositionsOneLevel : function(cellSet)
    {
        var positions = cellSet.axes[1].positions;
        if (positions.length > 0 && positions[0].length > 1)
        {
            console.log("warning: rows have nested members");
            throw "illegal state";
        }
        return positions.map(function(inner){return inner[0]});
    },

    getData : function(cellSet,defaultValue)
    {
        var cells = cellSet.cells;
        var ret;
        ret = cells.map(function(row)
        {
            return row.map(function(col){return col.value ? col.value : defaultValue;});
        });
        return ret;
    },

    getDataOneColumn : function(cellSet,defaultValue)
    {
        var cells = cellSet.cells;
        if (cells.length > 0 && cells[0].length > 1)
        {
            console.log("warning cellSet has more than one column");
            throw "illegal state";
        }
        var ret;
        ret = cells.map(function(row)
        {
            return row[0].value ? row[0].value : defaultValue;
        });
        return ret;
    }
};


var StudyCard = React.createClass(
{
    handleShowSummary : function()
    {
        showPopup('immport-studyDetail.view?_frame=none&study=' + this.props.study.study_accession);
    },

    shouldComponentUpdate: function(nextProps, nextState)
    {
        return this.props.visible !== nextProps.visible;
    },

    render : function()
    {
        var study = this.props.study;
        var visible = this.props.visible;

        return DIV({className: "labkey-study-card " + (study.hipc_funded?"hipc ":"") + (study.loaded?"loaded ":""), style:{display:(visible?"block":"none")}},
            SPAN({key:"ascession", className:"labkey-study-card-highlight labkey-study-card-accession"}, study.study_accession),
            SPAN({key:"pi", className:"labkey-study-card-highlight labkey-study-card-pi"}, study.pi),
            HR({key:"hr", className:"labkey-study-card-divider"}),
            DIV({key:"summary"},
                A({className:"labkey-text-link labkey-study-card-summary", title:"click for more details", onClick:this.handleShowSummary}, "view summary"),
                (study.loaded && study.url) ? A({className:"labkey-text-link labkey-study-card-goto",  href:study.url}, "go to study") : null
            ),
            DIV({key:"title", className:"labkey-study-card-description"}, study.title),
            !study.hipc_funded ? null :
                DIV({key:"hipc", className:"hipc-label"}, SPAN({className:"hipc-label"}, "HIPC"))
        );
    }
});


var StudyPanel = React.createClass(
{
    render : function()
    {
        var loading = this.props.loading;
        var studies = this.props.studies;
        var visibleStudies = this.props.visibleStudies;

        if (!studies.length && !loading)
        {
            return DIV({id:"studypanel"},
                DIV({id:"emptymsg"}, DIV({style:{padding:"20px"}}, "No participants match the current criteria.  Edit your filters to select a valid cohort."))
            );
        }
        else
        {
            return DIV({id:"studypanel"},
                studies.map(function(study){
                    var visible = !visibleStudies || visibleStudies[study.memberName];
                    return  React.createElement(StudyCard, {key:study.study_accession, study:study, visible:visible});
                })
            );
        }
    }
});


var Summary = React.createClass(
{
    render : function()
    {
        var studyCount = this.props.studyCount;
        var subjectCount = this.props.subjectCount;
        return DIV({className:"df-facet", id:"summaryArea"},
            DIV({className:"df-facet-header"}, SPAN({className:"df-facet-caption"}, "Summary")),
            UL({},
                LI({className:"df-member", style:{cursor: "default"}},
                    SPAN({className:"df-member-name"}, "Studies"),
                    SPAN({className:"df-member-count"}, studyCount)),
                LI({className:"df-member", style:{cursor: "default"}},
                    SPAN({className:"df-member-name"}, "Participants"),
                    SPAN({className:"df-member-count"}, formatNumber(subjectCount)))

                )
        );
    }
});


var FacetMember = React.createClass(
{
    handleSelectMember : function()
    {
        this.props.onChange(this.props.member, true);
    },

    handleToggleMember : function(event)
    {
        event.stopPropagation();
        this.props.onChange(this.props.member, !this.props.selected);
    },

    shouldComponentUpdate: function(nextProps, nextState)
    {
        return this.props.selected !== nextProps.selected ||
            this.props.count !== nextProps.count ||
            this.props.percent !== nextProps.percent;
    },

    render : function()
    {
        var member = this.props.member;
        var selected = this.props.selected;
        var count = this.props.count;
        var percent = this.props.percent;

        var classes = "df-member " +
                (selected ? "df-selected-member " : "") +
                ((!selected && count===0) ? "df-empty-member":"");
        var key="m_"+member.uniqueName;
        return LI({key:key, id:key, className:classes, style:{position:"relative"}, onClick:this.handleSelectMember},
            SPAN({className:"df-bar "+(selected?"df-bar-selected":""), style:{display:(count?"block":"none"), width:(percent+"%")}}),
            SPAN({
                className:"active df-member-indicator " + (member.selected?"selected ":"") + (dim.filters.length?"":"df-none-selected ") + (member.selected?"":"not-selected "),
                onClick:this.handleToggleMember
            }, NBSP),
            SPAN({className:"df-member-name"}, member.name),
            SPAN({className:"df-member-count"},formatNumber(count))
        );
    }
});


var Facet = React.createClass(
{
    getInitialState : function () {return {expanded:false};},

    handleToggleExpanded : function()
    {
        this.setState({expanded : !this.state.expanded});
    },

    handleFacetMemberChange : function(member, selected)
    {
        if (member.selected !== selected && typeof this.props.onFacetChange === "function")
            this.props.onFacetChange(this.props.dimension, member, selected);
    },

    handleFacetClear : function(event)
    {
        event.stopPropagation();
        if (typeof this.props.onFacetClear === "function")
            this.props.onFacetClear(this.props.dimension);
        return false;
    },

    handleFilterOption : function(filterOption)
    {
        if (this.props.dimension.filterType !== filterOption.type)
            if (typeof this.props.onFacetOptionChange === "function")
                this.props.onFacetOptionChange(this.props.dimension, filterOption);
        return false;
    },

    render : function()
    {
        var dim = this.props.dimension;
        var mapMemberCount = this.props.mapMemberCount;
        var expanded = this.state.expanded;
        var className = "df-facet " +
                (expanded?"expanded ":"collapsed ") +
                (dim.filters.length?"":"noneSelected ");
        var me = this;

        return DIV({id:"group_" + dim.name, className:className},
            DIV({className:"df-facet-header"},
                DIV({className:"df-facet-caption active", onClick:this.handleToggleExpanded},
                    I({className:"fa fa-plus-square"}),
                    I({className:"fa fa-minus-square"}),
                    NBSP,
                    SPAN({className:"df-facet-caption"}, (dim.caption || dim.name)),
                    (!dim.filters.length ? "" : A({className:"df-clear-filter active", href:"#clear", onClick:this.handleFacetClear}, "[clear]"))
                ),
                DIV({className:"labkey-filter-options", style:{display:(dim.filters.length > 1 && dim.filterOptions.length > 0)?"block":"none"}},
                    DIV({className:"dropdown show"},
                        A({className:(dim.filterOptions.length<2?":inactive ":"dropdown-toggle "), role:"button", "data-toggle":"dropdown"},
                                dim.filterCaption, NBSP,
                                dim.filterOptions.length<2 ? null : I({className:"fa fa-caret-down"})
                        ),
                        dim.filterOptions.length<2 ? null:
                            DIV({className:"dropdown-menu"},
                                dim.filterOptions.map(function(opt){
                                    return A({className:"dropdown-item", key:opt.type, onClick:function(event){me.handleFilterOption(opt,event);}}, opt.caption, BR());
                            }))
                    )
                )
            ),

            UL({},
                dim.members.filter(function(member){return !member.hidden;}).map(function(member) {
                    return React.createElement(FacetMember, {
                        key: member.uniqueName,
                        member: member,
                        selected: member.selected,
                        count: (mapMemberCount[member.uniqueName]&&mapMemberCount[member.uniqueName].count)||0,
                        percent: (mapMemberCount[member.uniqueName]&&mapMemberCount[member.uniqueName].percent)||0,
                        onChange: me.handleFacetMemberChange
                    });
                })
            )
        );
    }
});


function viewport()
{
    if ('innerWidth' in window )
        return { width:window.innerWidth, height:window.innerHeight};
    var e = document.documentElement || document.body;
    return {width: e.clientWidth, height:e.clientheight};
}


var viewportSizeTimeout = 0;
var viewportResizeFn = null;

var DataFinderLayout = React.createClass(
{
    getInitialState: function ()
    {
        return {searchValue:"", timeout:null};
    },

    componentWillMount: function ()
    {
        $( window ).resize( this.handleViewportSizeChange );
    },

    componentWillUnmount: function()
    {
        $(window).off("resize", window, viewportResizeFn);
    },

    componentWillReceiveProps: function (nextProps)
    {
        if (this.state.searchValue !== nextProps.initialSearchTerms)
            this.setState({seachValue: nextProps.initialSearchTerms});
    },

    resize : function()
    {
        if (!this.props.autoResize)
            return;
        var componentOuter = Ext4.get("dataFinderWrapper");
        if (!componentOuter)
            return;
        var paddingX=35, paddingY=95;
        // resize down to about a 1200x800 screen size
        var vpSize = viewport(); // this.state.viewportSize;
        var componentSize = resizeToViewport(componentOuter,
                Math.max(1200,vpSize.width), Math.max(750,vpSize.height),
                paddingX, paddingY);
        if (componentSize)
        {
            var bottom = componentOuter.getXY()[1] + componentOuter.getSize().height;
            ["selectionPanel","selection-panel","studypanel","study-panel","dataFinderTable"].forEach(function(id)
            {
                var el = Ext4.get(id);
                if (el)
                    el.setHeight(bottom - el.getXY()[1]);
            });
        }
    },

    componentDidMount : function()
    {
        this.resize();
    },

    handleViewportSizeChange : function()
    {
        if (viewportSizeTimeout)
            clearTimeout(viewportSizeTimeout);
        var me = this;
        viewportSizeTimeout = setTimeout(function () {
                viewportSizeTimeout = 0;
                // var vp = viewport();
                // if (me.state.viewportSize.width !== vp.width || me.state.viewportSize.height !== vp.height)
                // me.setState({viewportSize:vp});
                me.resize();
            },
            300
        );
    },

    handleSearchTermsChanged : function(event)
    {
        if (this.state.timeout)
            clearTimeout(this.state.timeout);
        var timeout = null;
        if (typeof this.props.onSearchTermsChanged === "function")
        {
            var me = this;
            timeout = setTimeout(function () {
                me.props.onSearchTermsChanged(me.state.searchValue);
            }, 300);
        }
        this.setState({searchValue: event.target.value, timeout:timeout});
    },

    handleStudySubsetChanged : function(event)
    {
        if (this.props.studySubset !== event.target.value)
        {
            if (typeof this.props.onStudySubsetChanged === "function")
                this.props.onStudySubsetChanged(event.target.value);
        }
    },

    handleStartTutorial : function(event)
    {
        alert("TODO start tutorial"); // TODO
    },

    render: function ()
    {
        var loading = this.props.loading;
        var studies = this.props.studies;
        var dimensions = this.props.dimensions;
        var dimStudy = dimensions.Study;
        var dimSubject = dimensions.Subject;
        var searchValue = this.state.searchValue;
        var studySubset = this.props.studySubset;
        var subsetOptions = this.props.subsetOptions;
        var searchMessage = this.props.searchMessage;

        var facets = [dimensions.Species,dimensions.Condition,dimensions.ExposureMaterial,dimensions.ExposureProcess,dimensions.Type,dimensions.Category,dimensions.Assay,dimensions.Timepoint,dimensions.Gender,dimensions.Race,dimensions.Age,dimensions.SampleType,dimensions.Study];
        var me = this;

        var mapMemberCount = this.props.mapMemberCount;
        var hasStudyFilter = dimStudy.filters.length !== 0 && dimStudy.filters.length !== dimStudy.members.length;
        var visibleStudiesSet = {};
        dimStudy.members.forEach(function(studyMember)
        {
            var count = mapMemberCount[studyMember.uniqueName] ? mapMemberCount[studyMember.uniqueName].count : 0;
            visibleStudiesSet[studyMember.uniqueName] = (!hasStudyFilter || studyMember.selected) && count;
        });

        return TABLE({id:"dataFinderTable", className:"labkey-data-finder"}, TBODY({},
            TR({},
                TD({},"GROUP"),
                TD({},
                    DIV({className:"studyfinder-header"},
                        SPAN({className:"df-search-box"}, I({className:"fa fa-search"}), NBSP,
                            INPUT({id:"searchTerms", name:"q", className:"df-search-box", type:"search", value:searchValue, onChange:me.handleSearchTermsChanged})
                        ),
                        NBSP,
                        SPAN({className:"labkey-study-search"},
                            SELECT({className:"df-study-subset", name:"studySubsetSelect", defaultValue:studySubset, onChange:this.handleStudySubsetChanged},
                                subsetOptions.map(function(option){
                                    return OPTION({key:option.value, value:option.value}, option.name);
                                })
                            )
                        ),
                        NBSP,
                        SPAN({className:"study-search"}, searchMessage)
                    ),
                    DIV({className:"df-search-message"}, SPAN({id:"message", className:"labkey-filter-message"}, studySubset !== 'UnloadedImmPort' ? "" : "No data are available for participants since you are viewing unloaded studies.")),
                    DIV({className:"df-help-links"},
                        A({className:"labkey-text-link", id:"showTutorial", href:"#", onClick:this.handleStartTutorial}, "Quick Help"),
                        A({className:"labkey-text-link", href:LABKEY.ActionURL.buildURL("immport","exportStudyDatasets")}, "Export Study Datasets")
                        // TODO RSTUDIO
                    )
                )
            ),
            TR({},
                TD({key:"td-selection-panel", className: "df-selection-panel"},
                    DIV({id:"selection-panel"},
                        DIV({},
                            React.createElement(Summary, {studyCount:dimStudy.summaryCount, subjectCount:dimSubject.allMemberCount||0}),
                            SPAN({id:"facetPanel"},
                                facets.map(function(dim){
                                    return React.createElement(Facet, {key:dim.name, dimension:dim,
                                        mapMemberCount: me.props.mapMemberCount,
                                        onFacetChange:me.props.onFacetChange,
                                        onFacetClear:me.props.onFacetClear,
                                        onFacetOptionChange:me.props.onFacetOptionChange});
                                })
                            )
                        )
                    )
                ),
                TD({key:"study-panel", className: "study-panel"},
                    React.createElement(StudyPanel, {
                        loading: loading,
                        studies: studies,
                        visibleStudies: visibleStudiesSet
                    }))
            )));
    }
});


var DataFinderController = React.createClass(
{
    // DataFinderController component life-cycle methods

    getInitialState : function()
    {
        var cube = LABKEY.query.olap.CubeManager.getCube({
            configId: 'ImmPort:/StudyCube',
            schemaName: 'ImmPort',
            name: 'StudyCube',
            deferLoad: false,
            memberExclusionFields:["[Subject].[Subject]"]
        });

        return (
        {
            cube : cube,
            mdx : null,
            cubeLoaded : false,
            firstQuery : false,

            // TODO try to treat dimensions/members as immutable
            // TOOD use side maps uniqueName->count, uniqueName->selected
            mapMemberCount : {},
            mapMemberSelection : {},
            mapDimensionSummary : {}, // TODO
            mapStudyVisible : {},    //TODO
            // TODO map Dimension->filterOption

            loaded_study_list : [],
            recent_study_list : [],
            hipc_study_list : [],
            unloaded_study_list : [],

            searchTerms : "",
            subsetOptions : [],
            studySubset : "UnloadedImmPort", //loaded_study_list.length === 0 ? "UnloadedImmPort" : "ImmuneSpace",
            filterByLevel : "[Subject].[Subject]",

            // query results stored in state.subjects as well as this.props.dimensions.*
            subjects : [],

            groupList : null,
            unsavedGroup : { id: null, label : "Unsaved Group"},
            currentGroup : null,
            currentGroupHasChanges : false,
            saveOptions : [ {id: 'update', label : "Save", isActive: false}, {id : "saveNew", label : "Save As", isActive: true} ],
            studySubject : {
                nounSingular: 'Participant',
                nounPlural: 'Participants',
                tableName: 'Participant',
                columnName: 'ParticipantId'
            } // TODO: should this use LABKEY.getModuleContext('study').subject?
        });
    },

    componentWillMount: function ()
    {
        // initialize state.loaded_study_list and state.studySubset
        var loaded_study_list = [];
        var recent_study_list = [];
        var hipc_study_list = [];
        var unloaded_study_list = [];
        this.props.studies.forEach(function(study){
            if (study.loaded)
                loaded_study_list.push(study.memberName);
            else
                unloaded_study_list.push(study.memberName);
            if (study.highlight)
                recent_study_list.push(study.memberName);
            if (study.hipc_funded)
                hipc_study_list.push(study.memberName);
        });
        var  subsetOptions = [];
        if (loaded_study_list.length > 0)
            subsetOptions.push({value: 'ImmuneSpace', name: 'ImmuneSpace studies' });
        if (recent_study_list.length > 0)
            subsetOptions.push({value: 'Recent', name: 'Recently added studies' });
        if (hipc_study_list.length > 0)
            subsetOptions.push({value: 'HipcFunded', name: 'HIPC funded studies' });
        if (unloaded_study_list.length > 0)
            subsetOptions.push({value: 'UnloadedImmPort', name: 'Unloaded ImmPort studies'});
        var studySubset = loaded_study_list.length === 0 ? "UnloadedImmPort" : "ImmuneSpace";

        this.setState(
        {
            loaded_study_list:loaded_study_list,
            recent_study_list:recent_study_list,
            hipc_study_list:hipc_study_list,
            unloaded_study_list:unloaded_study_list,
            subsetOptions:subsetOptions,
            studySubset:studySubset
        });
        var me = this;
        this.state.cube.onReady(function(mdx){
            me.cubeOnReady(mdx);
        });
    },

    render : function()
    {
        // TODO localStorageService.bind($scope, 'searchTerms');

        return React.createElement(DataFinderLayout, {
            loading : !this.state.cubeLoaded && !this.state.firstQuery,
            autoResize : true,
            studies : this.props.studies,

            dimensions : this.props.dimensions,
            mapMemberCount : this.state.mapMemberCount,

            initialSearchTerms : this.state.searchTerms,
            searchMessage : "test",
            studySubset : this.state.studySubset,
            subsetOptions : this.state.subsetOptions,

            onSearchTermsChanged : this.handleSearchTermsChanged,
            onStudySubsetChanged : this.handleStudySubsetChanged,
            onFacetChange : this.handleFacetChange,
            onFacetClear : this.handleFacetClear,
            onFacetOptionChange : this.handleFacetOptionChange
        });
    },

    componentDidMount : function()
    {
    },

    /* DataFinderController implementation methods */

    initCubeMetaData : function()
    {
        var dimensions = this.props.dimensions;

        var cube = this.state.cube;
        var m, member;
        for (var name in dimensions) {
            if (!dimensions.hasOwnProperty(name))
                continue;
            var dim = dimensions[name];
            var hiddenDefault = name === 'Study';
            dim.hierarchy = cube.hierarchyMap[dim.hierarchyName];
            dim.level = dim.hierarchy.levelMap[dim.levelName];
            // using the cube objects directly makes angularjs debugging hard because of the pointers 'up' to level/hierarchy
            // so I'll copy them instead
            //        dim.members = dim.level.members;
            if (!dim.level.members)
                continue;
            for (m = 0; m < dim.level.members.length; m++) {
                var src = dim.level.members[m];
                if (src.name === "#notnull")
                    continue;
                member = {
                    name: src.name,
                    uniqueName: src.uniqueName,
                    selected: false,
                    level: src.level.uniqueName,
                    filteredCount: -1,
                    selectedCount: -1,
                    hidden: hiddenDefault
                };
                dim.members.push(member);
                dim.memberMap[member.uniqueName] = member;
            }
        }

        var dimStudy = dimensions.Study;
        this.props.studies.forEach(function(study){
            if (!dimStudy.memberMap[study.memberName])
                debugger;
            dimStudy.memberMap[study.memberName].hidden = !study.loaded;
        });
    },

    cubeOnReady : function(mdx)
    {
        this.initCubeMetaData();
        this.setState({cubeLoaded:true, mdx:mdx}, this.updateCountsAsync);
        this.forceUpdate();
    },

    handleFacetChange : function(dimension, member, selected)
    {
        var filterMembers = dimension.filters;
        var m;

        var index = -1;
        for (m = 0; m < filterMembers.length; m++)
        {
            if (member.uniqueName === filterMembers[m].uniqueName)
                index = m;
        }
        if (index === -1 && selected) // unselected -> selected
            filterMembers.push(member);
        else if (index !== -1 && !selected)// selected --> unselected
            filterMembers.splice(index, 1);

        member.selected = selected;
        this.state.mapMemberSelection[member.uniqueName] = selected;
        this.setState({currentGroupHasChanges:true, mapMemberSelection:this.state.mapMemberSelection}, this.updateCountsAsync);

        console_log(dimension.name + "/" + member.name + "/" + selected);
    },

    handleFacetClear : function(dimension)
    {
        if (dimension.filters && dimension.filters.length)
        {
            dimension.filters = [];
            for (var m = 0; m < dimension.members.length; m++)
            {
                dimension.members[m].selected = false;
                this.state.mapMemberSelection[dimension.members[m].uniqueName] = false;
            }
            this.setState({currentGroupHasChanges:true, mapMemberSelection:this.state.mapMemberSelection}, this.updateCountsAsync);
        }
    },

    handleFacetOptionChange : function(dimension, filterOption)
    {
        if (dimension.filterType !== filterOption.type)
        {
            dimension.filterType = filterOption.type;
            dimension.filterCaption = filterOption.caption;
            this.forceUpdate();
            this.updateCountsAsync();
        }
    },

    setSearchStudyFilter : function( studies )
    {
        var dimensions = this.props.dimensions;
        var oldSearchStudyFilter = this.state.searchStudyFilter || [];

        // TODO broadcast???
        studies = this.intersect(studies, this.getStudySubsetList());

        var dim = dimensions.Study;
        var filterMembers = [];
        for (var s = 0; s < studies.length; s++)
        {
            var uniqueName = studies[s];
            var member = dim.memberMap[uniqueName];
            if (!member)
            {
                console.log("study not found: " + uniqueName);
                continue;
            }
            filterMembers.push(member);
        }

        var changed = oldSearchStudyFilter.length !== filterMembers.length ||
                this.intersectMembers(oldSearchStudyFilter,filterMembers).length !== filterMembers.length;

        if (changed || oldSearchStudyFilter.length===0) // check len==0 because this might be the first call to updateCountsAsync
        {
            this.setState({searchStudyFilter:filterMembers}, this.updateCountsAsync);
        }
    },

    intersect : function (a, b)
    {
        var o = {}, ret = [], i;
        for (i = 0; i < a.length; i++)
            o[a[i]] = a[i];
        for (i = 0; i < b.length; i++)
            if (o[b[i]])
                ret.push(b[i]);
        return ret;
    },

    intersectMembers : function (a, b)
    {
        var o = {}, ret = [], i;
        for (i = 0; i < a.length; i++)
            o[a[i].uniqueName] = a[i];
        for (i = 0; i < b.length; i++)
            if (o[b[i].uniqueName])
                ret.push(b[i]);
        return ret;
    },

    updateSearchStudies : function()
    {
        var url = LABKEY.ActionURL.buildURL("search", "json", "/home/", {
            "category": "immport_study",
            "scope": "Folder",
            "q": me.state.searchTerms
        });
        LABKEY.Ajax.request(
        {
            url: url,
            success: function (response) {
                // NOOP if we're not current (poor man's cancel)
                // if (promise !== $scope.doSearchTermsChanged_promise)
                //     return;
                // $scope.doSearchTermsChanged_promise = null;
                var data = JSON.parse(response.responseText);
                var hits = data.hits;
                var searchStudies = [];
                var found = {};
                for (var h = 0; h < hits.length; h++) {
                    var id = hits[h].id;
                    var accession = id.substring(id.lastIndexOf(':') + 1);
                    if (found[accession])
                        continue;
                    found[accession] = true;
                    searchStudies.push("[Study].[" + accession + "]");
                }
                var update = {searchMessage:''};
                if (!searchStudies.length)
                {
                    me.setSearchStudyFilter(searchStudies);
                    update.searchMessage = 'No studies match your search criteria';
                }
                else
                {
                    // intersect with study subset list
                    var result = me.intersect(searchStudies, me.getStudySubsetList());
                    if (!result.length)
                        update.searchMessage = 'No studies match your search criteria';
                    me.setSearchStudyFilter(result);
                }
                me.setState(update);
            },
            scope: this
        });
    },

    handleSearchTermsChanged : function(searchTerms)
    {
        var me = this;
        this.setState({searchTerms: searchTerms, currentGroupHasChanges:true}, this.updateSearchStudies);
        console.log("searchTerms: " + searchTerms);
    },

    handleStudySubsetChanged : function(studySubset)
    {
        this.setState({studySubset:studySubset}, this.updateCountsAsync);
        console.log("studySubset: " + studySubset);
    },

    getStudySubsetList : function()
    {
        var studySubset = this.state.studySubset;

        if (studySubset === "ImmuneSpace")
            return this.state.loaded_study_list;
        if (studySubset === "Recent")
            return this.state.recent_study_list;
        if (studySubset === "HipcFunded")
            return this.state.hipc_study_list;
        if (studySubset === "UnloadedImmPort")
            return this.state.unloaded_study_list;
        var dimStudy = this.props.dimensions.Study;
        return Ext4.pluck(dimStudy.members, 'uniqueName');
    },

    // same as getStudySubsetList, but as member objects
    getStudySubsetMemberList : function()
    {
        var dimStudy = this.props.dimensions.Study;
        var studies = this.getStudySubsetList();
        var members;
        members = studies.map(function(study){return dimStudy.memberMap[study];}).filter(function(m){return !!m;});
        return members;
    },


    asyncQueries : null,

    // this is the main method for generating the COUNT query to update the UI after changing member selection
    updateCountsAsync : function()
    {
        var asyncQueries = this.asyncQueries = this.asyncQueries || [];
        while (asyncQueries.length)
            asyncQueries.pop(); // TODO cancel()

        var dimensions = this.props.dimensions;
        var filterByLevel = this.state.filterByLevel;   // are we selecting by subject or study
        var mdx = this.state.mdx;

        var intersectFilters = [];
        var studyFilter = null;
        var studySelectMembers = [];
        var d, i, dim;
        for (d in dimensions)
        {
            if (!dimensions.hasOwnProperty(d))
                continue;
            dim = dimensions[d];
            var filterMembers = dim.filters;
            if (d === 'Study')
            {
                // study filters come from three places * study facet * study subset * full-text search
                var studySubsetMembers = this.getStudySubsetMemberList();
                var studyFacetMembers = (!filterMembers || filterMembers.length === 0) ? dim.members : filterMembers;
                var studySearchMembers = (!this.state.searchStudyFilter || this.state.searchStudyFilter.length===0) ? dim.members : this.state.searchStudyFilter;

                studySelectMembers = this.intersectMembers(studySubsetMembers, studySearchMembers);
                filterMembers = this.intersectMembers(studySelectMembers, studyFacetMembers);

                if (filterMembers.length === 0)
                {
                    this.updateCountsZero();
                    return;
                }
                // apply studyFilter to the counts for all dimensions _except_ the study dimension
                var uniqueNames = filterMembers.map(function(m){return m.uniqueName||m;});
                if (filterByLevel !== "[Study].[Name]")
                    studyFilter = {
                        level: filterByLevel,
                        membersQuery: {level: "[Study].[Name]", members: uniqueNames}
                    };
                else
                    studyFilter = {level: "[Study].[Name]", members: uniqueNames};
            }
            else
            {
                if (!filterMembers || filterMembers.length === 0)
                    continue;
                if (dim.filterType === "OR")
                {
                    var names = [];
                    filterMembers.forEach(function (m)
                    {
                        names.push(m.uniqueName)
                    });
                    intersectFilters.push({
                        level: filterByLevel,
                        membersQuery: {level: filterMembers[0].level, members: names}
                    });
                }
                else
                {
                    for (i = 0; i < filterMembers.length; i++)
                    {
                        var filterMember = filterMembers[i];
                        intersectFilters.push({
                            level: filterByLevel,
                            membersQuery: {level: filterMember.level, members: [filterMember.uniqueName]}
                        });
                    }
                }
            }
        }

        var filters = intersectFilters;
        if (intersectFilters.length && filterByLevel !== "[Subject].[Subject]")
        {
            filters = [{
                level: "[Subject].[Subject]",
                membersQuery: {operator: "INTERSECT", arguments: intersectFilters}
            }]
        }

        // CONSIDER: Don't fetch subject IDs every time a filter is changed.
        var includeSubjectIds = true;
        var cellsetResults = [];
        var onRows;
        var mdxQueryComplete = function (cellSet, mdx, config)
        {
            cellsetResults.push(cellSet);
            if (cellsetResults.length === 2) {
                this.updateCountsUnion(cellsetResults);
            }
        };

        /** first query the study counts **/
        {
            onRows = {level: "[Study].[Name]", members:Ext4.pluck(studySelectMembers,"uniqueName")};
            mdx.query(
            {
                "sql": true,
                configId: 'ImmPort:/StudyCube',
                schemaName: 'ImmPort',
                name: 'StudyCube',
                success: mdxQueryComplete,
                scope: this,

                // query
                onRows: onRows,
                countFilter: filters,
                countDistinctLevel: '[Subject].[Subject]'
            });
        }

        /** Now all the other dimensions */
        {
            filters = [].concat(filters).concat([studyFilter]);
            onRows = { operator: "UNION", arguments: [] };
            for (d in dimensions)
            {
                if (!dimensions.hasOwnProperty(d))
                    continue;
                dim = dimensions[d];
                if (dim.name === "Subject")
                    onRows.arguments.push({level: dim.hierarchy.levels[0].uniqueName});
                else if (dim.name !== "Study")
                    onRows.arguments.push({level: dim.level.uniqueName});
            }

            if (includeSubjectIds)
                onRows.arguments.push({level: "[Subject].[Subject]", members: "members"});

            mdx.query(
            {
                "sql": true,
                configId: 'ImmPort:/StudyCube',
                schemaName: 'ImmPort',
                name: 'StudyCube',
                success: mdxQueryComplete,
                scope: this,

                // query
                onRows: onRows,
                countFilter: filters,
                countDistinctLevel: '[Subject].[Subject]'
            });
        }

        //$scope.$broadcast("updateCountsAsync");
    },

    updateCountsUnion : function (cellsetResults)
    {
        var dimensions = this.props.dimensions;
        var dimStudy = dimensions.Study;
        var subjects = this.state.subjects;
        var mapMemberCount = {};

        var dim, member, d, m;
        // map from hierarchyName to dataspace dimension
        var map = {};

        // clear old subjects and counts (to be safe)
        subjects.length = 0;
        for (d in dimensions)
        {
            if (!dimensions.hasOwnProperty(d))
                continue;
            dim = dimensions[d];
            map[dim.hierarchy.uniqueName] = dim;
            dim.summaryCount = 0;       // TODO
            dim.allMemberCount = 0;     // TODO
        }

        var hasStudyFilter = dimStudy.filters.length !== 0 && dimStudy.filters.length !== dimStudy.members.length;

        for (var cs=0 ; cs<cellsetResults.length ; cs++)
        {
            var cellSet = cellsetResults[cs];
            var positions = cellSetHelper.getRowPositionsOneLevel(cellSet);
            var data = cellSetHelper.getDataOneColumn(cellSet, 0);
            var max = 0;
            for (var i = 0; i < positions.length; i++)
            {
                var resultMember = positions[i];
                if (resultMember.level.uniqueName === "[Subject].[Subject]")
                {
                    subjects.push(resultMember.name);
                }
                else
                {
                    var hierarchyName = resultMember.level.hierarchy.uniqueName;
                    dim = map[hierarchyName];
                    var count = data[i];
                    member = dim.memberMap[resultMember.uniqueName];
                    mapMemberCount[resultMember.uniqueName] = {count:count, percent:null};
                    if (!member)
                    {
                        // might be an all member
                        if (dim.allMemberName === resultMember.uniqueName)
                            dim.allMemberCount = count;
                        else if (-1 === resultMember.uniqueName.indexOf("#") && "(All)" !== resultMember.name)
                            console.log("member not found: " + resultMember.uniqueName);
                    }
                    else if (dim === dimStudy)
                    {
                        // STUDY is weird because we're showing counts for non-selected studies...
                        if (count && (!hasStudyFilter || member.selected))
                            dim.summaryCount += 1;  // TODO
                        if (count > max)
                            max = count;
                    }
                    else
                    {
                        if (count)
                            dim.summaryCount += 1;  // TODO
                        if (count > max)
                            max = count;
                    }
                }
            }
        }

        for (d in dimensions)
        {
            if (!dimensions.hasOwnProperty(d)) continue;
            dim = dimensions[d];
            if (!dimensions.hasOwnProperty(d) || dim.name === "Study") continue;
            for (m = 0; m < dim.members.length; m++)
            {
                member = dim.members[m];
                var cnt = mapMemberCount[member.uniqueName];
                if (cnt)
                    cnt.percent = max === 0 ? 0 : (100.0 * cnt.count) / max;
            }
        }

        // $scope.saveFilterState();
        // $scope.updateContainerFilter();
        // if (!isSavedGroup)
        //     $scope.changeSubjectGroup();
        // $scope.doneRendering();
        this.setState({mapMemberCount:mapMemberCount, firstQuery:false});
    },

    updateCountsZero : function ()
    {
        var dimensions = this.props.dimensions;
        var subjects = this.state.subjects;

        subjects.length = 0;
        for (var d in dimensions)
        {
            if (!dimensions.hasOwnProperty(d)) continue;
            var dim = dimensions[d];
            dim.summaryCount = 0;
            dim.allMemberCount = 0;
            for (var m = 0; m < dim.members.length; m++)
            {
                dim.members[m].count = 0;
                dim.members[m].percent = 0;
            }
            dim.summaryCount = 0;
        }

        // TODO $scope.saveFilterState();
        // TODO $scope.updateContainerFilter();
        // TODO $scope.changeSubjectGroup();
        // TODO $scope.doneRendering();
        this.setState({mapMemberCount:{}, firstQuery:false});
        this.forceUpdate();
    }
});
