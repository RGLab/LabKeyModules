/* TODOs and BUGs

NOTE for save subject group, it doesn't make sense to save participantid's for non-loaded studies
  need to handle that.

*/

function dataFinder(studyData, loadedStudies, dataFinderAppId)
{
//
// study detail pop-up window
//   (TODO angularify)
//

    var detailWindows = {};
    var detailShowing = null;
    var timerDeferShow = null;

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
                console.log("warning rows have nested members");
                throw "illegal state";
            }
            return positions.map(function(inner){return inner[0]});
        },

        getData : function(cellSet,defaultValue)
        {
            var cells = cellSet.cells;
            var ret = cells.map(function(row)
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
            var ret = cells.map(function(row)
            {
                return row[0].value ? row[0].value : defaultValue;
            });
            return ret;
        }
    };

    function showPopup(targetId, dim, member)
    {
        hidePopup();

        var target;
        if (targetId)
            target = Ext4.get(targetId);
        if (targetId && !target)
            console.log("element not found: " + targetId);
        var detailWindow = detailWindows[member];
        if (!detailWindow)
        {
            detailWindow = Ext4.create('Ext.window.Window', {
                width: 800,
                height: 600,
                resizable: true,
                layout: 'fit',
                baseCls: 'study-detail',
                bodyCls: 'study-detail',
                autoScroll: true,
                loader: {
                    autoLoad: true,
                    url: 'immport-studyDetail.view?_frame=none&study=' + member
                }
            });
//        detailWindows[member] = detailWindow;
        }
        var viewScroll = Ext4.getBody().getScroll();
        var viewSize = Ext4.getBody().getViewSize();
        var region = [viewScroll.left, viewScroll.top, viewScroll.left + viewSize.width, viewScroll.top + viewSize.height];
        var proposedXY;
        if (target)
        {
            var targetXY = target.getXY();
            proposedXY = [targetXY[0] + target.getWidth() - 100, targetXY[1]];
        }
        else
        {
            proposedXY = [region[0] + viewSize.width / 2 - 400, region[1] + viewSize.height / 2 - 300];
        }
        proposedXY[1] = Math.max(region[1], Math.min(region[3] - 400, proposedXY[1]));
        detailWindow.setPosition(proposedXY);
        detailShowing = detailWindow;
        detailShowing.show();
    }

    function hidePopup()
    {
        if (timerDeferShow)
        {
            clearTimeout(timerDeferShow);
            timerDeferShow = null;
        }
        if (detailShowing)
        {
            detailShowing.hide();
            detailShowing.destroy();
            detailShowing = null;
        }
    }

    var dataFinderApp = angular.module('dataFinderApp', ['LocalStorageModule'])
    .config(function (localStorageServiceProvider)
    {
        localStorageServiceProvider.setPrefix("dataFinder." + LABKEY.container.id);
    });

    dataFinderApp
            .controller("SubjectGroupController", ['$scope', function($scope) {

        $scope.groupList = [];
        $scope.unsavedGroup = { id: null, label : "Unsaved Group"};
        $scope.currentGroup = $scope.unsavedGroup;
        $scope.saveOptions = [ {id: 'update', label : "Save", isActive: false}, {id : "saveNew", label : "Save As", isActive: true} ];

        $scope.saveSubjectGroup = function(option, $event) {

            $scope.closeMenu($event);

            var groupLabel = "";
            if (option == "update") {
                if ($scope.currentGroup.id == null)
                    return;

                var groupData = {
                    label : $scope.currentGroup.label,
                    participantIds : $scope.subjects,
                    categoryLabel : '',
                    categoryType : 'list',
                    filters: JSON.stringify($scope.localStorageService.get("filterSet")),
                    rowId : $scope.currentGroup.id
                };
                Ext4.Ajax.request({
                    url: (LABKEY.ActionURL.buildURL("participant-group", 'updateParticipantGroup.api')),
                    method: 'POST',
                    jsonData : groupData,
                    scope : this,
                    failure : function(response, options)
                    {
                        LABKEY.Utils.displayAjaxErrorResponse(response, options, false, "An error occurred trying to save:  ");
                    }
                });
            } else {
                var win = Ext4.create('Study.window.ParticipantGroup', {
                    subject: {
                        nounSingular: 'Subject',
                        nounPlural: 'Subjects',
                        nounColumnName: 'ParticipantId'
                    },
                    groupLabel: groupLabel,
                    participantIds: $scope.subjects,
                    filters: $scope.localStorageService.get("filterSet")
                });

                // Save the new participant group rowId as the session filter
                win.on('aftersave', function (data)
                {
                    $scope.$apply(function ()
                    {
                        if (data.success)
                        {
                            var group = data.group;
                            if (group.rowId)
                            {
                                LABKEY.Ajax.request({
                                    method: "POST",
                                    url: LABKEY.ActionURL.buildURL("participant-group", "sessionParticipantGroup.api"),
                                    jsonData: {
                                        rowId: group.rowId
                                    }
                                });
                                group = {
                                    "id": group.rowId,
                                    "label": group.label,
                                    "filters": group.filters == undefined ? [] : Ext4.decode(group.filters),
                                    "selected": true
                                };
                                $scope.groupList.push(group);
                                $scope.currentGroup = group;
                                $scope.updateSaveOptions();
                            }
                        }
                    });
                });
                win.show();
            }
        };

        $scope.applySubjectGroupFilter = function(group, $event)
        {
            $scope.closeMenu($event);

            $scope.clearAllFilters(false);

            for (var f in group.filters)
            {
                if (group.filters.hasOwnProperty(f))
                {
                    var filter = group.filters[f];

                    if (filter.name == "Study" && $scope.filterByLevel == "[Study].[Name]")
                        continue;

                    var dim = dataspace.dimensions[filter.name];

                    if (dim && filter.members.length > 0)
                    {
                        for (var i = 0; i < filter.members.length; i++)
                        {
                            var filteredName = filter.members[i];
                            var member = dim.memberMap[filteredName];
                            if (member)
                            {
                                member.selected = true;
                                dim.filters.push(member);
                            }
                        }
                        dim.filterType = filter.operator;
                    }
                }
            }
            $scope.updateCountsAsync(true);
            $scope.saveFilterState();
            $scope.updateCurrentGroup(group);
        };

        $scope.openMenu = function($event, isConfig)
        {
            if (isConfig || $scope.loadedStudiesShown())
            {
                var element = $event.target;
                while (element.parentElement && !element.className.includes('labkey-dropdown'))
                    element = element.parentElement;
                if (element.childElementCount < 2)
                    return;
                var menuElement = element.children[1];
                if (!menuElement.className.includes('labkey-dropdown-menu-active') && menuElement.className.includes('labkey-dropdown-menu'))
                {
                    menuElement.className = menuElement.className.concat(' labkey-dropdown-menu-active');
                }
            }
        };

        $scope.closeMenu = function($event, isConfig)
        {
            if (isConfig || $scope.loadedStudiesShown())
            {
                var element = $event.target;
                while (element.parentElement && !element.className.includes('labkey-dropdown-menu-active'))
                    element = element.parentElement;

                while (element.className.includes('labkey-dropdown-menu-active'))
                {
                    element.className = element.className.replace(' labkey-dropdown-menu-active', '');
                }
            }
        };

        $scope.updateCurrentGroup = function(newCurrent)
        {
            if ($scope.currentGroup.id == newCurrent.id)
                return;

            $scope.currentGroup = newCurrent;
            $scope.updateSaveOptions();

            if ($scope.currentGroup.id != null)
            {
                $scope.saveLoadedGroupInSession($scope.currentGroup.id);
                if ($scope.localStorageService.isSupported)
                    $scope.localStorageService.set("group", $scope.currentGroup);
            }
            else
            {
                $scope.saveParticipantIdGroupInSession($scope.subjects);
                if ($scope.localStorageService.isSupported)
                    $scope.localStorageService.remove("group");
            }

        };

        $scope.updateSaveOptions = function()
        {
            $scope.saveOptions[0].isActive = ($scope.currentGroup.id != null);
        };

        $scope.loadSubjectGroups = function ()
        {
            LABKEY.Ajax.request({
                url: LABKEY.ActionURL.buildURL('participant-group', 'browseParticipantGroups.api'),
                method: 'POST',
                jsonData : {
                    'distinctCatgories': false,
                    'type' : 'participantGroup',
                    'includeUnassigned' : false,
                    'includeParticipantIds' : false
                },
                scope: $scope,
                success : function(res)
                {
                    var json = Ext4.decode(res.responseText);
                    if (json.success)
                    {
                        var groups = [];
                        for (var i = 0; i < json.groups.length; i++)
                        {
                            if (json.groups[i].filters != undefined)
                            {
                                groups.push({
                                    "id": json.groups[i].id,
                                    "label": json.groups[i].label,
                                    "selected": false,
                                    "filters": Ext4.decode(json.groups[i].filters)
                                });
                            }
                        }
                        $scope.groupList = groups;
                    }
                }
            });
            var savedGroup = $scope.localStorageService.get("group");
            if (savedGroup != null) {
                $scope.updateCurrentGroup(savedGroup);
            }
        };

        $scope.saveParticipantIdGroupInSession = function (participantIds)
        {
            if ($scope.subjects.length == 0)
            {
                LABKEY.Ajax.request({
                    method: "DELETE",
                    url: LABKEY.ActionURL.buildURL("participant-group", "sessionParticipantGroup.api")
                });
            }
            else
            {
                LABKEY.Ajax.request({
                    method: "POST",
                    url: LABKEY.ActionURL.buildURL("participant-group", "sessionParticipantGroup.api"),
                    jsonData: {
                        participantIds: $scope.subjects
                    }
                });
            }
        };

        $scope.saveLoadedGroupInSession = function(groupId)
        {
            if (groupId != null)
            {
                LABKEY.Ajax.request({
                    method: "POST",
                    url: LABKEY.ActionURL.buildURL("participant-group", "sessionParticipantGroup.api"),
                    jsonData: {
                        rowId: groupId
                    }
                });
            }
        };

        $scope.$on("subjectGroupChanged", function(event, participantIds) {
           $scope.saveParticipantIdGroupInSession(participantIds);
        });

        $scope.$on("cubeReady", function(event) {
            $scope.loadSubjectGroups();
        });

        $scope.$on("filterSelectionCleared", function(event, hasFilters) {
            if (!hasFilters)
            {
                $scope.updateCurrentGroup($scope.unsavedGroup);
            }
        });

    }]);


    dataFinderApp
    .controller('dataFinder', function ($scope, $timeout, $http, localStorageService)
    {
        window.debug_scope = $scope;
        $scope.filterChoice = {
            show: false
        };
        $scope.subjects = [];
        $scope.timeout = $timeout;
        $scope.http = $http;
        $scope.localStorageService = localStorageService;
        $scope.isGuest = LABKEY.user.isGuest;

        $scope.cube = null;
        $scope.mdx = null;
        $scope.searchTerms = '';
        $scope.searchMessage = '';

        $scope.formatNumber = Ext4.util.Format.numberRenderer('0,000');
        $scope.downArrow = LABKEY.contextPath + "/_images/arrow_down.png";
        $scope.rightArrow = LABKEY.contextPath + "/_images/arrow_right.png";
        $scope.activeTab = "Studies";
        $scope.filterByLevel  = "[Subject].[Subject]";

        $scope.studySubset = "ImmuneSpace";
        if ($scope.localStorageService.isSupported && $scope.localStorageService.get("studySubset") != null)
            $scope.studySubset = $scope.localStorageService.get("studySubset");

        var studies = [];
        var loaded_study_list = [];
        var recent_study_list = [];
        var hipc_study_list = [];
        var unloaded_study_list = [];
        for (var i = 0; i < studyData.length; i++)
        {
            var name = studyData[i][0];
            var s =
            {
                'memberName': "[Study].[" + name + "]",
                'study_accession': name,
                'id': studyData[i][1], 'title': studyData[i][2], 'pi': studyData[i][3],
                'hipc_funded': false,
                'loaded': false,
                'url': null,
                'containerId': null
            };
            if (loadedStudies[name])
            {
                s.loaded = true;
                s.hipc_funded = loadedStudies[name].hipc_funded;
                s.highlight = loadedStudies[name].highlight;
                s.url = loadedStudies[name].url;
                s.containerId = loadedStudies[name].containerId;
                loaded_study_list.push(s.memberName);
                if (s.highlight)
                    recent_study_list.push(s.memberName);
                if (s.hipc_funded)
                    hipc_study_list.push(s.memberName);
            }
            else
            {
                unloaded_study_list.push(s.memberName);
            }
            studies.push(s);
        }

        $scope.subsetOptions = [];
        if (loaded_study_list.length > 0)
            $scope.subsetOptions.push({value: 'ImmuneSpace', name: 'ImmuneSpace studies' });
        if (recent_study_list.length > 0)
            $scope.subsetOptions.push({value: 'Recent', name: 'Recently added studies' });
        if (hipc_study_list.length > 0)
            $scope.subsetOptions.push({value: 'HipcFunded', name: 'HIPC funded studies' });
        if (unloaded_study_list.length > 0)
            $scope.subsetOptions.push({value: 'UnloadedImmPort', name: 'Unloaded ImmPort Studies'});
        //$scope.subsetOptions.push({value:'ImmPort',  name:'All ImmPort studies'});


        $scope.dataspace = dataspace;
        $scope.studies = studies;
        $scope.loaded_study_list = loaded_study_list;
        $scope.recent_study_list = recent_study_list;
        $scope.hipc_study_list = hipc_study_list;
        $scope.unloaded_study_list = unloaded_study_list;

        // shortcuts
        $scope.dimSubject = dataspace.dimensions.Subject;
        $scope.dimStudy = dataspace.dimensions.Study;
        $scope.dimCondition = dataspace.dimensions.Condition;
        $scope.dimSpecies = dataspace.dimensions.Species;
        $scope.dimPrincipal = dataspace.dimensions.Principal;
        $scope.dimGender = dataspace.dimensions.Gender;
        $scope.dimRace = dataspace.dimensions.Race;
        $scope.dimAge = dataspace.dimensions.Age;
        $scope.dimTimepoint = dataspace.dimensions.Timepoint;
        $scope.dimAssay = dataspace.dimensions.Assay;
        $scope.dimType = dataspace.dimensions.Type;
        $scope.dimCategory = dataspace.dimensions.Category;



        $scope.cube = LABKEY.query.olap.CubeManager.getCube({
            configId: 'ImmPort:/StudyCube',
            schemaName: 'ImmPort',
            name: 'StudyCube',
            deferLoad: false
        });
        $scope.cube.onReady(function (m)
        {
            $scope.$apply(function ()
            {
                $scope.mdx = m;
                $scope.initCubeMetaData();
                $scope.loadFilterState();

                // init study list according to studySubset
                if (loaded_study_list.length == 0)
                    $scope.studySubset = "UnloadedImmPort";
                $scope.onStudySubsetChanged();
                // doShowAllStudiesChanged() has side-effect of calling updateCountsAsync()
                //$scope.updateCountsAsync();
            });
        });

        localStorageService.bind($scope, 'searchTerms');


        $scope.initCubeMetaData = function ()
        {
            for (var name in dataspace.dimensions)
            {
                if (!dataspace.dimensions.hasOwnProperty(name))
                    continue;
                var dim = dataspace.dimensions[name];
                dim.hierarchy = $scope.cube.hierarchyMap[dim.hierarchyName];
                dim.level = dim.hierarchy.levelMap[dim.levelName];
                // using the cube objects directly makes angularjs debugging hard because of the pointers 'up' to level/hierarchy
                // so I'll copy them instead
                //        dim.members = dim.level.members;
                for (var m = 0; m < dim.level.members.length; m++)
                {
                    var src = dim.level.members[m];
                    if (src.name == "#notnull")
                        continue;
                    var member = {
                        name: src.name,
                        uniqueName: src.uniqueName,
                        selected: false,
                        level: src.level.uniqueName,
                        count: 0,
                        percent: 0,
                        filteredCount: -1,
                        selectedCount: -1
                    };
                    dim.members.push(member);
                    dim.memberMap[member.uniqueName] = member;
                }
            }
        };

        $scope.countForStudy = function (study)
        {
            var uniqueName = study.memberName || study.uniqueName;
            var studyMember = dataspace.dimensions.Study.memberMap[uniqueName];
            return studyMember ? studyMember.count : 0;
        };

        $scope.anyVisibleStudies = function ()
        {
            var members = dataspace.dimensions.Study.members;
            for (var m = 0; m < members.length; m++)
                if (members[m].count)
                    return true;
            return false;
        };

        $scope.loadedStudiesShown = function ()
        {
            return $scope.studySubset != 'UnloadedImmPort';
        };

        $scope.hasFilters = function ()
        {
            for (var d in dataspace.dimensions)
            {
                if (!dataspace.dimensions.hasOwnProperty(d))
                    continue;
                if (d == "Study")
                    continue;
                var filterMembers = dataspace.dimensions[d].filters;
                if (filterMembers && filterMembers.length > 0)
                    return true;
            }
            return false;
        };

        $scope.dimensionHasFilter = function (dim)
        {
            return (dim.filters && dim.filters.length) ? true : false;
        };

        $scope.toggleFilterChoiceDisplay = function()
        {
            $scope.filterChoice.show = !$scope.filterChoice.show;
        };

        $scope.displayFilterChoice = function (dimName, $event)
        {
            var dim = dataspace.dimensions[dimName];
            if (!dim || dim.filterOptions.length < 2)
                return;
            var locationElement = $event.target;
            if ($event.target.className.includes('fa-caret'))
                locationElement = $event.target.parentElement;
            var xy = Ext4.fly(locationElement).getXY();
            $scope.filterChoice =
            {
                show: true,
                dimName: dimName,
                x: xy[0],
                y: xy[1],
                options: dim.filterOptions
            };
            if ($event.stopPropagation)
                $event.stopPropagation();
        };

        $scope.setFilterType = function (dimName, type)
        {
            $scope.filterChoice.show = false;
            var dim = dataspace.dimensions[dimName];
            if (!dim)
                return;
            if (dim.filterType === type)
                return;
            for (var f = 0; f < dim.filterOptions.length; f++)
            {
                if (dim.filterOptions[f].type == type)
                {
                    dim.filterType = type;
                    dim.filterCaption = dim.filterOptions[f].caption;
                    $scope.updateCountsAsync();
                    return;
                }
            }
        };

        $scope.selectMember = function (dimName, member, $event)
        {
            var shiftClick = $event && ($event.ctrlKey || $event.altKey || $event.metaKey);
            $scope._selectMember(dimName, member, $event, shiftClick);
        };

        $scope.toggleMember = function (dimName, member, $event)
        {
            $scope._selectMember(dimName, member, $event, true);
        };

        $scope._selectMember = function (dimName, member, $event, shiftClick)
        {
            var dim = dataspace.dimensions[dimName];
            var filterMembers = dim.filters;
            var m;

            if (!member)
            {
                if (0 == filterMembers.length)  // no change
                    return;
                $scope._clearFilter(dimName);
            }
            else if (!shiftClick)
            {
                $scope._clearFilter(dimName);
                dim.filters = [member];
                member.selected = true;
            }
            else
            {
                var index = -1;
                for (m = 0; m < filterMembers.length; m++)
                {
                    if (member.uniqueName == filterMembers[m].uniqueName)
                        index = m;
                }
                if (index == -1) // unselected -> selected
                {
                    filterMembers.push(member);
                    member.selected = true;
                }
                else // selected --> unselected
                {
                    filterMembers.splice(index, 1);
                    member.selected = false;
                    $scope.$broadcast("filterSelectionCleared", $scope.hasFilters());
                }
            }

            $scope.updateCountsAsync();
            if ($event.stopPropagation)
                $event.stopPropagation();
        };

        $scope.clearAllFilters = function (updateCounts)
        {
            for (var d in dataspace.dimensions)
            {
                if (!dataspace.dimensions.hasOwnProperty(d))
                    continue;
                if (d == "Study")
                    continue;
                $scope._clearFilter(d);
            }
            if (updateCounts)
                $scope.updateCountsAsync();
            $scope.$broadcast("filterSelectionCleared", false);
        };

        $scope._clearFilter = function (dimName)
        {
            var dim = dataspace.dimensions[dimName];
            var filterMembers = dim.filters;
            for (var m = 0; m < filterMembers.length; m++)
                filterMembers[m].selected = false;
            dim.filters = [];
            $scope.$broadcast("filterSelectionCleared", $scope.hasFilters());
        };


        $scope.removeFilterMember = function (dim, member)
        {
            if (!dim || 0 == dim.filters.length) //  0 == dataspace.filters[dim.name].length)
                return;
            var filterMembers = dim.filters; // dataspace.filters[dim.name];
            var index = -1;
            for (var i = 0; i < filterMembers.length; i++)
            {
                if (member.uniqueName == filterMembers[i].uniqueName)
                    index = i;
            }
            if (index == -1)
                return;
            filterMembers[index].selected = false;
            filterMembers.splice(index, 1);
            $scope.updateCountsAsync();
        };

        $scope.updateCountsAsync = function (isSavedGroup)
        {
            var intersectFilters = [];
            var d, i, dim;
            for (d in dataspace.dimensions)
            {
                if (!dataspace.dimensions.hasOwnProperty(d))
                    continue;
                dim = dataspace.dimensions[d];
                var filterMembers = dim.filters;
                if (d == 'Study')
                {
                    if (!filterMembers || filterMembers.length == dim.members.length)
                        continue;
                    if (filterMembers.length == 0)
                    {
                        // in the case of study filter, this means no matches, rather than no filter!
                        $scope.updateCountsZero();
                        return;
                    }
                    var uniqueNames = filterMembers.map(function(m){return m.uniqueName;});
                    if ($scope.filterByLevel != "[Study].[Name]")
                        intersectFilters.push({
                            level: $scope.filterByLevel,
                            membersQuery: {level: "[Study].[Name]", members: uniqueNames}
                        });
                    else
                        intersectFilters.push({level: "[Study].[Name]", members: uniqueNames});
                }
                else
                {
                    if (!filterMembers || filterMembers.length == 0)
                        continue;
                    if (dim.filterType === "OR")
                    {
                        var names = [];
                        filterMembers.forEach(function (m)
                        {
                            names.push(m.uniqueName)
                        });
                        intersectFilters.push({
                            level: $scope.filterByLevel,
                            membersQuery: {level: filterMembers[0].level, members: names}
                        });
                    }
                    else
                    {
                        for (i = 0; i < filterMembers.length; i++)
                        {
                            var filterMember = filterMembers[i];
                            intersectFilters.push({
                                level: $scope.filterByLevel,
                                membersQuery: {level: filterMember.level, members: [filterMember.uniqueName]}
                            });
                        }
                    }
                }
            }

            var filters = intersectFilters;
            if (intersectFilters.length && $scope.filterByLevel != "[Subject].[Subject]")
            {
                filters = [{
                    level: "[Subject].[Subject]",
                    membersQuery: {operator: "INTERSECT", arguments: intersectFilters}
                }]
            }

            // CONSIDER: Don't fetch subject IDs every time a filter is changed.
            var includeSubjectIds = true;

            var onRows = { operator: "UNION", arguments: [] };
            for (d in dataspace.dimensions)
            {
                if (!dataspace.dimensions.hasOwnProperty(d))
                    continue;
                dim = dataspace.dimensions[d];
                if (dim.name == "Subject")
                    onRows.arguments.push({level: dim.hierarchy.levels[0].uniqueName});
                else if (dim.name == "Study" && $scope.filterByLevel == "[Study].[Name]")
                    continue;
                else
                    onRows.arguments.push({level: dim.level.uniqueName});
            }

            if (includeSubjectIds)
                onRows.arguments.push({level: "[Subject].[Subject]", members: "members"});

            var config =
            {
                "sql": true,
                configId: 'ImmPort:/StudyCube',
                schemaName: 'ImmPort',
                name: 'StudyCube',
                success: function (cellSet, mdx, config)
                {
                    // use angular timeout() for its implicit $scope.$apply()
                    //                config.scope.timeout(function(){config.scope.updateCounts(config.dim, cellSet);},1);
                    config.scope.timeout(function ()
                    {
                        config.scope.updateCountsUnion(cellSet, isSavedGroup);
                        $scope.$broadcast("cubeReady");
                    }, 1);
                },
                scope: $scope,

                // query
                onRows: onRows,
                countFilter: filters,
                countDistinctLevel: '[Subject].[Subject]'
            };
            $scope.mdx.query(config);
        };

        $scope.updateCountsZero = function ()
        {
            for (d in dataspace.dimensions)
            {
                if (!dataspace.dimensions.hasOwnProperty(d))
                    continue;
                var dim = dataspace.dimensions[d];
                dim.summaryCount = 0;
                for (var m = 0; m < dim.members.length; m++)
                {
                    dim.members[m].count = 0;
                    dim.members[m].percent = 0;
                }
                dim.summaryCount = 0;
            }

            $scope.saveFilterState();
            $scope.updateContainerFilter();
            $scope.changeSubjectGroup();
            $scope.doneRendering();
        };


        $scope.updateCounts = function (dim, cellSet)
        {
            var member, m;
            var memberMap = dim.memberMap;
            var max = 0;
            dim.summaryCount = 0;
            for (m = 0; m < dim.members.length; m++)
            {
                dim.members[m].count = 0;
            }

            var positions = cellSetHelper.getRowPositionsOneLevel(cellSet);
            var data = cellSetHelper.getDataOneColumn(cellSet, 0);
            for (var i = 0; i < positions.length; i++)
            {
                var uniqueName = positions[i].uniqueName;
                var count = data[i];
                member = memberMap[uniqueName];
                member.count = count;
                if (count > max)
                    max = count;
                dim.summaryCount += 1;
            }
            for (m = 0; m < dim.members.length; m++)
            {
                member = dim.members[m];
                dim.members[m].percent = max == 0 ? 0 : (100.0 * member.count) / max;
            }

            $scope.saveFilterState();
            $scope.updateContainerFilter();
            $scope.doneRendering();
        };


        /* handle query response to update all the member counts with all filters applied */
        $scope.updateCountsUnion = function (cellSet, isSavedGroup)
        {
            var dim, member, d, m;
            // map from hierarchyName to dataspace dimension
            var map = {};

            // clear old subjects and counts (to be safe)
            $scope.subjects.length = 0;
            for (d in dataspace.dimensions)
            {
                if (!dataspace.dimensions.hasOwnProperty(d))
                    continue;
                dim = dataspace.dimensions[d];
                map[dim.hierarchy.uniqueName] = dim;
                dim.summaryCount = 0;
                dim.allMemberCount = 0;
                for (m = 0; m < dim.members.length; m++)
                {
                    member = dim.members[m];
                    member.count = 0;
                    member.percent = 0;
                }
            }

            var positions = cellSetHelper.getRowPositionsOneLevel(cellSet);
            var data = cellSetHelper.getDataOneColumn(cellSet, 0);
            var max = 0;
            for (var i = 0; i < positions.length; i++)
            {
                var resultMember = positions[i];
                if (resultMember.level.uniqueName == "[Subject].[Subject]")
                {
                    $scope.subjects.push(resultMember.name);
                }
                else
                {
                    var hierarchyName = resultMember.level.hierarchy.uniqueName;
                    dim = map[hierarchyName];
                    var count = data[i];
                    member = dim.memberMap[resultMember.uniqueName];
                    if (!member)
                    {
                        // might be an all member
                        if (dim.allMemberName == resultMember.uniqueName)
                            dim.allMemberCount = count;
                        else if (-1 == resultMember.uniqueName.indexOf("#") && "(All)" != resultMember.name)
                            console.log("member not found: " + resultMember.uniqueName);
                    }
                    else
                    {
                        member.count = count;
                        if (count)
                            dim.summaryCount += 1;
                        if (count > max)
                            max = count;
                    }
                }
            }

            for (d in dataspace.dimensions)
            {
                dim = dataspace.dimensions[d];
                map[dim.hierarchy.uniqueName] = dim;
                for (m = 0; m < dim.members.length; m++)
                {
                    member = dim.members[m];
                    member.percent = max == 0 ? 0 : (100.0 * member.count) / max;
                }
            }

            $scope.saveFilterState();
            $scope.updateContainerFilter();
            if (!isSavedGroup)
                $scope.changeSubjectGroup();
            $scope.doneRendering();
        };

        $scope.doneRendering = function ()
        {
            if (loadMask)
            {
                Ext4.get(dataFinderAppId).removeCls("x-hidden");
                loadMask.hide();
                loadMask = null;
                LABKEY.help.Tour.autoShow('immport.dataFinder');
            }

            LABKEY.Utils.signalWebDriverTest('dataFinderCountsUpdated');
        };

        $scope.clearStudyFilter = function ()
        {
            $scope.setStudyFilter($scope.getStudySubsetList());
        };


        $scope.getStudySubsetList = function ()
        {
            if ($scope.studySubset == "ImmuneSpace")
                return $scope.loaded_study_list;
            if ($scope.studySubset == "Recent")
                return $scope.recent_study_list;
            if ($scope.studySubset == "HipcFunded")
                return $scope.hipc_study_list;
            if ($scope.studySubset == "UnloadedImmPort")
                return $scope.unloaded_study_list;
            return Ext4.pluck($scope.dimStudy.members, 'uniqueName');
        };


        $scope.setStudyFilter = function (studies)
        {
            var dim = $scope.dimStudy;
            $scope._clearFilter(dim.name);
            var filterMembers = dim.filters;

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
            $scope.updateCountsAsync();
        };


        $scope.onStudySubsetChanged = function ()
        {
            if ($scope.localStorageService.isSupported)
                $scope.localStorageService.add("studySubset", $scope.studySubset);
            // if there are search terms, just act as if the search terms have changed
            if ($scope.searchTerms)
            {
                $scope.onSearchTermsChanged();
            }
            else
            {
                $scope.clearStudyFilter();
            }
        };

        $scope.doSearchTermsChanged_promise = null;

        $scope.doSearchTermsChanged = function ()
        {
            if ($scope.doSearchTermsChanged_promise)
            {
                // UNDONE:cancel doesn't seem to really be supported for $http
                //$scope.http.cancel($scope.doSearchTermsChanged_promise);
            }

            if (!$scope.searchTerms)
            {
                $scope.searchMessage = "";
                $scope.clearStudyFilter();
                return;
            }

            var scope = $scope;
            var url = LABKEY.ActionURL.buildURL("search", "json", LABKEY.containerPath, {
                "category": "immport_study",
                "scope": "site",
                "q": $scope.searchTerms
            });
            var promise = $scope.http.get(url);
            $scope.doSearchTermsChanged_promise = promise;
            promise.success(function (data)
            {
                // NOOP if we're not current (poor man's cancel)
                if (promise != $scope.doSearchTermsChanged_promise)
                    return;
                $scope.doSearchTermsChanged_promise = null;
                var hits = data.hits;
                var searchStudies = [];
                var found = {};
                for (var h = 0; h < hits.length; h++)
                {
                    var id = hits[h].id;
                    var accession = id.substring(id.lastIndexOf(':') + 1);
                    if (found[accession])
                        continue;
                    found[accession] = true;
                    searchStudies.push("[Study].[" + accession + "]");
                }
                if (!searchStudies.length)
                {
                    $scope.setStudyFilter(searchStudies);
                    $scope.searchMessage = 'No studies match your search criteria';
                }
                else
                {
                    $scope.searchMessage = '';
                    // intersect with study subset list
                    var result = $scope.intersect(searchStudies, $scope.getStudySubsetList());
                    if (!result.length)
                        $scope.searchMessage = 'No studies match your search criteria';
                    $scope.setStudyFilter(result);
                }
            });
        };

        $scope.intersect = function (a, b)
        {
            var o = {}, ret = [], i;
            for (i = 0; i < a.length; i++)
                o[a[i]] = a[i];
            for (i = 0; i < b.length; i++)
                if (o[b[i]])
                    ret.push(b[i]);
            return ret;
        };

        $scope.onSearchTermsChanged_promise = null;

        $scope.onSearchTermsChanged = function ()
        {
            if (null != $scope.onSearchTermsChanged_promise)
                $scope.timeout.cancel($scope.onSearchTermsChanged_promise);
            $scope.onSearchTermsChanged_promise = $scope.timeout(function ()
            {
                $scope.doSearchTermsChanged();
            }, 500);
        };

        // save just the filtered uniqueNames for each dimension into local storage
        $scope.saveFilterState = function ()
        {
            if (!$scope.localStorageService.isSupported)
                return;

            var filterSet = {};
            for (var d in dataspace.dimensions)
            {
                if (!dataspace.dimensions.hasOwnProperty(d))
                    continue;
                if (d == "Study" && $scope.filterByLevel == "[Study].[Name]")
                    continue;

                var dim = dataspace.dimensions[d];
                var filterMembers = dim.filters;
                if (filterMembers && filterMembers.length > 0)
                {
                    var filteredNames = [];
                    for (var i = 0; i < filterMembers.length; i++)
                    {
                        filteredNames.push(filterMembers[i].uniqueName);
                    }
                    filterSet[dim.name] = {
                        "name" : dim.name,
                        "members" : filteredNames,
                        "operator" : dataspace.dimensions[d].filterType
                    };
                }
            }
            if (filterSet.length == 0)
                $scope.localStorageService.remove("filterSet");
            else
                $scope.localStorageService.set("filterSet", filterSet);

        };

        // load the filtered uniqueNames and the operators for each dimension from local storage
        $scope.loadFilterState = function ()
        {
            if (!$scope.localStorageService.isSupported)
                return;

            var filterSet = $scope.localStorageService.get("filterSet");
            if (filterSet)
            {
                for (var f in filterSet)
                {
                    if (filterSet.hasOwnProperty(f))
                    {
                        var filter = filterSet[f];
                        var dim = dataspace.dimensions[f];
                        if (filter && filter.members.length)
                        {
                            for (var i = 0; i < filter.members.length; i++)
                            {
                                var filteredName = filter.members[i];
                                var member = dim.memberMap[filteredName];
                                if (member)
                                {
                                    member.selected = true;
                                    dim.filters.push(member);
                                }
                            }
                            dim.filterType = filter.operator;
                        }
                    }
                }
            }
        };

        $scope.updateContainerFilter = function ()
        {
            // Collect the container ids of the loaded studies
            var dim = dataspace.dimensions.Study;
            var containers = [];
            for (var name in loadedStudies)
            {
                if (!loadedStudies.hasOwnProperty(name))
                    continue;
                var study = loadedStudies[name];
                var count = $scope.countForStudy(study);
                if (count)
                    containers.push(study.containerId);
            }

            if (containers.length == 0 || containers.length == $scope.loaded_study_list.length)
            {
                // Delete the shared container filter if all loaded_studies are selected
                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL('study-shared', 'sharedStudyContainerFilter.api'),
                    method: 'DELETE'
                });
            }
            else
            {
                LABKEY.Ajax.request({
                    url: LABKEY.ActionURL.buildURL('study-shared', 'sharedStudyContainerFilter.api'),
                    method: 'POST',
                    jsonData: {containers: containers}
                });
            }
        };

        $scope.showStudyPopup = function (study_accession)
        {
            showPopup(null, 'study', study_accession);
        };

        $scope.changeSubjectGroup = function ()
        {
            $scope.$broadcast("subjectGroupChanged", $scope.subjects);
        };

        $scope.showCreateStudyDialog = function()
        {
            window.alert("NYI: Create Study Dialog");
        };

    });


    var dataspace =
    {
        dimensions:
        {
            "Study":
            {
                name: 'Study', pluralName: 'Studies', hierarchyName: 'Study', levelName: 'Name', allMemberName: '[Study].[(All)]', popup: true,
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            },
            "Condition":
            {
                name: 'Condition', hierarchyName: 'Study.Conditions', levelName: 'Condition', allMemberName: '[Study.Conditions].[(All)]',
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            },
            "Assay":
            {
                name: 'Assay', hierarchyName: 'Assay', levelName: 'Assay', allMemberName: '[Assay].[(All)]',
                filterType: "AND", filterOptions: [{type: "OR", caption: "data for any of these"}, { type: "AND", caption: "data for all of these"}]
            },
            "Type":
            {
                name: 'Type', hierarchyName: 'Study.Type', levelName: 'Type', allMemberName: '[Study.Type].[(All)]',
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            },
            "Category":
            {
                caption: 'Research focus', name: 'Category', hierarchyName: 'Study.Category', levelName: 'Category', allMemberName: '[Study.Category].[(All)]',
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            },
            "Timepoint":
            {
                caption: 'Day of Study', name: 'Timepoint', hierarchyName: 'Timepoint.Timepoints', levelName: 'Timepoint', allMemberName: '[Timepoint.Timepoints].[(All)]',
                filterType: "AND", filterOptions: [{type: "OR", caption: "has data for any of"}, { type: "AND", caption: "has data for all of"}]
            },
            "Race":
            {
                name: 'Race', hierarchyName: 'Subject.Race', levelName: 'Race', allMemberName: '[Subject.Race].[(All)]',
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            },
            "Age":
            {
                name: 'Age', hierarchyName: 'Subject.Age', levelName: 'Age', allMemberName: '[Subject.Age].[(All)]',
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            },
            "Gender":
            {
                name: 'Gender', hierarchyName: 'Subject.Gender', levelName: 'Gender', allMemberName: '[Subject.Gender].[(All)]',
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            },
            "Species":
            {
                name: 'Species', pluralName: 'Species', hierarchyName: 'Subject.Species', levelName: 'Species', allMemberName: '[Subject.Species].[(All)]',
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            },
            "Principal":
            {
                name: 'Principal', pluralName: 'Species', hierarchyName: 'Study.Principal', levelName: 'Principal', allMemberName: '[Study.Principal].[(All)]',
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            },
            "Subject":
            {
                name: 'Subject', hierarchyName: 'Subject', levelName: 'Subject', allMemberName: '[Subject].[(All)]',
                filterType: "OR", filterOptions: [{type: "OR", caption: "is any of"}]
            }
        }
    };
    for (var p in dataspace.dimensions)
    {
        var dim = dataspace.dimensions[p];
        Ext4.apply(dim, {members: [], memberMap: {}, filters: [], summaryCount: 0, allMemberCount: 0});
        dim.pluralName = dim.pluralName || dim.name + 's';
        dim.filterType = dim.filterType || "OR";
        for (var f = 0; f < dim.filterOptions.length; f++)
        {
            if (dim.filterOptions[f].type == dim.filterType)
                dim.filterCaption = dim.filterOptions[f].caption;
        }
    }

    var loadMask = null;

    Ext4.onReady(function ()
    {
        loadMask = new Ext4.LoadMask(Ext4.get(dataFinderAppId), {msg: "Loading study definitions..."});
        loadMask.show();
    });
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
    if (offsetX == undefined || offsetX == null)
        offsetX = 35;
    if (offsetY == undefined || offsetY == null)
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

if (!String.prototype.includes) {
    String.prototype.includes = function() {'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}
