Ext.ux.form.ExtendedLovCombo = Ext.extend( Ext.ux.form.LovCombo, {

    // True to show the drop down list when the text field is clicked, not just the trigger
    expandOnClick: true,

    //True for use selectAll item
    addSelectAllItem: true,

    //True to add the extra Clear trigger button
    addClearItem: true,

    //Value of valueField for selectAll item
    selectAllValueField: '_all',

    //Value of textField for selectAll item
    selectAllDisplayField: 'Select all',

    //Toggle selectAll item
    allSelected: false,

    //css class for selactAll item : ux-lovcombo-list-item-all
    initComponent: function() {

        // template with checkbox and 'Select all' item
        if ( ! this.tpl ) {
            this.tpl = new Ext.XTemplate(
                '<tpl for=".">'
                    + '<div class=\'x-combo-list-item\'>'
                        + '<img src=\'' + Ext.BLANK_IMAGE_URL + '\' '
                        + 'class=\'ux-lovcombo-icon ux-lovcombo-icon-'
                        + '{[values.' + this.checkField + '?\'checked\':\'unchecked\'' + ']}\'>'
                        + '<div class=\'ux-lovcombo-item-text\'>{' + this.displayField + ':this.process}</div>'
                    + '</div>'
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

                if ( this.expandOnClick ){
                    this.mon( this.getEl(), {
                        click: this.onTrigger1Click,
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
                    datachanged:  function(){
                        this.resizeToFitContent();
                        this.manageSelectAllState();
                    },
                    add:          this.resizeToFitContent,
                    remove:       this.resizeToFitContent,
                    load:         function(){
                        this.resizeToFitContent();
                        this.initSelectAll();
                    },
                    update:       function(){
                        this.resizeToFitContent.createDelegate(this, [true]);
                        this.manageSelectAllState();
                    },
                    buffer: 5,
                    scope: this
                }
            );
        }

        // install internal event handlers
        this.mon( this, {
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

        this.initSelectAll();

        this.addClearItem
            ? Ext.form.TwinTriggerField.prototype.initComponent.call(this)
            : Ext.ux.form.ExtendedLovCombo.superclass.initComponent.call(this)
        ;
    },

    onBeforeLoad: function(){
        if ( this.addSelectAllItem ){
            this.selectAllItem.addClass( this.disabledClass );
            this.mun( this.selectAllItem, 'click', this.onViewClick, this );
        }
        Ext.ux.form.ExtendedLovCombo.superclass.onBeforeLoad.call(this);
    },

    onLoad: function(){
        if ( this.addSelectAllItem && ! this.store.isLoading ){
            this.selectAllItem.removeClass( this.disabledClass );
            this.mon( this.selectAllItem, 'click', this.onViewClick, this );
        }
        Ext.ux.form.ExtendedLovCombo.superclass.onLoad.call(this);
    },

    expand: function(){
        if ( this.isExpanded() || ! this.hasFocus ){
            return;
        }

        if( this.title || this.pageSize || this.addSelectAllItem ){
            this.assetHeight = 0;
            if( this.title ){
                this.assetHeight += this.header.getHeight();
            }
            if( this.pageSize ){
                this.assetHeight += this.footer.getHeight();
            }
            if( this.addSelectAllItem ){
                this.assetHeight += this.selectAllItem.getHeight();
            }
        }

        if( this.bufferSize ){
            this.doResize( this.bufferSize );
            delete this.bufferSize;
        }
        this.list.alignTo.apply( this.list, [this.el].concat( this.listAlign ) );
        
        this.list.setZIndex( this.getZIndex() );
        this.list.show();
        if( Ext.isGecko2 ){
            this.innerList.setOverflow('auto'); 
        }
        this.mon( Ext.getDoc(), {
            scope: this,
            mousewheel: this.collapseIf,
            mousedown: this.collapseIf
        });
        this.fireEvent('expand', this);
    },

    onBeforeQuery: function(qe) {
        var ar = this.getRawValue().trim().split( new RegExp( '\\s*' + RegExp.escape( this.separator ) + '\\s*' ) );
        var token = ar.pop();
        Ext.each( ar, function(e, i, a){ a[i] = '(?=^(?:(?!' + RegExp.escape( e ) + '$).)*$)'; });
        var re = '^(?=^' + RegExp.escape( token ) + ')'; // search the list for entries starting with the entered text
        if ( token.length > 0 ){
            re += ar.join(''); // filter out the items already entered fully
        }
        re += '.*$';
        qe.query = new RegExp( re );
        qe.query.length = token.length;
    },

    onTypeAhead: function(){
        if ( ! this.store.isFiltered() ){   // very important fix
            return;                         // to prevent typeAhead on click of trigger or input text field
        }
        if( this.store.getCount() > 0 ){
            var r           = this.store.getAt(0),
                newValue    = r.data[this.displayField],
                len         = newValue.length,
                rv          = this.getRawValue(),
                token       = rv.trim().split( new RegExp( '\\s*' + RegExp.escape( this.separator ) + '\\s*' ) ).pop(),
                selStart    = token.length;
            if ( selStart > 0 && newValue.lastIndexOf( token ) >= 0 ){
                var i = rv.lastIndexOf( token );
                if ( i >= 0 ){
                    this.setRawValue( rv.replace( new RegExp( '^(.*)' + RegExp.escape(token) + '(.*)$' ), '$1'+newValue+'$2' ) );
                    this.selectText( i + selStart, i + len );
                }
            }
        }
    },

    assertValue: function() {
        this.list.hide();
        var rva = this.getRawValue().trim().split( new RegExp( '\\s*' + RegExp.escape( this.separator ) + '\\s*' ) );
        var va = [];
        var snapshot = this.store.snapshot || this.store.data;

        // iterate through raw values and records and check/uncheck items
        Ext.each(rva, function(v) {
            snapshot.each(function(r) {
                if(v === r.get(this.displayField)) {
                    va.push(r.get(this.valueField));
                }
            }, this);
        }, this);
        this.setValue(va.join(this.separator));
        this.store.clearFilter();
    },

    /**
     * Selects all items
     */
    selectAll: function() {
        this.store.suspendEvents(true);
        this.store.each(function(record){
            // toggle checked field
            record.set(this.checkField, true);
        }, this);
        this.store.resumeEvents();

        this.setValue(this.getCheckedValue());
    },

    // Add the 'Select All' record if appropriate (private)
    initSelectAll: function(){
        if ( this.store && this.addSelectAllItem && this.store.getCount() > 0 ){
            var RecordType = Ext.data.Record.create([this.valueField, this.displayField, this.checkField]), data = {};
            data[this.valueField]   = this.selectAllValueField;
            data[this.displayField] = this.selectAllDisplayField;
            data[this.checkField]   = this.allSelected;
            this.selectAllRecord    = new RecordType(data);
            if ( this.selectAllRecord.get( this.checkField ) ){
                this.selectAll();
            }
        }
    },

    //Using allChecked value
    setValue: function( v ) {
        if ( v ) {
            v = '' + v;
            this.store.clearFilter();
            if ( this.valueField ){
                this.store.suspendEvents(true);
                this.store.each( function( r ) {
                    r.set(
                        this.checkField,
                        !(
                            v.search(
                                '(^|' + this.separator + ')' +
                                RegExp.escape( r.get( this.valueField ) ) +
                                '(' + this.separator + '|$)'
                            ) == -1
                        )
                    );

                }, this);

                this.store.resumeEvents();
                this.value = this.getCheckedValue();
                this.setRawValue( this.getCheckedDisplay() );
                if ( this.hiddenField ){
                    this.hiddenField.value = this.value;
                }
            }
            if ( this.el ){
                this.el.removeClass(this.emptyClass);
            }
        }
        else {
            this.clearValue();
        }

        return this;
    },

    //Toggle action for de/selectAll
    toggleAll: function(){
        if ( this.selectAllRecord.get( this.checkField ) ){
            this.deselectAll();
        } else {
            this.selectAll();
        }
    },

    //Size the drop-down list to the contents
    resizeToFitContent: function( versionLight ){
        var el = this.getEl();
        if ( el && this.rendered ){
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
            if ( this.list && this.innerList ){
                this.list.setSize( width );
                this.innerList.setWidth( width - this.list.getFrameWidth('lr') );
                if ( versionLight !== true ){
                    this.restrictHeight();
                }

                if ( this.selectAllItem ){
                    this.selectAllItem.setWidth( width - this.list.getFrameWidth('lr') );
                }
            }

            if( this.resizable && this.resizer ){
                this.resizer.minWidth = width;
            }
        }
    },

    initList: function(){
        if ( ! this.list ){
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
            if( this.syncFont !== false ){
                this.list.setStyle('font-size', this.el.getStyle('font-size'));
            }
            if ( this.title ){
                this.header = this.list.createChild({cls:cls+'-hd', html: this.title});
                this.assetHeight += this.header.getHeight();
            }

            if ( this.addSelectAllItem ){
                this.selectAllItem = this.list.createChild({
                    cls: cls + '-inner',
                    children: [{
                        cls: 'x-combo-list-item ux-lovcombo-list-item-all',
                        children: [
                            { cls: 'ux-lovcombo-icon ux-lovcombo-icon-unchecked', src: Ext.BLANK_IMAGE_URL, tag: 'img' },
                            { cls: 'ux-lovcombo-item-text', html: this.selectAllDisplayField }
                        ]
                    }]
                });

                this.selectAllItem.child('.x-combo-list-item').addClassOnOver( this.selectedClass );

                this.selectAllItem.setWidth(lw - this.list.getFrameWidth('lr'));

                this.mon( this.selectAllItem, {
                    containerclick: this.onViewClick,
                    click:          this.onViewClick,
                    scope:          this
                });

                this.assetHeight += this.selectAllItem.getHeight();
            }

            this.innerList = this.list.createChild({cls:cls+'-inner'});
            this.mon(this.innerList, 'mouseover', this.onViewOver, this);
            this.mon(this.innerList, 'mousemove', this.onViewMove, this);
            this.mon(this.innerList, 'mouseout', function(){ this.view.select(-1); }, this);
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
                containerclick: this.onViewClick,
                click:          this.onViewClick,
                scope:          this
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
                if ( this.list && this.innerList ){
                    this.list.setSize( width );
                    this.innerList.setWidth( width - this.list.getFrameWidth('lr') );
                    if ( this.selectAllItem ){
                        this.selectAllItem.setWidth( width - this.list.getFrameWidth('lr') );
                    }
                }
            }

            if(this.resizable){
                this.resizer = new Ext.Resizable(this.list,  {
                    pinned:true, handles:'se', minWidth: this.minListWidth
                });
                this.mon(this.resizer, 'resize', function(r, w, h){
                    this.maxHeight = h - this.handleHeight - this.list.getFrameWidth('tb') - this.assetHeight;
                    this.listWidth = w;
                    this.innerList.setWidth( w - this.list.getFrameWidth('lr') );
                    if ( this.selectAllItem ){
                        this.selectAllItem.setWidth( w - this.list.getFrameWidth('lr') );
                    }
                    this.restrictHeight();
                }, this);

                this[this.pageSize?'footer':'innerList'].setStyle('margin-bottom', this.handleHeight+'px');
            }
        }
    },

    selectPrev: function(){
        var ct = this.store.getCount();
        if ( ct > 0 ){
            if ( this.addSelectAllItem ){
                if ( this.selectedIndex == -1 ){
                    this.select( ct - 1 );
                } else if ( this.selectedIndex == -2 ){
                    this.selectAllItem.child('.x-combo-list-item').removeClass( this.selectedClass );
                    this.select( -1 );
                } else if ( this.selectedIndex > 0 ){
                    this.select( this.selectedIndex - 1 );
                } else if ( this.selectedIndex == 0 ){
                    this.select( -1 );
                    this.selectedIndex = -2;
                    this.selectAllItem.child('.x-combo-list-item').addClass( this.selectedClass );
                }
            } else {
                Ext.ux.form.ExtendedLovCombo.superclass.selectPrev.call(this);
            }
        }
    },

    selectNext: function(){
        var ct = this.store.getCount();
        if ( ct > 0 ){
            if ( this.addSelectAllItem ){
                if ( this.selectedIndex == -1 ){
                    this.selectedIndex = -2;
                    this.selectAllItem.child('.x-combo-list-item').addClass( this.selectedClass );
                } else if ( this.selectedIndex == -2 ){
                    this.selectAllItem.child('.x-combo-list-item').removeClass( this.selectedClass );
                    this.select( 0 );
                } else if ( this.selectedIndex < ct - 1 ){
                    this.select( this.selectedIndex + 1 );
                } else if ( this.selectedIndex == ct - 1 ){
                    this.select( -1 );
                }
            } else {
                Ext.ux.form.ExtendedLovCombo.superclass.selectNext.call(this);
            }
        }
    },

    manageSelectAllState: function(){
        if ( this.selectAllItem && this.selectAllRecord ){
            var allSelected = true;
            this.store.each( function( r ) {
                allSelected = allSelected && r.get( this.checkField );
            }, this);
            this.selectAllRecord.set( this.checkField, allSelected );

            var icon = this.selectAllItem.child('.ux-lovcombo-icon');
            if ( this.selectAllRecord.get( this.checkField ) ){
                icon.removeClass( 'ux-lovcombo-icon-unchecked' );
                icon.addClass( 'ux-lovcombo-icon-checked' );
            } else {
                icon.removeClass( 'ux-lovcombo-icon-checked' );
                icon.addClass( 'ux-lovcombo-icon-unchecked' );
            }
        }
    },

    onViewClick: function(doFocus){
        var index = this.view.getSelectedIndexes()[0],
                s = this.store,
                r = s.getAt( index );
        if ( r ){
            this.onSelect( r, index );
        } else {
            if ( this.addSelectAllItem ){
                this.selectedIndex = -2;

                this.toggleAll();
                this.fireEvent( 'select', this, this.selectAllRecord, -1 );
            } else {
                this.collapse();
            }
        }
        if ( doFocus !== false ){
            this.el.focus();
        }
    },

    /**
     * Combo's onSelect override
     * @private
     * @param {Ext.data.Record} record record that has been selected in the list
     * @param {Number} index index of selected (clicked) record
     */
    onSelect: function(record, index) {
        if ( this.fireEvent('beforeselect', this, record, index) !== false ){
            // toggle checked field
            record.set(this.checkField, !record.get(this.checkField));

            // set (update) value and fire event
            this.setValue(this.getCheckedValue());
            this.fireEvent('select', this, record, index);
        }
    },

    onTrigger1Click: Ext.form.ComboBox.prototype.onTriggerClick,
    onTrigger2Click: function()
    {
        if ( ! this.disabled ){
            this.collapse();
            if ( this.selectAllRecord ){
                this.selectAllRecord.set( this.checkField, false );
            }
            if ( this.store ){
                this.reset();                   // reset contents of combobox, clear any filters as well
            }
            this.clearValue();
            this.fireEvent('cleared', this);    // send notification that contents have been cleared
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

    getCheckedArrayInds: function() {
        var c = [];

        // store may be filtered so get all records
        var snapshot = this.store.snapshot || this.store.data;

        snapshot.each(function(r) {
            if( r.get(this.checkField) ) {
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

