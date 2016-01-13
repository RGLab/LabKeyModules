var IRPTour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-irp-tour',
        steps: [{
            title: 'Immune Response Predictor Tour',
            content: 'The following few steps will take you through the UI elements of the Immune Response Predictor module.',
            target: $('.labkey-wp-title-text')[0],
            placement: 'top',
            showNextButton: true
        },{
            title: 'Input',
            content: 'This is the main tab, where the parameters are set.',
            target: $('.x-tab-strip-inner')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Parameters',
            content: 'Select a timepoint and cohorts. The number of cohorts with gene expression at a given timepoint is indicated in parenthesis.\
                The response can also be dichotomized to split patients between responders and non-responders.',
            target: $('.x-fieldset-header-text')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Additional Options',
            content: 'These options are used for filtering the predicting features.\
                If the number of features is too low, consider lowering or removing the fold change threshold. <br>\
                By default, the entire array is used, the second option can limit the features to differentially expressed genes.\
                Note that these options are not available when using baseline as a predictor.',
            target: $('.x-fieldset-header-text')[1],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'View',
            content: 'After hitting the <b>RUN</b> button, the report will be rendered here.',
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
            content: 'Finally, for more information and a detailed description of the parameters and the output, click the Help tab',
            target: $('.x-tab-strip-inner')[3],
            placement: 'top',
            showPrevButton: true
        }]
    }); 
};
