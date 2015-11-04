var GEETour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-gee-tour',
        steps: [{
            title: 'Gene Expression Explorer Tour',
            content: 'The following few steps will take you through the UI elements of the Gene Expression Explorer module.',
            target: $('.labkey-wp-title-text')[0],
            placement: 'top',
            showNextButton: true
        },{
            title: 'Input',
            content: 'This is the main tab, where the parameters are set and the plot will be rendered.',
            target: $('.x-tab-strip-inner')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Parameters',
            content: 'Select a timepoint, a cohort and <b>one or more genes</b> from the dropdowns.\
                Only timepoints and cohorts with both HAI and gene expression data will show up in the dropdown.<br>\
                Note that the dropdowns are searchable, e.g: typing "IFNG" in the Genes field will return the matching genes available on the array.<br>\
                Normalize to baseline will substract Day 0 response after log transformation.',
            target: $('.x-fieldset-header-text')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Additional Options',
            content: 'Customize the plot using additional options. This also lets you map aesthetics of the plot to demographics (e.g: color based on the age of the participants).', 
            target: $('.x-fieldset-header-text')[1],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{ 
            title: 'Data Grid',
            content: 'After selecting appropriate input parameters, click this tab to see the grid. There, the data can be filtered like in any other data grid and only the selected rows will be shown in the resulting plot.',
            target: $('.x-tab-strip-inner')[1],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{ 
            title: 'About',
            content: 'This tab contains a short description of the module, some technical details and information about the author(s).',
            target: $('.x-tab-strip-inner')[2],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Help',
            content: 'Finally, for more information and detailed parameter description, click the Help tab.',
            target: $('.x-tab-strip-inner')[3],
            placement: 'top',
            showPrevButton: true,
        }]
    });
};

