// vim: sw=4:ts=4:nu:nospell:fdc=4
/*
 Copyright 2014 Fred Hutchinson Cancer Research Center

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
            this.tpl = new Ext.XTemplate(
                '<tpl for=".">' +
                    '<div ' + ( ( this.qtipField == undefined ) ? '' : ( 'ext:qtip=\'{' + this.qtipField + ':this.process}\' ' ) ) + 'class=\'x-combo-list-item\'>{' + this.displayField + ':this.process}</div>' +
                '</tpl>',
                {
                    process : function( value ) {
                        return value === '' ? '&nbsp' : Ext.util.Format.htmlEncode( value );
                    }
                }
            );
        }

        // Add selected value tool tip
        this.mon( this, {
            afterrender: function(){
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

                if ( this.expandOnFocus ){
                    this.mon( this.getEl(), {
                        click: function(){
                            if ( this.isExpanded() ){
                                this.collapse();
                                this.el.focus();
                            } else {
                                this.onFocus({});
                                if(this.triggerAction == 'all') {
                                    this.doQuery(this.allQuery, true);
                                } else {
                                    this.doQuery(this.getRawValue());
                                }
                                this.el.focus();
                            }
                        },
                        scope: this
                    });
                }

                this.resizeToFitContent();
            },
            scope: this,
            single: true
        });

        if ( this.store ){
            this.mon(
                this.store, {
                    datachanged:  this.resizeToFitContent,
                    add:          this.resizeToFitContent,
                    remove:       this.resizeToFitContent,
                    load:         this.resizeToFitContent,
                    update:       this.resizeToFitContent.createDelegate(this, [true]),
                    buffer: 10,
                    scope: this
                }
            );
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
    resizeToFitContent: function( versionLight ){
        var el = this.getEl();
        if ( el != undefined && this.rendered ){
            if ( ! this.elMetrics ){
                this.elMetrics = Ext.util.TextMetrics.createInstance( el );
            }
            var m = this.elMetrics, width = 0, s = this.getSize();
            if ( this.store ){
                this.store.each(function (r) {
                    var text = r.get(this.displayField);
                    width = Math.max(width, m.getWidth( Ext.util.Format.htmlEncode(text) ));
                }, this);
            }
            width += el.getBorderWidth('lr');
            width += el.getPadding('lr');
            if (this.trigger) {
                width += this.trigger.getWidth();
            }
            s.width = width;
            width += 3 * Ext.getScrollBarWidth() + 60;
            if ( this.pageSize > 0 && this.pageTb ){
                var toolbar = this.pageTb.el;
                width = Math.max(
                    width,
                    toolbar.child('.x-toolbar-left-row').getWidth() +
                    toolbar.child('.x-toolbar-left').getFrameWidth('lr') +
                    toolbar.child('.x-toolbar-right').getFrameWidth('lr') +
                    toolbar.getFrameWidth('lr')
                );
            }
            this.listWidth = width;
            this.minListWidth = width;
            if ( this.list != undefined && this.innerList != undefined ){
                this.list.setSize( width );
                this.innerList.setWidth( width - this.list.getFrameWidth('lr') );
                if ( ! versionLight ){
                    this.restrictHeight();
                }
            }

            if( this.resizable && this.resizer ){
                this.resizer.minWidth = width;
            }
        }
    },

    initList : function(){
        if(!this.list){
            var cls = 'x-combo-list',
                listParent = Ext.getDom(this.getListParent() || Ext.getBody());

            this.list = new Ext.Layer({
                parentEl: listParent,
                shadow: this.shadow,
                cls: [cls, this.listClass].join(' '),
                constrain:false,
                zindex: this.getZIndex(listParent)
            });

            var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
            this.list.setSize(lw, 0);
            this.list.swallowEvent('mousewheel');
            this.assetHeight = 0;
            if(this.syncFont !== false){
                this.list.setStyle('font-size', this.el.getStyle('font-size'));
            }
            if(this.title){
                this.header = this.list.createChild({cls:cls+'-hd', html: this.title});
                this.assetHeight += this.header.getHeight();
            }

            this.innerList = this.list.createChild({cls:cls+'-inner'});
            this.mon(this.innerList, 'mouseover', this.onViewOver, this);
            this.mon(this.innerList, 'mousemove', this.onViewMove, this);
            this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));

            if(this.pageSize){
                this.footer = this.list.createChild({cls:cls+'-ft'});
                this.pageTb = new Ext.PagingToolbar({
                    store: this.store,
                    pageSize: this.pageSize,
                    renderTo:this.footer
                });
                this.assetHeight += this.footer.getHeight();
            }

            if ( ! this.tpl ){
                this.tpl = '<tpl for="."><div class="'+cls+'-item">{' + this.displayField + '}</div></tpl>';
            }

            this.view = new Ext.DataView({
                applyTo: this.innerList,
                tpl: this.tpl,
                singleSelect: true,
                selectedClass: this.selectedClass,
                itemSelector: this.itemSelector || '.' + cls + '-item',
                emptyText: this.listEmptyText,
                deferEmptyText: false
            });

            this.mon(this.view, {
                containerclick : this.onViewClick,
                click : this.onViewClick,
                scope :this
            });

            this.bindStore(this.store, true);

            if ( this.pageSize > 0 && this.pageTb ){
                var toolbar = this.pageTb.el;
                var width = Math.max(
                    this.getWidth(),
                    toolbar.child('.x-toolbar-left-row').getWidth() +
                    toolbar.child('.x-toolbar-left').getFrameWidth('lr') +
                    toolbar.child('.x-toolbar-right').getFrameWidth('lr') +
                    toolbar.getFrameWidth('lr')
                );
                this.listWidth = width;
                this.minListWidth = width;
                this.list.setSize( width );
                this.innerList.setWidth( width - this.list.getFrameWidth('lr') );
            }

            if(this.resizable){
                this.resizer = new Ext.Resizable(this.list,  {
                    pinned:true, handles:'se', minWidth: this.minListWidth
                });
                this.mon(this.resizer, 'resize', function(r, w, h){
                    this.maxHeight = h-this.handleHeight-this.list.getFrameWidth('tb')-this.assetHeight;
                    this.listWidth = w;
                    this.innerList.setWidth(w - this.list.getFrameWidth('lr'));
                    this.restrictHeight();
                }, this);

                this[this.pageSize?'footer':'innerList'].setStyle('margin-bottom', this.handleHeight+'px');
            }
        }
    },

    onTrigger1Click: Ext.form.ComboBox.prototype.onTriggerClick,
    onTrigger2Click : function()
    {
        if ( ! this.disabled ){
            this.collapse();
            if ( this.store ){
                this.reset();                       // reset contents of combobox, clear any filters as well
            }
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
