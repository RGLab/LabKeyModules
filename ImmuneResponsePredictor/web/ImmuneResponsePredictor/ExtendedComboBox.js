// vim: sw=4:ts=4:nu:nospell:fdc=4
/*
 Copyright 2012 Fred Hutchinson Cancer Research Center

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// create namespace
Ext.ns('Ext.ux.form');

Ext.ux.form.ExtendedComboBox = Ext.extend( Ext.form.ComboBox, {

    addClearItem: true,     // true to add the extra Clear trigger button
    expandOnFocus: true,    // show the drop down list when the text field is clicked, not just the trigger

    initComponent: function(){

        if ( ! this.tpl ) {
            this.tpl = this.qtipField == undefined ?
                '<tpl for="."><div class=\'x-combo-list-item\'>{' + (this.displayField || 'text' )+ ':htmlEncode}</div></tpl>' :
                '<tpl for="."><div ext:qtip=\'{' + this.qtipField + ':htmlEncode}\' class=\'x-combo-list-item\'>{' + (this.displayField || 'text' )+ ':htmlEncode}</div></tpl>';
        }

        // Add selected value tool tip
        this.on('afterrender', function(){
            new Ext.ToolTip({
                target: this.getEl(),
                html: this.getValue(),
                listeners: {
                    beforeshow: function(tip) {
                        var msg = this.getRawValue();
                        tip.update( Ext.util.Format.htmlEncode( msg ) );
                        return (msg.length > 0);
                    },
                    scope: this
                },
                renderTo: document.body
            });

            this.store.on({
                'datachanged':  this.resizeToFitContent,
                'add':          this.resizeToFitContent,
                'remove':       this.resizeToFitContent,
                'load':         this.resizeToFitContent,
                'update':       this.resizeToFitContent,
                buffer: 10,
                scope: this
            });

            this.resizeToFitContent();
        }, this );

        if ( this.expandOnFocus ){
            this.on('focus', function(){
                this.initList();
                if( this.triggerAction == 'all' ) {
                    this.doQuery( this.allQuery, true );
                } else {
                    this.doQuery( this.getRawValue() );
                }
            }, this )
        }

        this.addClearItem
            ? Ext.form.TwinTriggerField.prototype.initComponent.call(this)
            : Ext.ux.form.ExtendedComboBox.superclass.initComponent.call(this);
    },

    // Return specified field of the selected record
    getSelectedField: function( field ) {
        field = field || this.valueField;
        var curVal = this.getValue(),
            rec = this.findRecord( this.valueField, curVal );
        if ( rec != undefined ){
            return rec.get( field );
        } else {
            return undefined;
        }
    },

    //Size the drop-down list to the contents
    resizeToFitContent: function(){
        var el = this.getEl();
        if ( el != undefined && this.rendered ){
            if ( ! this.elMetrics ){
                this.elMetrics = Ext.util.TextMetrics.createInstance( el );
            }
            var m = this.elMetrics, width = 0, s = this.getSize();
            this.store.each(function (r) {
                var text = r.get(this.displayField);
                width = Math.max(width, m.getWidth( Ext.util.Format.htmlEncode(text) ));
            }, this);
            width += el.getBorderWidth('lr');
            width += el.getPadding('lr');
            s.width = width;
            width += 3 * Ext.getScrollBarWidth() + 60;
            if ( this.pageSize > 0 && this.pageTb ){
                width = Math.max( width, this.pageTb.el.child('table').getWidth() );
            }
            this.listWidth = width;
            this.minListWidth = width;
            if ( this.list != undefined && this.innerList != undefined ){
                this.list.setSize( width );
                this.innerList.setWidth( width - this.list.getFrameWidth('lr') );
                this.restrictHeight();
            }
        }
    },

    onTrigger1Click: Ext.form.ComboBox.prototype.onTriggerClick,
    onTrigger2Click : function()
    {
        if ( ! this.disabled ){
            this.collapse();
            this.reset();                       // reset contents of combobox, clear any filters as well
            this.clearValue();
            this.fireEvent('cleared');          // send notification that contents have been cleared
        }
    },

    trigger1Class: Ext.form.ComboBox.prototype.triggerClass,
    trigger2Class: 'x-form-clear-trigger',

    getTrigger: function(){
        this.addClearItem ? Ext.form.TwinTriggerField.prototype.getTrigger.call(this) : Ext.form.ComboBox.prototype.getTrigger.call(this);
    },
    initTrigger: function(){
        this.addClearItem ? Ext.form.TwinTriggerField.prototype.initTrigger.call(this) : Ext.form.ComboBox.prototype.initTrigger.call(this);
    },

    /////////////////////////////
    //      Custom configs     //
    /////////////////////////////
    autoSelect: false,
    emptyText: 'Select...',
    forceSelection: true,
    minChars: 0,
    mode: 'local',
    resizable: true,
    triggerAction: 'all',
    typeAhead: true
    /////////////////////////////

});
Ext.reg('extended-combo-box', Ext.ux.form.ExtendedComboBox);
