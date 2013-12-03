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

Ext.ns('Ext.ux.grid');
(function () {
    var cursorRe = /^(?:col|e|w)-resize$/;
    Ext.ux.grid.AutoSizeColumns = Ext.extend(Object, {
        cellPadding: 8,
        constructor: function (config) {
            Ext.apply(this, config);
        },
        init: function (grid) {
            var view = grid.getView();
            view.onHeaderClick = view.onHeaderClick.createInterceptor(this.onHeaderClick);
            grid.on('headerdblclick', this.onHeaderDblClick.createDelegate(view, [this.cellPadding], 3));
        },
        onHeaderClick: function (grid, colIndex) {
            var el = this.getHeaderCell(colIndex);
            if (cursorRe.test(el.style.cursor)) {
                return false;
            }
        },
        onHeaderDblClick: function (grid, colIndex, e, cellPadding) {
            var el = this.getHeaderCell(colIndex), width, rowIndex, count;
            if (!cursorRe.test(el.style.cursor)) {
                return;
            }
            if (e.getXY()[0] - Ext.lib.Dom.getXY(el)[0] <= 5) {
                do
                    colIndex--;
                while (colIndex>0 && this.cm.isHidden(colIndex));
                el = this.getHeaderCell(colIndex);
            }
            if (this.cm.isFixed(colIndex) || this.cm.isHidden(colIndex)) {
                return;
            }
            el = el.firstChild;
            el.style.width = '0px';
            width = el.scrollWidth;
            el.style.width = 'auto';
            for (rowIndex = 0, count = this.ds.getCount(); rowIndex < count; rowIndex++) {
                el = this.getCell(rowIndex, colIndex).firstChild;
                el.style.width = '0px';
                width = Math.max(width, el.scrollWidth);
                el.style.width = 'auto';
            }
            this.onColumnSplitterMoved(colIndex, width + cellPadding + 22);
        }
    });
})();
Ext.preg('autosizecolumns', Ext.ux.grid.AutoSizeColumns);
