(function(){
    var page = (LABKEY.ActionURL.getController() + "-" + LABKEY.ActionURL.getAction()).toLowerCase();
    var isStudyFolder = LABKEY.moduleContext.study && LABKEY.moduleContext.study.timepointType;
    var isPortalPage = page == 'project-begin';
    var isHomePage = LABKEY.container.path == '/home';

    if (isStudyFolder && isPortalPage){
        LABKEY.Utils.onReady(function(){

            LABKEY.help.Tour.register({

                id: "immport-study-tour",
                steps: [
                    {
                        title: "Overview page",
                        content: "Overall information about the study.",
                        target: ".tab-nav-active",
                        placement: "left",
                        yOffset: -10,
                        xOffset: 20,
                        showNextButton: true,
                    },{
                        title: "Study overview",
                        content: "Overall summary about the study, objectives, protocols, conditions studied, etc.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Pubmed statistics",
                        content: "List of publications associated with this study as well as related papers suggested by PubMed.",
                        target: document.getElementsByClassName("labkey-wp")[1],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Subjects",
                        content: "Click on this tab to find out more about the subjects enrolled in this study.",
                        target: document.getElementsByClassName("tab-nav-inactive")[0],
                        placement: "left",
                        yOffset: -10,
                        xOffset: 20,
                        multipage: true,
                        showNextButton: true,
                        onNext: function(){
                            LABKEY.help.Tour.continueAtLocation("?pageId=study.PARTICIPANTS");
                        }
                    },{
                        title: "Subject List",
                        content: "Lists all study participants. Clicking one of the subjects ID brings up information about the selected subject.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Demographics table",
                        content: "Table of basic demographics. It can be sorted and filtered to explore demographic data for all subjects enrolled in the study.",
                        target: document.getElementsByClassName("labkey-wp")[1],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Clinical and Assay Data",
                        content: "Click on this tab to find out more about the datasets generated in this study.",
                        target: document.getElementsByClassName("tab-nav-inactive")[1],
                        placement: "left",
                        yOffset: -10,
                        xOffset: 10,
                        multipage: true,
                        showNextButton: true,
                        onNext: function(){
                            LABKEY.help.Tour.continueAtLocation("?pageId=study.DATA_ANALYSIS");
                        }
                    },{
                        title: "Data Views",
                        content: "The list of datasets available for this study. Click on a dataset name to explore the data in a grid.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Visualization",
                        content: "Selected datasets can be explored using the Data Explorer module.",
                        target: document.getElementsByClassName("labkey-wp")[1],
                        placement: "left",
                        showNextButton: true
                    },{
                        title: "Modules",
                        content: "Click on this tab to explore the datasets using standardized analyses modules.",
                        target: document.getElementsByClassName("tab-nav-inactive")[3],
                        placement: "left",
                        yOffset: -10,
                        xOffset: 10,
                        multipage: true,
                        showNextButton: true,
                        onNext: function(){
                            LABKEY.help.Tour.continueAtLocation("?pageId=Modules");
                        }
                    },{
                        title: "Active Modules",
                        content: "List of active interactive modules available for this study. The list will vary depending on the data available and the type of study.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top",
                        showNextButton: true
                    },{
                        title: "Reports",
                        content: "Click on this tab to explore additional analyses/reports.",
                        target: document.getElementsByClassName("tab-nav-inactive")[4],
                        placement: "left",
                        yOffset: -10,
                        xOffset: 10,
                        multipage: true,
                        showNextButton: true,
                        onNext: function(){
                            LABKEY.help.Tour.continueAtLocation("?pageId=Reports");
                        }
                    },{
                        title: "Available reports",
                        content: "List of available reports for this study. The list vary depending on the data available and the type of study. Reports can be generic or tailored to the study.",
                        target: document.getElementsByClassName("labkey-wp")[0],
                        placement: "top"
                    }
                ]

            });

            var pageId = ('#' + (LABKEY.ActionURL.getParameter("pageId") || '')).toLowerCase();
            if (pageId == '#')
                LABKEY.help.Tour.autoShow("immport-study-tour");
                //LABKEY.help.Tour.show("immport-study-tour");
            else
                LABKEY.help.Tour.continueTour();
        });
    }


  if (isHomePage){
    LABKEY.Utils.onReady(function(){
      LABKEY.help.Tour.register({
        id: "immport-home-tour",
        steps: [{
              title: "Getting started",
              content: "Links to the Study Finder, the Tutorial page and the Support board.",
              target: document.getElementsByClassName("labkey-main-menu-item")[0],
              yOffset: -20,
              placement: "right",
              showNextButton: true
        },{
              title: "Announcements",
              content: "News from the ImmuneSpace team and the HIPC project. New features and package releases will be announced here.",
              target: document.getElementsByClassName("labkey-wp")[0],
              placement: "top",
              showNextButton: true
        },{
              title: "Quick links",
              content: "Direct access to useful places on ImmuneSpace as well as external resources and documentation.",
              target: document.getElementsByClassName("labkey-wp")[2],
              yOffset: -20,
              placement: "left",
              showNextButton: true
        },{
              title: "Tutorials",
              content: "Resources to learn how to use ImmuneSpace and LabKey.",
              target: document.getElementById("TutorialsTab"),
              yOffset: -20,
              placement: "left",
              showNextButton: true,
              multipage: true,
              onNext: function(){
                  LABKEY.help.Tour.continueAtLocation("?pageId=Tutorials");
              }
        },{
              title: "About",
              content: "An overview of the ImmuneSpace project.",
              target: document.getElementById("AboutTab"),
              yOffset: -20,
              placement: "left",
              multipage: true,
              showNextButton: true,
              onNext: function(){
                  LABKEY.help.Tour.continueAtLocation("?pageId=About");
              }
        },{
              title: "Home",
              content: "Click the Home button to get back to the home page.",
              target: document.getElementsByClassName("labkey-folder-title")[0],
              yOffset: -20,
              placement: "right"
        }]
      });
      var pageId = ('#' + (LABKEY.ActionURL.getParameter("pageId") || '')).toLowerCase(); //make sure we only display it from the dashboard tab
      if (pageId == '#')
        LABKEY.help.Tour.autoShow("immport-home-tour");
        //LABKEY.help.Tour.show("immport-home-tour");
      else
        LABKEY.help.Tour.continueTour();
    });
  }

   

})();

