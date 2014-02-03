// vim: sw=4:ts=4:nu:nospell:fdc=4
/*
 Copyright 2013 Fred Hutchinson Cancer Research Center

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

Ext.namespace('LABKEY.ext.ImmuneResponsePredictor_Lib');

//============================//
// Ext specific functionality //
//============================//

// Sets the width of the row numberer depending on the maximum number of digits in the number of records in the underlying store
LABKEY.ext.ImmuneResponsePredictor_Lib.factoryRowNumberer = function ( store ){
    return new Ext.grid.RowNumberer({
        filterable: false,
        width: Math.round( 23 * ( store.getCount().toString().length  ) / 2 )
    })
};

LABKEY.ext.ImmuneResponsePredictor_Lib.initTableQuickTips = function( o ){
    var strngInstruction =
        '1) click the arrow on the right of a selected column header to access the sorting, filtering and hiding/showing options menu for the column <br/>' +
        '2) drag and drop column headers to rearrange the order of the columns <br/>' +
        '3) double click the separator between two column headers to fit the column width to its contents <br/>' +
        '4) hover over a table cell or a column header to see a text tool tip of the contents';

    if ( o.getXType() == 'editorgrid' ){
        strngInstruction += '<br/> 5) double click a cell to edit it, if it is editable'
    }

    Ext.QuickTips.register({
        target: o.header,
        text:   strngInstruction,
        width:  410
    });
};


/*
 * Set Tab titles centered (should be able to do any other customizations by setting the tabStripInnerStyle config)
 */
Ext.TabPanel.override({
    tabStripInnerStyle : 'text-align: center;',
    onRender : function(ct, position){
        Ext.TabPanel.superclass.onRender.call(this, ct, position);

        if(this.plain){
            var pos = this.tabPosition == 'top' ? 'header' : 'footer';
            this[pos].addClass('x-tab-panel-'+pos+'-plain');
        }

        var st = this[this.stripTarget];

        this.stripWrap = st.createChild({cls:'x-tab-strip-wrap', cn:{
            tag:'ul', cls:'x-tab-strip x-tab-strip-'+this.tabPosition}});

        var beforeEl = (this.tabPosition=='bottom' ? this.stripWrap : null);
        st.createChild({cls:'x-tab-strip-spacer'}, beforeEl);
        this.strip = new Ext.Element(this.stripWrap.dom.firstChild);


        this.edge = this.strip.createChild({tag:'li', cls:'x-tab-edge', cn: [{tag: 'span', cls: 'x-tab-strip-text', cn: '&#160;'}]});
        this.strip.createChild({cls:'x-clear'});

        this.body.addClass('x-tab-panel-body-'+this.tabPosition);


        if(!this.itemTpl){
            var tt = new Ext.Template(
                '<li class=\'{cls}\' id=\'{id}\'>',
                    '<a class=\'x-tab-strip-close\'></a>',
                    '<a class=\'x-tab-right\' href=\'#\'>',
                        '<em class=\'x-tab-left\'>',
                            '<span style=\'{tabStripInnerStyle}\' class=\'x-tab-strip-inner\'>',
                                '<span class=\'x-tab-strip-text {iconCls}\'>{text}</span>',
                            '</span>',
                        '</em>',
                    '</a>',
                '</li>'
            );
            tt.disableFormats = true;
            tt.compile();
            Ext.TabPanel.prototype.itemTpl = tt;
        }

        this.items.each(this.initTab, this);
    },
    initTab : function(item, index){
        var before = this.strip.dom.childNodes[index],
            p = this.getTemplateArgs(item);
        p.tabStripInnerStyle = this.tabStripInnerStyle;
        var     el = before ?
                    this.itemTpl.insertBefore(before, p) :
                    this.itemTpl.append(this.strip, p),
                cls = 'x-tab-strip-over',
                tabEl = Ext.get(el);

        tabEl.hover(function(){
            if(!item.disabled){
                tabEl.addClass(cls);
            }
        }, function(){
            tabEl.removeClass(cls);
        });

        if(item.tabTip){
            tabEl.child('span.x-tab-strip-text', true).qtip = item.tabTip;
        }
        item.tabEl = el;


        this.mon( tabEl.select('a'), {
            click: function(e){
                if(!e.getPageX()){
                    this.onStripMouseDown(e);
                }
            },
            scope: this,
            preventDefault: true
        });

        this.mon( item, {
            scope: this,
            disable:        this.onItemDisabled,
            enable:         this.onItemEnabled,
            titlechange:    this.onItemTitleChanged,
            iconchange:     this.onItemIconChanged,
            beforeshow:     this.onBeforeShowItem
        });
    }

});

