var GSEATour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-gsea-tour',
        steps: [{
            title: 'Gene Set Enrichment Analysis tour',
            content: 'The following few steps will take you through the UI elements of the Gene Set Enrichment Analysis module',
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
            content: 'Select a cohort and a set of modules. Only cohort with gene expression data will be available in the dropdown.',
            target: $('.x-fieldset-header-text')[0],
            placement: 'top',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'View',
            content: 'After hitting the <b>RUN</b> button, the report will be rendered here.',
            target: $('.x-tab-strip-inner')[1],
            placement: 'bottom',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'About',
            content: 'This tab contains a short description of the module, some technical details and information about the author(s).',
            target: $('.x-tab-strip-inner')[2],
            placement: 'bottom',
            showPrevButton: true,
            showNextButton: true
        },{
            title: 'Help',
            content: 'Finally, for more information about the modules used and external links, click the Help tab.',
            target: $('.x-tab-strip-inner')[3],
            placement: 'bottom'
        }]
    }); 
};
