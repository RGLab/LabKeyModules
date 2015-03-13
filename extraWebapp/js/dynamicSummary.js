$(document).ready(function() {
    var me = this;

    me.onFailure = function(){
        this.myMask.hide();
        $('#Summary').append( this.errorCode );
    };

    me.errorCode = '<div class=\'error\'>Not available at the moment: </br>the portal is either undergoing maintenance </br>or you are experiencing network problems.</div>';
    me.myMask = new Ext.LoadMask(
        $('#Summary')[0],
        {
            msg: 'Please, wait, while the aggregate<br/> summary table is loading',
            msgCls: 'mask-loading'
        }
    );

    me.myMask.show();

    LABKEY.contextPath = '';
    LABKEY.container = {};
    LABKEY.container.path = '/home';

    LABKEY.Query.selectRows({
        failure: me.onFailure.bind( me ),
        queryName: 'studies',
        schemaName: 'study',
        success: function(d){
            if ( d ){
                var numStudies = d.rows.length, filterString = [];

                if ( numStudies == 0 ){
                    me.onFailure.bind( me )();
                } else {

                    LABKEY.Query.selectRows({
                        failure: me.onFailure.bind( me ),
                        queryName: 'totalSubjectCount',
                        schemaName: 'immport',
                        success: function(d){

                            var subjectCount = d.rows[0].subject_count;

                            LABKEY.Query.selectRows({
                                failure: me.onFailure.bind( me ),
                                queryName: 'aggregateSubjectCount',
                                schemaName: 'immport',
                                success: function(d){
                                    me.myMask.hide();

                                    $('.left').append(
                                            '<table cellpadding=\'2\' cellspacing=\'2\' border=\'0\'>' +
                                                    '<tbody>' +
                                                    '<tr>' +
                                                    '<td>Studies</td>' +
                                                    '<td style=\'white-space: nowrap;\' align=\'right\'>' + numStudies + '</td>' +
                                                    '</tr><tr>' +
                                                    '<td>Participants</td>' +
                                                    '<td style=\'white-space: nowrap;\' align=\'right\'>' + subjectCount + '</td>' +
                                                    '</tr><tr>' +
                                                    '<td class=\'nobg\'>&nbsp;</td>' +
                                                    '<td class=\'nobg\'>&nbsp;</td>' +
                                                    '</tr>'
                                    );

                                    Ext.each( d.rows, function(row, i){
                                        $('.left tbody').append(
                                                '<tr>' +
                                                        '<td>' + row.assay_type + '</td>' +
                                                        '<td class=\'numberColumn\' align=\'right\'>' + row.subject_count + '</td>' +
                                                        '</tr>'
                                        );
                                    });
                                }
                            });

                        }
                    });
                }
            } else {
                me.onFailure.bind( me )();
            }
        }
    });
});
