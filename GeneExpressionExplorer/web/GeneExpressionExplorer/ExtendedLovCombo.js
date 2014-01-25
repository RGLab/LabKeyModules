Ext.ux.form.ExtendedLovCombo = Ext.extend( Ext.ux.form.LovCombo, {

    // True to show the drop down list when the text field is clicked, not just the trigger
    expandOnFocus: true,

    //True for use selectAll item
    addSelectAllItem: true,

    //True to add the extra Clear trigger button
    addClearItem: true,

    //Value of valueField for selectAll item
    selectAllValueField: '_all',

    //Value of textField for selectAll item
    selectAllTextField: 'Select all',

    //Toggle selectAll item
    allSelected: false,

    beforeBlur: Ext.emptyFn,

    //Specificaly css class for selactAll item : ux-lovcombo-list-item-all
    initComponent:function() {

        // template with checkbox
        if ( ! this.tpl ) {
            this.tpl = new Ext.XTemplate(
                '<tpl for=".">'
                    + '<tpl if="' + this.displayField + '==\'' + this.selectAllTextField + '\'">'
                        + '<div class=\'x-combo-list-item ux-lovcombo-list-item-all\'>'
                            + '<img src=\'' + Ext.BLANK_IMAGE_URL + '\' '
                            + 'class=\'ux-lovcombo-icon ux-lovcombo-icon-'
                            + '{[values.' + this.checkField + '?\'checked\':\'unchecked\'' + ']}\'>'
                            + '<div class=\'ux-lovcombo-item-text\'>{' + ( this.displayField || 'text' ) + '}</div>'
                        + '</div>'
                    + '</tpl>'
                    + '<tpl if="' + this.displayField + '!=\'' + this.selectAllTextField + '\'">'
                        + '<div class=\'x-combo-list-item\'>'
                            + '<img src=\'' + Ext.BLANK_IMAGE_URL + '\' '
                            + 'class=\'ux-lovcombo-icon ux-lovcombo-icon-'
                            + '{[values.' + this.checkField + '?\'checked\':\'unchecked\'' + ']}\'>'
                            + '<div class=\'ux-lovcombo-item-text\'>{' + ( this.displayField || 'text' ) + ':this.process}</div>'
                        + '</div>'
                    + '</tpl>'
                 +'</tpl>',
                {
                    process : function(value) {
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
                    update:       this.resizeToFitContent,
                    buffer: 10,
                    scope: this
                }
            );
        }

        if ( this.expandOnFocus ){
            this.mon( this, {
                focus: function(){
                    this.initList();
                    if( this.triggerAction == 'all' ) {
                        this.doQuery( this.allQuery, true );
                    } else {
                        this.doQuery( this.getRawValue() );
                    }
                },
                scope: this
            })
        }

        // install internal event handlers
        this.mon( this, {
            beforeblur:     this.beforeBlur,
            beforequery:    this.onBeforeQuery,
            scope: this
        });

        // remove selection from input field
        this.onLoad = this.onLoad.createSequence(function() {
            if(this.el) {
                var v = this.el.dom.value;
                this.el.dom.value = '';
                this.el.dom.value = v;
            }
        });

        this.mon(
            this.store, {
                load: function(){
                    this.initSelectAll();
                },
                buffer: 10,
                scope: this
            }
        );

        this.initSelectAll();

        this.addClearItem
            ? Ext.form.TwinTriggerField.prototype.initComponent.call(this)
            : Ext.ux.form.ExtendedLovCombo.superclass.initComponent.call(this)
        ;
    },

    // Add the 'Select All' record if appropriate (private)
    initSelectAll : function(){
        if(this.store && this.addSelectAllItem && this.store.getCount() > 0 ){
            var RecordType = Ext.data.Record.create([this.valueField, this.displayField]);
            var data = {};
            data[this.valueField]   = this.selectAllValueField;
            data[this.displayField] = this.selectAllTextField;
            this.store.insert(0, [new RecordType(data)]);
        }
        if(this.allSelected){
            this.selectAll();
        }
    },

    //Select correct action for selected record
    onViewClick : function(doFocus){
        var index = this.view.getSelectedIndexes()[0];
        if (this.addSelectAllItem && index == 0) {
            this.toggleAll();
            if ( this.addSelectAllItem ){
                var r = this.store.getAt(0);
                this.fireEvent('select', this, r, 0);
            }
        }else {
            var r = this.store.getAt(index);
            if(r){
                this.onSelect(r, index);
            }
            if(doFocus !== false){
                this.el.focus();
            }
        }
    },

    //Escape selectAll item value if it's here
    getCheckedArray:function(field) {
        field = field || this.valueField;
        var c = [];

        // store may be filtered so get all records
        var snapshot = this.store.snapshot || this.store.data;

        snapshot.each(function(r, index) {
            if(((this.addSelectAllItem && index > 0) || !this.addSelectAllItem) && r.get(this.checkField)) {
                c.push(r.get(field));
            }
        }, this);

        return c;
    },

    //Using allChecked value
    setValue:function(v) {

        var matchCount = 0;
        this.store.each(function(r){
            var checked = !(!v.match('(^|' + this.separator + '\\s?)' + RegExp.escape(r.get(this.valueField))+'(' + this.separator + '|$)')); // ALL 1 Line
            if(checked) matchCount++;
        },this);
        if(v.length > 0 && matchCount < 1)
        {
            return;
        }


        if(v) {
            v = '' + v;
            if(this.valueField && this.store.getCount()) {
                this.store.suspendEvents(true);
                this.store.clearFilter();
                this.allSelected = true;
                this.store.each(function(r, index) {
                    v = '' + v;
                    var checked =
                        ! (
                            ! v.match(
                                '(^|' + this.separator + ')' + RegExp.escape( r.get( this.valueField ) )
                                + '(' + this.separator + '|$)'
                            )
                        );

                    r.set(this.checkField, checked);

                    if (this.addSelectAllItem && index > 0) {
                        this.allSelected = this.allSelected && checked;
                    }
                }, this);

                if (this.addSelectAllItem) {
                    this.store.getAt(0).set(this.checkField, this.allSelected);
                }

                this.store.resumeEvents();
                this.value = this.getCheckedValue();
                this.setRawValue(this.getCheckedDisplay());
                if(this.hiddenField) {
                    this.hiddenField.value = this.value;
                }
            }
            else {
                this.value = v;
                this.setRawValue(v);
                if(this.hiddenField) {
                    this.hiddenField.value = v;
                }
            }
            if(this.el) {
                this.el.removeClass(this.emptyClass);
            }
        }
        else {
            this.clearValue();
        }
    },

    //Toggle action for de/selectAll
    toggleAll:function(){
        if(this.allSelected){
            this.allSelected = false;
            this.deselectAll();
        }else{
            this.allSelected = true;
            this.selectAll();
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
            this.allSelected = false;
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

    getCheckedArrayInds:function() {
        var c = [];

        // store may be filtered so get all records
        var snapshot = this.store.snapshot || this.store.data;

        snapshot.each(function(r) {
            if(((this.addSelectAllItem && index > 0) || !this.addSelectAllItem) && r.get(this.checkField)) {
                c.push(this.store.indexOf(r));
            }
        }, this);

        return c;
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
Ext.reg('extended-lov-combo', Ext.ux.form.ExtendedLovCombo);