// Manage the 'check all' icon state
Ext.override(Ext.grid.CheckboxSelectionModel, {
    initEvents : function(){
        Ext.grid.CheckboxSelectionModel.superclass.initEvents.call(this);

        var g = this.grid;

        g.mon( g, {
            afterrender: function(){
                g.mon( Ext.fly(g.getView().innerHd), {
                    mousedown: this.onHdMouseDown,
                    scope: this
                });
            },
            scope: this,
            single: true
        });

        g.mon( g.getView(), {
            refresh: this.manageCheckAll,
            scope: this
        });

        g.mon( this, {
            selectionchange: this.manageCheckAll,
            scope: this
        });
    },
    manageCheckAll: function(){
        var selectedCount = this.grid.getSelectionModel().getCount();

        // Manage the 'check all' icon state
        var hd = Ext.fly(this.grid.getView().innerHd).child('.x-grid3-hd-checker');

        if ( hd != null ){
            var isChecked = hd.hasClass('x-grid3-hd-checker-on');
            var totalCount = this.grid.getStore().getCount();

            if ( selectedCount != totalCount && isChecked ){
                hd.removeClass('x-grid3-hd-checker-on');
            } else if ( selectedCount == totalCount && ! isChecked ){
                hd.addClass('x-grid3-hd-checker-on');
            }
        }
    }
});

// Adds a configure 'dragable', which can be set to false to prevent a column from being drag and dropped
Ext.override(Ext.grid.HeaderDragZone, {
    getDragData: function (e) {
        var t = Ext.lib.Event.getTarget(e);
        var h = this.view.findHeaderCell(t);
        if (h && (this.grid.colModel.config[this.view.getCellIndex(h)].dragable !== false)) {
            return {
                ddel: h.firstChild,
                header: h
            };
        }
        return false;
    }
});

// Apply class 'x-dd-drop-nodrop' for anything being attempted to be dropped to the first 'disallowMoveBefore' positions
Ext.override(Ext.grid.HeaderDropZone, {
    positionIndicator : function(h, n, e){
        if ( this.grid.colModel.disallowMoveBefore != undefined ){
            if ( this.view.getCellIndex(n) <= this.grid.colModel.disallowMoveBefore ){
                return false;
            }
        }

        var x = Ext.lib.Event.getPageX(e),
            r = Ext.lib.Dom.getRegion(n.firstChild),
            px,
            pt,
            py = r.top + this.proxyOffsets[1];
        if((r.right - x) <= (r.right-r.left)/2){
            px = r.right+this.view.borderWidth;
            pt = 'after';
        }else{
            px = r.left;
            pt = 'before';
        }

        if(this.grid.colModel.isFixed(this.view.getCellIndex(n))){
            return false;
        }

        px +=  this.proxyOffsets[0];
        this.proxyTop.setLeftTop(px, py);
        this.proxyTop.show();
        if(!this.bottomOffset){
            this.bottomOffset = this.view.mainHd.getHeight();
        }
        this.proxyBottom.setLeftTop(px, py+this.proxyTop.dom.offsetHeight+this.bottomOffset);
        this.proxyBottom.show();
        return pt;
    }
});

// Do not allow columns to be moved to the first 'disallowMoveBefore' positions
Ext.grid.CustomColumnModel = Ext.extend(Ext.grid.ColumnModel, {
    disallowMoveBefore: -1,
    moveColumn: function (oldIndex, newIndex) {
        if ( newIndex > this.disallowMoveBefore ) {
            var c = this.config[oldIndex];
            this.config.splice(oldIndex, 1);
            this.config.splice(newIndex, 0, c);
            this.dataMap = null;
            this.fireEvent('columnmoved', this, oldIndex, newIndex);
        }
    }
});

// Can add components with text as well as checkbox-es, which become checkItems
Ext.override( Ext.layout.ToolbarLayout, {
    addComponentToMenu : function(menu, component) {
        if (component instanceof Ext.Toolbar.Separator) {
            menu.add('-');

        } else if (Ext.isFunction(component.isXType)) {
            if (component.isXType('splitbutton')) {
                menu.add(this.createMenuConfig(component, true));

            } else if (component.isXType('button')) {
                menu.add(this.createMenuConfig(component, !component.menu));

            } else if (component.isXType('buttongroup')) {
                component.items.each(function(item){
                    this.addComponentToMenu(menu, item);
                }, this);
            } else if ( component.isXType('checkbox')){
                menu.add(
                    new Ext.menu.CheckItem({
                        text: component.boxLabel,
                        checked: component.checked,
                        hideOnClick: false,
                        listeners: {
                            checkchange: function( ci, state ){
                                ci.reference.setValue( state );
                            }
                        },
                        reference: component
                    })
                );
            } else if ( component.isXType('component')){
                if ( component.getEl().dom.innerHTML != '' ){
                    menu.add(
                        new Ext.menu.TextItem({
                            cls: component.initialConfig.cls,
                            ctCls: 'extra5pxPadding',
                            listeners: {
                                render: function(){
                                    new Ext.ToolTip({
                                        target: this.getEl(),
                                        listeners: {
                                            beforeshow: function(tip) {
                                                var msg = this.getEl().dom.innerHTML;
                                                tip.update( Ext.util.Format.htmlEncode( msg ) );
                                                return (msg.length > 0);
                                            },
                                            scope: this
                                        },
                                        renderTo: document.body
                                    });
                                }
                            },
                            text: component.getEl().dom.innerHTML
                        })
                    );
                }
            }
        }
    },
    triggerWidth: 30
});


