var DETour = function(){
    LABKEY.help.Tour.register({
        id: 'immport-dataexplorer-tour',
        steps: [{
            title: 'Welcome to Data Explorer',
            content: 'First',
            target: $('.x-fieldset-header-text')[0],
            placement: 'bottom',
            showNextButton: true
        }]
    });
};

