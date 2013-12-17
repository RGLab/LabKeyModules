Ext.ux.form.ExtendedLovCombo = Ext.extend( Ext.ux.form.LovCombo, {

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
        if( ! this.tpl ) {
            this.tpl =
                '<tpl for=".">'
                    + '<tpl if="' + this.valueField + '==\'' + this.selectAllValueField + '\'">'
                        + '<div class=\'x-combo-list-item ux-lovcombo-list-item-all\'>'
                            + '<img src=\'' + Ext.BLANK_IMAGE_URL + '\' '
                            + 'class=\'ux-lovcombo-icon ux-lovcombo-icon-'
                            + '{[values.' + this.checkField + '?\'checked\':\'unchecked\'' + ']}\'>'
                            + '<div class=\'ux-lovcombo-item-text\'>{' + (this.displayField || 'text' )+ '}</div>'
                        + '</div>'
                    + '</tpl>'
                    + '<tpl if="' + this.valueField + '!=\'' + this.selectAllValueField + '\'">'
                        + '<div class=\'x-combo-list-item\'>'
                            + '<img src=\'' + Ext.BLANK_IMAGE_URL + '\' '
                            + 'class=\'ux-lovcombo-icon ux-lovcombo-icon-'
                            + '{[values.' + this.checkField + '?\'checked\':\'unchecked\'' + ']}\'>'
                            + '<div class=\'ux-lovcombo-item-text\'>{' + (this.displayField || 'text' )+ ':htmlEncode}</div>'
                        + '</div>'
                    + '</tpl>'
                 +'</tpl>'
            ;
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

        // Show drop down when the text field is clicked, not just the trigger
        this.on('focus', function(){
            this.initList();
            this.doQuery('', true);
        }, this );

        // install internal event handlers ???
        this.on({
            scope:this
            , beforequery:this.onBeforeQuery
            , beforeblur:this.beforeBlur
        });

        // remove selection from input field
        this.onLoad = this.onLoad.createSequence(function() {
            if(this.el) {
                var v = this.el.dom.value;
                this.el.dom.value = '';
                this.el.dom.value = v;
            }
        });

        this.store.on({
            'load': function(){
                if(this.store && this.addSelectAllItem){
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
            buffer: 10,
            scope: this
        });

        if ( this.store && this.addSelectAllItem ){
            var RecordType = Ext.data.Record.create([this.valueField, this.displayField]);
            var data = {};
            data[this.valueField]   = this.selectAllValueField;
            data[this.displayField] = this.selectAllTextField;
            this.store.insert(0, [new RecordType(data)]);
        }
        if(this.allSelected){
            this.selectAll();
        }

        this.addClearItem
            ? Ext.form.TwinTriggerField.prototype.initComponent.call(this)
            : Ext.ux.form.ExtendedLovCombo.superclass.initComponent.call(this)
        ;
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

    // Create a specific record for selectAll item
    initList : function(){
        Ext.ux.form.ExtendedLovCombo.superclass.initList.apply(this, arguments);

        if ( this.allSelected ){
            this.selectAll();
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
            width += 3*Ext.getScrollBarWidth() + 60;
            this.listWidth = width;
            this.minListWidth = width;
            if ( this.list != undefined ){
                this.list.setWidth( width );
            }
            if ( this.innerList != undefined ){
                this.innerList.setWidth( width );
            }
        }
    },

    onTrigger1Click: Ext.form.ComboBox.prototype.onTriggerClick,
    onTrigger2Click : function()
    {
        this.collapse();
        this.allSelected = false;
        this.reset();                       // clear contents of combobox
        this.fireEvent('cleared');          // send notification that contents have been cleared
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
    // OpenCyto custom configs //
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
