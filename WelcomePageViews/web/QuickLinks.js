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

makeNavTree = function(webPartDiv) {

    Ext.QuickTips.init();

    inputArray = [{
        children: [{
            cls: "file",
            href: "/project/HIPC/Lyoplate/begin.view?",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "Lyoplate Study",
            text: "Lyoplate Study"
        }, {
            cls: "file",
            href: "/project/HIPC/IS1/begin.view?",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "ImmuneSignatures Study",
            text: "ImmuneSignatures Study"
        }],
        cls: "folder",
        expanded: true,
        leaf: false,
        qtip: "Resources",
        text: "<strong>Special Projects</strong>"
    }, {
        children: [{
            cls: "file",
            href: "/project/home/support/begin.view",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "Issues List",
            text: "Issues List"
        }, {
            cls: "file",
            href: "https://github.com/RGLab/ImmuneSpaceR/issues",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "ImmuneSpaceR",
            text: "ImmuneSpaceR"
        }, {
            cls: "file",
            href: "https://immunespace.herokuapp.com",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "Slack",
            text: "Slack"
        }, {
            cls: "file",
            href: "/project/home/Support/begin.view?pageId=Data changes",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "Release Notes",
            text: "Release Notes"
        }, {
            cls: "file",
            href: "https://www.notion.so/immunespace/0a739a057f234cb6a67d964d2e1bb66d?v=ef29d3978dd64c3bbb2f4f4ba78dc927",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "Roadmap",
            text: "Roadmap"
        }],
        cls: "folder",
        expanded: true,
        leaf: false,
        qtip: "Support",
        text: "<strong>Support</strong>"
    }, {
            cls: "file",
            href: "https://test.immunespace.org/project/home/begin.view?pageId=HIPC%20Standards",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "HIPC Data Standards",
            text: "HIPC Data Standards"
        }, {
            cls: "file",
            href: "http://www.immuneprofiling.org",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "HIPC Website",
            text: "HIPC Website"
        }, {
            cls: "file",
            href: "http://www.immport.org",
            hrefTarget: "_blank",
            leaf: true,
            qtip: "ImmPort Database",
            text: "ImmPort Database"
        }],
        cls: "folder",
        expanded: false,
        leaf: false,
        qtip: "Resources",
        text: "<strong>Resources</strong>"
    }, {
        children: [{
            children: [{
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-boston",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Boston Children's Hospital",
                text: "Boston Children's"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-centInfRD",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Center for Infectious Disease Research",
                text: "CIDR"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-columbia",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Columbia University",
                text: "Columbia University"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-drexel",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Drexel University",
                text: "Drexel University"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-emory2",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Emory University",
                text: "Emory University"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-lajolla",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "La Jolla Institute for Allergy and Immunology",
                text: "La Jolla Institute"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-mssm",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Icahn School of Medicine at Mount Sinai / University of California, Berkeley",
                text: "Mount Sinai"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-ucla",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "University of California Los Angeles",
                text: "UCLA"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-yale2",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Yale University",
                text: "Yale University"
            }],
            cls: "folder",
            expanded: true,
            leaf: false,
            qtip: "Current Members",
            text: "<strong>Current Members</strong>"
        }, {
            children: [{
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-baylor",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Baylor Research Institute",
                text: "Baylor Research Institute"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-emory",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Emory University",
                text: "Emory University"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-danafarber",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Dana-Farber Cancer Institute",
                text: "Harvard University"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-mayo",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Mayo Clinic",
                text: "Mayo Clinic"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-seattlebio",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Seattle Biomedical Research Institute",
                text: "Seattle Biomed Research Institute"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-stanford",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Stanford University",
                text: "Stanford University"
            }, {
                cls: "file",
                href: "https://www.immuneprofiling.org/hipc/page/showPage?pg=projects-yale",
                hrefTarget: "_blank",
                leaf: true,
                qtip: "Yale University",
                text: "Yale University"
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
        animate: true,
        autoScroll: true,
        border: false,
        cls: 'ISCore',
        enableDD: false,
        lines: true,
        listeners: {
            checkchange: function(node, checked) {},
            click: function(node) {}
        },
        loader: new Ext.tree.TreeLoader(), // register a TreeLoader to make use of createNode()
        renderTo: webPartDiv,
        root: new Ext.tree.AsyncTreeNode({
            children: inputArray,
            draggable: false,
            expanded: true
        }),
        rootVisible: false
    });

    navTree.render();
};
