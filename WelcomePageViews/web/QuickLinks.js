// vim: sw=4:ts=4:nu:nospell:fdc=4
/*
 *  Copyright 2014 Fred Hutchinson Cancer Research Center
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/* Mimicking DataSummary.js in order to ensure that a separate
webpart is created each time for QuickLinks and it doesn't interfere
with other webparts by looking for div tags as done previously. */


makeNavTree = function (webPartDiv){

    Ext.QuickTips.init();

    inputArray = [{
      children: [{
        cls: "file",
        href: "/project/HIPC/Lyoplate/begin.view?",
        hrefTarget: "_blank",
        leaf: true,
        qtip: "Lyoplate study",
        text: "Lyoplate study"
        }],
        cls: "folder",
        expanded: true,
        leaf: false,
        qtip: "Resources",
        text: "<strong>Special Projects</strong>"
    },{
        children: [{
        cls: "file",
        href: "https://groups.google.com/forum/#!forum/immunespace",
        hrefTarget: "_blank",
        leaf: true,
        qtip: "ImmuneSpace Google Group",
        text: "ImmuneSpace Google Group"
        },{
        cls: "file",
        href: "https://immunespace.org/data_standards.url",
        hrefTarget: "_blank",
        leaf: true,
        qtip: "HIPC Standards",
        text: "HIPC Standards"
        },{
        cls: "file",
        href: "http://www.immuneprofiling.org",
        hrefTarget: "_blank",
        leaf: true,
        qtip: "HIPC Website",
        text: "HIPC Website"
        },{
        cls: "file",
        href: "http://www.immport.org",
        hrefTarget: "_blank",
        leaf: true,
        qtip: "ImmPort Database",
        text: "ImmPort Database"
        }],
        cls: "folder",
        expanded: true,
        leaf: false,
        qtip: "Resources",
        text: "<strong>Resources</strong>"
    },{
        children: [{
            children: [{
            cls: "file",
            href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-emory2",
            hrefTarget: "_blank",
            leaf: true,
                qtip: "Emory University",
                text: "Emory University"
            },{
            cls: "file",
            href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-mssm",
            hrefTarget: "_blank",
            leaf: true,
                qtip: "Icahn School of Medicine at Mount Sinai / University of California, Berkeley",
                text: "Mount Sinai"
            },{
            cls: "file",
            href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-lajolla",
            hrefTarget: "_blank",
            leaf: true,
                qtip: "La Jolla Institute for Allergy and Immunology",
                text: "La Jolla Institute"
            }],
            cls: "folder",
            expanded: true,
            leaf: false,
            qtip: "Current Members",
            text: "<strong>Current Members</strong>"
        },{
            children: [{
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-baylor",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Baylor Research Institute",
                text: "Baylor Research Institute"
        },{
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-stanford",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Stanford University",
                text: "Stanford University"
        },{
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-yale",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Yale University",
                text: "Yale University"
            },{
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-mayo",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Mayo Clinic",
                text: "Mayo Clinic"
        },{
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-danafarber",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Dana-Farber Cancer Institute",
                text: "Harvard University"
        },{
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-seattlebio",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Seattle Biomedical Research Institute",
                text: "Seattle Biomed Research Institute"
        }],
        cls: "folder",
            expanded: false,
        leaf: false,
        qtip: "Past Members",
        text: "<strong>Past Members</strong>"
        }],
        cls: "folder",
        expanded: false,
        leaf: false,
        qtip: "HIPC Centers",
        text: "<strong>HIPC Centers</strong>"
    }];

    navTree = new Ext.tree.TreePanel({
        animate:    true,
        autoScroll: true,
        border:     false,
        cls:        "opencyto",
        enableDD:   false,
        lines:      true,
        listeners: {
            checkchange: function(node, checked){
            },
            click: function( node ){
            }
        },
        loader: new Ext.tree.TreeLoader(), // register a TreeLoader to make use of createNode()
        renderTo: webPartDiv,
        root: new Ext.tree.AsyncTreeNode({
            children:   inputArray,
            draggable:  false,
            expanded :  true
        }),
        rootVisible: false
    });

    navTree.render();
}

