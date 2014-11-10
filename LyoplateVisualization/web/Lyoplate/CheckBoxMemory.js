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

Ext.namespace('Ext.ux.plugins');

Ext.ux.plugins.CheckBoxMemory = Ext.extend(Object,
    {
        constructor: function(config)
        {
            if (!config)
                config = {};

            this.prefix = 'id_';
            this.items = {};
            this.idProperty = config.idProperty || 'id';
        },

        init: function(grid)
        {
            this.view = grid.getView()
            this.store = grid.getStore();
            this.sm = grid.getSelectionModel();
            this.sm.on('rowselect', this.onSelect, this);
            this.sm.on('rowdeselect', this.onDeselect, this);
            this.store.on('clear', this.onClear, this);
            this.view.on('refresh', this.restoreState, this);
        },

        onSelect: function(sm, idx, rec)
        {
            this.items[this.getId(rec)] = true;
        },

        onDeselect: function(sm, idx, rec)
        {
            delete this.items[this.getId(rec)];
        },

        restoreState: function()
        {
            var i = 0;
            var sel = [];
            this.store.each(function(rec)
            {
                var id = this.getId(rec);
                if (this.items[id] === true)
                    sel.push(i);

                ++i;
            }, this);
            if (sel.length > 0)
                this.sm.selectRows(sel);
        },

        onClear: function()
        {
            var sel = [];
            this.items = {};
        },

        getId: function(rec)
        {
            return rec.get(this.idProperty);
        }
    });