LABKEY.ext.ImmuneResponsePredictor_Lib.captureEvents = function(observable) {
    Ext.util.Observable.capture(
        observable,
        function(eventName, o) {
            var ot = 'unknown';
            if ( o != undefined ){
                if ( o.combo != undefined ){
                    o = o.combo;
                }
                if ( o.constructor != undefined && o.constructor.xtype != undefined ){
                    ot = o.constructor.xtype;
                } else if ( o.id != undefined ){
                    ot = o.id.split('-');
                    ot.pop();
                    ot = ot.join('-');
                }
            }
            console.info( ot + ' fired: ' + eventName);
        },
        this
    );
};

LABKEY.ext.ImmuneResponsePredictor_Lib.onFailure = function(errorInfo, options, responseObj){
    var strngErrorContact = '\nPlease, contact support, if you have questions.', text = 'Failure: ';

    if (errorInfo && errorInfo.exception){
        text += errorInfo.exception;
    }
    else {
        if ( responseObj != undefined ){
            text += responseObj.statusText;
        } else {
            text += errorInfo.statusText + ( errorInfo.timedout == true ? ', timed out.' : '' );
        }
    }

    Ext.Msg.maxWidth = 900;

    Ext.Msg.alert('Error', text + strngErrorContact);
};

Ext4.Ajax.timeout = 6 * 60 * 60 * 1000; // override the timeout to be 6 hours; value is in milliseconds

Ext.QuickTips.init();


//================================//
// Generic utility functionality: //
//================================//

function removeById(elId) {
    $( '#' + elId ).remove();
};

function removeByClass(className) {
    $( '.' + className ).remove();
};

// Remove elements from an array by values
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// Get the folder of the input path
function dirname(path) {
    return path.replace(/\\/g,'/').replace(/\/[^\/]*\/?$/, '');
}

// Get the file name of the input path
function filename(path) {
    return path.replace(/^.*[\\\/]/, '');
}

// Largest common substring
function lcs(lcstest, lcstarget) {
    matchfound = 0
    lsclen = lcstest.length
    for(lcsi=0; lcsi<lcstest.length; lcsi++){
        lscos=0
        for(lcsj=0; lcsj<lcsi+1; lcsj++){
            re = new RegExp('(?:.{' + lscos + '})(.{' + lsclen + '})', 'i');
            temp = re.test(lcstest);
            re = new RegExp('(' + RegExp.$1 + ')', 'i');
            if(re.test(lcstarget)){
                matchfound=1;
                result = RegExp.$1;
                break;
            }
            lscos = lscos + 1;
        }
        if(matchfound==1){return result; break;}
        lsclen = lsclen - 1;
    }
    result = '';
    return result;
};

// IE8 and below
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(what, i) {
        i = i || 0;
        var L = this.length;
        while (i < L) {
            if(this[i] === what) return i;
            ++i;
        }
        return -1;
    };
}

// IE7 compatibility
Object.keys = Object.keys || (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !{toString:null}.propertyIsEnumerable('toString'),
            DontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            DontEnumsLength = DontEnums.length;

    return function (o) {
        if (typeof o != 'object' && typeof o != 'function' || o === null)
            throw new TypeError('Object.keys called on a non-object');

        var result = [];
        for (var name in o) {
            if (hasOwnProperty.call(o, name))
                result.push(name);
        }

        if (hasDontEnumBug) {
            for (var i = 0; i < DontEnumsLength; i++) {
                if (hasOwnProperty.call(o, DontEnums[i]))
                    result.push(DontEnums[i]);
            }
        }

        return result;
    };
})();

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {

        var T, A, k;

        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument 'length'.
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (thisArg) {
            T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len) where Array is
        // the standard built-in constructor with that name and len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while(k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                kValue = O[ k ];

                // ii. Let mappedValue be the result of calling the Call internal method of callback
                // with T as the this value and argument list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

                // For best browser support, use the following:
                A[ k ] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}
