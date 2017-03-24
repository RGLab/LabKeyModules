$(document).ready(function() {
    var me = this;

    me.errorCode = '<div class=\'error\'>Not available at the moment: </br>the portal is either undergoing maintenance </br>or you are experiencing network problems.</div>';

    me.onFailureSummary = function(){
        this.maskSummary.hide();
        $('#Summary').append( this.errorCode );
    };

    me.maskSummary = new Ext.LoadMask(
        $('#Summary')[0],
        {
            msg: 'Please, wait, while the aggregate</br> summary table is loading',
            msgCls: 'mask-loading'
        }
    );

    me.onFailureNews = function(){
        this.maskNews.hide();
        $('#News').append( this.errorCode );
    };

    me.maskNews = new Ext.LoadMask(
        $('#News')[0],
        {
            msg: 'Please, wait, while</br> the news are loading',
            msgCls: 'mask-loading'
        }
    );

    me.maskSummary.show();

    me.maskNews.show();


    LABKEY.contextPath = '';
    LABKEY.container = {};
    LABKEY.container.path = '/home';

    LABKEY.Query.selectRows({
        failure: me.onFailureSummary.bind( me ),
        queryName: 'Studies',
        schemaName: 'lists',
        success: function(d){
            if ( d ){
                var numStudies = d.rows.length, filterString = [];

                if ( numStudies == 0 ){
                    me.onFailureSummary.bind( me )();
                } else {

                    LABKEY.Query.selectRows({
                        failure: me.onFailureSummary.bind( me ),
                        queryName: 'totalSubjectCount',
                        schemaName: 'immport',
                        success: function(d){

                            var subjectCount = d.rows[0].subject_count;

                            LABKEY.Query.selectRows({
                                failure: me.onFailureSummary.bind( me ),
                                queryName: 'aggregateSubjectCount',
                                schemaName: 'immport',
                                success: function(d){
                                    me.maskSummary.hide();

                                    $('#slideshow > div.left').append(
                                            '<table cellpadding=\'2\' cellspacing=\'2\' border=\'0\'>' +
                                                    '<tbody>' +
                                                    '<tr>' +
                                                    '<td>Studies</td>' +
                                                    '<td style=\'white-space: nowrap;\' align=\'right\'>' + numStudies + '</td>' +
                                                    '</tr><tr>' +
                                                    '<td>Participants</td>' +
                                                    '<td style=\'white-space: nowrap;\' align=\'right\'>' + subjectCount + '</td>' +
                                                    '</tr><tr>' +
                                                    '<td style=\'font-size: 0\' class=\'nobg\'>&nbsp;</td>' +
                                                    '<td style=\'font-size: 0\' class=\'nobg\'>&nbsp;</td>' +
                                                    '</tr>'
                                    );

                                    Ext.each( d.rows, function(row){
                                        $('#slideshow > div.left tbody').append(
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
                me.onFailureSummary.bind( me )();
            }
        }
    });

    LABKEY.Query.executeSql({
        failure: me.onFailureNews.bind( me ),
        schemaName: 'announcement',
        sql: 'SELECT RowId, Title, FormattedBody, to_char( Created, \'Month FMDD, YYYY\' ) AS Date FROM Announcement WHERE Expires IS NULL OR TIMESTAMPDIFF(\'SQL_TSI_DAY\', NOW(), Expires ) >= 0 ORDER BY Created DESC',
        success: function(d){
            me.maskNews.hide();

            if ( d && d.rows ){
                if ( d.rows.length > 0 ){
                    Ext.each( d.rows, function(row){
                        $('#News').append(
                            '<div class=\'fixed-height\'><strong>' + row.Date + '. <a href=\'' +
                                LABKEY.ActionURL.buildURL(
                                    'announcements',
                                    'thread',
                                    null,
                                    {
                                        rowId: row.RowId
                                    }
                                ) +
                                '\' target=\'_blank\'>' + row.Title + '</a></strong>' +
                            '</br>' + row.FormattedBody + '</div></br>'
                        );
                    });
                } else {
                    $('#News').append( '<div style="font-size: 80%;">No recent announcements</div>' );
                }
            }
        }
    });

});

