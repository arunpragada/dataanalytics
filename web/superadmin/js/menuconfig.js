"use strict";
define(['ojs/ojcore', 'knockout', 'jquery', 'ConnectionDrawer',
    'ojs/ojknockout', 'ojs/ojprogress',
    'ojs/ojnavigationlist', 'ojs/ojradioset',
    'ojs/ojlabel', 'ojs/ojbutton', 'ojs/ojdialog',
    'ojs/ojarraytabledatasource',
    'ojs/ojoffcanvas', 'ojs/ojlistview',
    'promise',
    'ojs/ojmodel',
    'ojs/ojcheckboxset',
    'ojs/ojpopup',
    'ojs/ojinputtext',
    'ojs/ojselectcombobox', 'ojs/ojarraydataprovider',
    'ojs/ojdatetimepicker',
    'ojs/ojtable',
    'ojs/ojdatagrid', 'ojs/ojcollectiondatagriddatasource', 'ojs/ojcollectiontabledatasource', 'ojs/ojinputnumber'],
        function (oj, ko, $) {
            function parentModel() {

                this.getModel = function () {
                    console.log('Get Model:: In menu config  model');
                    return new this.MenuConfigModel();
                };

                this.MenuConfigModel = function () {
                    var self = this;
                    self.columnArray = [{"renderer": oj.KnockoutTemplateUtils.getRenderer("checkbox_tmpl", true),
                            "headerRenderer": oj.KnockoutTemplateUtils.getRenderer("checkbox_hdr_tmpl", true),
                            "id": "column1", "style": "padding-left:2em; ", "headerStyle": "padding-left:2em; background-color: #5a5d5d; color: #F5F5F5;"},
                        {"headerText": "Display Name",
                            "renderer": oj.KnockoutTemplateUtils.getRenderer("disp_name", true),
                            "field": "DisplayName",
//                        "id": "column3", "style": "width:30em; max-width:30em !important;", "headerStyle": "width:30em; max-width:30em !important; background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"},
                            "id": "column3", "class": "addApprTable_EntName_Data", "headerClassName": "addApprTable_EntName_Header"},
//                    {"headerText": "Description",
//                        "renderer": oj.KnockoutTemplateUtils.getRenderer("ent_desc", true),
//                        "field": "EntityDescription",
//                        "id": "column4", "style": "width:30em; max-width:30em !important;", "headerStyle": "width:30em; max-width:30em !important; background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"},
                        {"headerText": "Entity Type",
                            "field": "EntityType",
//                        "id": "column5", "style": "width:10em; max-width:10em !important;", "headerStyle": "width:10em; max-width:10em !important; background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"},
                            "id": "column5", "class": "addApprTable_EntType_Data", "headerClassName": "addApprTable_EntType_Header"},
                        {"headerText": "Approver Details",
                            "renderer": oj.KnockoutTemplateUtils.getRenderer("appr_details", true),
                            "field": "ApprDetails",
//                        "id": "column6", "style": "width:10em; max-width:10em !important;", "headerStyle": "width:10em; max-width:10em !important; background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"}
                            "id": "column6", "class": "addApprTable_ApprDetails_Data", "headerClassName": "addApprTable_ApprDetails_Header"}
                    ];
                    self.menuTableArr = ko.observableArray([]);
                    self.menuWorkingArray = ko.observableArray([]);
                    self.datasource = new oj.ArrayTableDataSource(self.menuWorkingArray, {idAttribute: 'EntityId'});
                    $.post(document.getElementById('appContextPath').value + "/SuperAdmin?action=getallmenus", function (data) {
                        console.log('All menus queried.');
                        $('#datagrid-wrapper').show();
                        $('#AddApprovers_ErrorMessage').hide();
                        $.each(data.items, function (index, value) {
                            var menuId = value.MENU_ID;
                            var menuType = value.MENU_TYPE;
                            var parentMenuLabel = value.PARENT_MENU;
                            if (parentMenuLabel == undefined || parentMenuLabel == 'undefined') {
                                parentMenuLabel = '';
                            }
                            var menu_view_path = value.MENU_VIEW_PATH;
                            if (menu_view_path == undefined || menu_view_path == 'undefined') {
                                menu_view_path = '';
                            }
                            var menu_model_path = value.MENU_MODEL_PATH;
                            if (menu_model_path == undefined || menu_model_path == 'undefined') {
                                menu_model_path = '';
                            }
                            var menu_style_path = value.MENU_STYLE_PATH;
                            if (menu_style_path == undefined || menu_style_path == 'undefined') {
                                menu_style_path = '';
                            }
                            var menuLabel = value.MENU_LABEL;
                            var rowObj = {MenuID: menuId, MenuLabel: menuLabel, ParentMenuLabel: parentMenuLabel, MenuType: menuType, MenuViewPath: menu_view_path, MenuModelPath: menu_model_path, MenuStylePath: menu_style_path};
                            self.addApproversPageTableArr.push(rowObj);
                            self.addApproversPageWorkingArray.push(rowObj);
                        });
                    }).fail(function (jqxhr, textMessage, error) {
                        overlayoff();
                        var messageFromResource = jqxhr.responseText;
                        if (messageFromResource == undefined || messageFromResource == 'undefined') {
                            messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                        }
                        $('#datagrid-wrapper').hide();
                        $('#AddApprovers_ErrorMessage').show();
                        $('#AddApprovers_ErrorMessage').html(messageFromResource);
                        console.log("Error while fetching entities based on selection. Error:" + messageFromResource);
                        callServerGC();
                    });

                    self.cancel = function () {
                        self.invalidMode(true);
                        $('#ociHomePage').show();
                        $('#ociWizardForm').hide();
                        self.resetDefaults();
                    };

                    self.resetDefaults = function () {
                    };

                    self.initializeForm = function () {
                        $('#ocigroupsbody').load('ocigroupsetup/groups.html', function () {
                            self.reattchModel();
                            addKeyUpListenerToOwner(self);
                        });
                    };
                    self.finish = function () {
                        console.log("Inside Finish");
                    };

                };
                this.setup = function (modelObj) {
                    console.log('.......... menu config model .setup() .........');
                };
                this.destroy = function () {};
            }
            return new parentModel();
        }
);
