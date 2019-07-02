'use strict';
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojkeyset', 'ojs/ojnavigationlist', 'ojs/ojknockout', 'ojs/ojgauge', 'ojs/ojgauge'],
        function (oj, ko, $, keySet) // this callback gets executed when all required modules are loaded
        {
            function parent() {
                this.AppsModel = function () {
                    var self = this;
                    this.itemOnly = function (context) {
                        return context['leaf'];
                    };
                    this.expanded = new keySet.ExpandedKeySet(['avldb']);
                    self.selectedMenuItem = ko.observable('menuId1000');
                    /*
                     * Create Dashboard --> starts 
                     */
                    self.c_dashboardName = ko.observable('');
                    self.genericStatusMessage = ko.observable('');
                    self.c_selVisualizations = ko.observableArray([]);
                    self.visualizArray = ko.observableArray([]);
                    self.visualizationsDP = new oj.ArrayDataProvider(self.visualizArray, {'keyAttributes': 'visualization_id'});
                    self.c_selectedVizs = ko.observableArray([]);

                    self.saveDashboard = function () {
                        console.log('Saving Dashboard');
                        var name = self.c_dashboardName();
                        if (name == undefined || name == null || name == '') {
                            self.genericStatusMessage("Please provide dashboard name");
                            displayErrorMessage(2500);
                            return;
                        }
                        var vizIds = '';
                        var widths = '';
                        var heights = '';
                        $.each(self.c_selectedVizs(), function (index, value) {
                            console.log(JSON.stringify(value));
                            if (vizIds.length > 0) {
                                vizIds = vizIds + ',';
                            }
                            if (widths.length > 0) {
                                widths = widths + ',';
                            }
                            if (heights.length > 0) {
                                heights = heights + ',';
                            }
                            vizIds = vizIds + value;
                            var wid = $('#chart_' + value).css('width');
                            widths = widths + value + '=>' + wid;
                            var hei = $('#chart_' + value).css('height');
                            heights = heights + value + '=>' + hei;
                        });
                        var content = 'name=' + name + '&viz_ids=' + vizIds + '&widths=' + widths + '&heights=' + heights;
                        console.log('content=' + content);
                        overlayon('Saving Dashboard');
                        $.post(document.getElementById('appContextPath').value + '/DashboardServlet?operation=save_dash', content, function (response) {
                            overlayoff();
                            console.log(JSON.stringify(response));
                            self.genericStatusMessage(response.Status);
                            var rowObj = {id: response.ID, Title: self.c_dashboardName()};
                            console.log('Save dashboard :: pushing:' + JSON.stringify(rowObj));
                            self.allDashboards.push(rowObj);
                            document.querySelector('#saveDash').close();

//                            var navList = document.getElementById('avldb');
//                            ko.cleanNode(navList);
//                            ko.applyBindings(_dashboardModel, navList);
                            setTimeout(function () {
                                document.getElementById('d_navList').refresh();
                                console.log('Navigation List is Refreshed');
                            }, 500);

                            setTimeout(function () {
                                self.c_selVisualizations.removeAll();
                                self.selectedMenuItem(response.ID);
                                self.c_dashboardName('');
                            }, 3000);
                        }).fail(function (jqxhr, textMessage, error) {
                            overlayoff();
                            var messageFromResource = jqxhr.responseText;
                            if (messageFromResource == undefined || messageFromResource == 'undefined') {
                                messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                            }
                            console.log("Error while saving dashboard. Error:" + messageFromResource);
                            self.genericStatusMessage(messageFromResource);
                            displayQErrorMessage(7500);
                            document.querySelector('#saveDash').close();
                        });
                    };

                    self.c_selectVisualizations = function () {
                        console.log('Adding viz to dashboard');
                        renderSelectedVizualizations(self.c_selectedVizs(), self.c_selVisualizations);
                    };

//                    self.showVizPopup = function () {
//                        console.log('Open AVBL Viz');
//                        document.querySelector('#avblViz').open();
//                    };

                    self.isSaveVisible = ko.pureComputed(function () {
                        if (self.c_selVisualizations().length > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }, self);
                    /*
                     * Create Dashboard --> ends 
                     */


                    /*
                     * Update Dashboard --> starts 
                     */
                    self.u_selVisualizations = ko.observableArray([]);
                    self.u_dashboardJus = ko.observable();
                    self.u_dashboardName = ko.observable();
                    self.c_selectedVizs = ko.observableArray([]);
                    self.u_selectedVizs = ko.observableArray([]);

                    self.updateDashboard = function () {
                        console.log('Updating Dashboard');
                        var name = self.u_dashboardName();
                        if (name == undefined || name == null || name == '') {
                            self.genericStatusMessage("Please provide dashboard name");
                            displayErrorMessage(2500);
                            return;
                        }
                        if (self.u_dashboardJus() == undefined || self.u_dashboardJus() == null || self.u_dashboardJus() == '') {
                            self.genericStatusMessage("Please provide valid justification");
                            displayErrorMessage(2500);
                            return;
                        }
                        var vizIds = '';
                        var widths = '';
                        var heights = '';
                        $.each(self.u_selectedVizs(), function (index, value) {
                            console.log(JSON.stringify(value));
                            if (vizIds.length > 0) {
                                vizIds = vizIds + ',';
                            }
                            if (widths.length > 0) {
                                widths = widths + ',';
                            }
                            if (heights.length > 0) {
                                heights = heights + ',';
                            }
                            vizIds = vizIds + value;
                            var wid = $('#chart_' + value).css('width');
                            widths = widths + value + '=>' + wid;
                            var hei = $('#chart_' + value).css('height');
                            heights = heights + value + '=>' + hei;
                        });
                        var content = 'id=' + self.dashboardId() + '&justification=' + encodeURIComponent(self.u_dashboardJus()) + '&name=' + name + '&viz_ids=' + vizIds + '&widths=' + widths + '&heights=' + heights;
                        console.log('content=' + content);
                        overlayon('Updating Dashboard');
                        $.post(document.getElementById('appContextPath').value + '/DashboardServlet?operation=update_dash', content, function (response) {
                            overlayoff();
                            console.log(JSON.stringify(response));
                            self.genericStatusMessage(response.Status);
                            document.querySelector('#saveDash').close();
                            setTimeout(function () {
                                self.u_selVisualizations.removeAll();
                                self.u_dashboardJus('');
                                self.selectedMenuItem('');
                                self.selectedMenuItem(response.ID);
                            }, 3000);
                        }).fail(function (jqxhr, textMessage, error) {
                            overlayoff();
                            var messageFromResource = jqxhr.responseText;
                            if (messageFromResource == undefined || messageFromResource == 'undefined') {
                                messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                            }
                            console.log("Error while saving dashboard. Error:" + messageFromResource);
                            self.genericStatusMessage(messageFromResource);
                            displayQErrorMessage(7500);
                            document.querySelector('#saveDash').close();
                        });
                    };

                    self.cancelEdit = function () {
                        console.log('Cancel Edit');
                        self.u_selVisualizations.removeAll();
                        self.u_selectedVizs.removeAll();
                        self.selectedMenuItem('');
                        self.selectedMenuItem(self.dashboardId());
                    };

                    self.launchEdit = function () {
                        console.log('Launch Edit');
                        self.u_dashboardName(self.dashboardName());
                        self.u_selVisualizations.removeAll();
                        self.u_selectedVizs.removeAll();
                        for (var i = 0; i < self.visualizations().length; i++) {
                            var rowObj = self.visualizations()[i];
                            rowObj['chartid'] = 'chart_' + rowObj['id'];
                            console.log('edit obj:' + JSON.stringify(rowObj));
                            self.u_selVisualizations.push(rowObj);
                            self.u_selectedVizs.push(rowObj['id']);
                        }
                        self.loadVisualizations();
                        $('#menubody').load('dashboard/editdashboard.html', function () {
                            console.log('edit dashboard page is loaded..');
                            var menuBodyDiv = document.getElementById('menubody');
                            ko.cleanNode(menuBodyDiv);
                            ko.applyBindings(_dashboardModel, menuBodyDiv);
                            console.log('Update dashboard -> Bindings Applied');
                        });
                    };

                    self.u_isSaveVisible = ko.pureComputed(function () {
                        if (self.u_selVisualizations().length > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }, self);

                    self.u_selectVisualizations = function () {
                        console.log('Adding viz to dashboard');
                        renderSelectedVizualizations(self.u_selectedVizs(), self.u_selVisualizations);
                    };

                    /*
                     * Update dashboard - ends
                     */

                    /*
                     * Delete dashboard - ends
                     */

                    self.d_dashboardJus = ko.observable();
                    self.deleteDashboard = function () {
                        if (self.d_dashboardJus() == undefined || self.d_dashboardJus() == null || self.d_dashboardJus() == '') {
                            self.genericStatusMessage("Please provide valid justification");
                            displayErrorMessage(2500);
                            return;
                        }
                        overlayon('Deleting Dashboard');
                        var content = '';
                        content = content + 'dashboard_id=' + self.dashboardId();
                        content = content + '&justification=' + self.d_dashboardJus();
                        $.post(document.getElementById('appContextPath').value + '/DashboardServlet?operation=del_dash', content, function (response) {
                            overlayoff();
                            console.log(JSON.stringify(response));
                            self.genericStatusMessage(response.Status);
                            document.querySelector('#deleteDash').close();

                            self.allDashboards.remove(function (db) {
                                console.log(db.id + '==' + self.dashboardId());
                                return db.id == self.dashboardId() && db.Title == self.dashboardName();
                            });
                            $('#menubody').html('<div style="text-align: center; color:red; font-size:24px; margin-top:5%;"><b>Dashboard Deleted.</b></div>')
                        }).fail(function (jqxhr, textMessage, error) {
                            overlayoff();
                            var messageFromResource = jqxhr.responseText;
                            if (messageFromResource == undefined || messageFromResource == 'undefined') {
                                messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                            }
                            console.log("Error while deleting dashboard. Error:" + messageFromResource);
                            self.genericStatusMessage(messageFromResource);
                            displayQErrorMessage(7500);
                            document.querySelector('#deleteDash').close();
                        });
                    };
                    /*
                     * Delete dashboard - ends
                     */


                    self.dashboardName = ko.observable('');
                    self.dashboardId = ko.observable('');
//                    self.dashboards = ko.observableArray([]);
//                    self.dashboards.push({id: 1001, Title: "Sample Dashboard"});
//                    self.dashboards.push({id: 1002, Title: "Real Dashboard"});
                    self.allDashboards = ko.observableArray([]);
                    self.visualizations = ko.observableArray([]);
//                    self.visualizations.push({id: 1001, type: 'barchart', vSeries: '[{"name":"Foundation","items":[32,12]}, {"name":"Enterprise","items":[23,43]}]', vGroups: '["Group A", "Group B"]'});
//                    self.visualizations.push({"id": 15, "type": "barchart", "vSeries": '[{"name": "1", "items": [2, 2, 0, 0]}, {"name": "2", "items": [2, 2, 0, 0]}, {"name": "3", "items": [2, 2, 0, 0]}, {"name": "4", "items": [2, 2, 2, 2]}, {"name": "5", "items": [2, 2, 2, 2]}, {"name": "6", "items": [2, 2, 0, 0]}, {"name": "7", "items": [2, 2, 2, 2]}]', "vGroups": '["Palliative chemotherapy", "Palliative counselling", "Palliative radiotherapy", "Palliative surgery"]'});
//                    self.visualizations.push({id: 1009, type: 'piechart', vSeries: '[{"name":"Foundation","items":[81]}, {"name":"Enterprise","items":[99]}]'});
                    self.menuItemAction = function (event) {
                        self.selectedMenuItem(event.target.id);
                    }.bind(this);

                    self.selectedMenuItem.subscribe(function (selectedMenu) {
                        console.log('New Value:' + JSON.stringify(selectedMenu));
                        var newDashboardId = selectedMenu;
                        if (newDashboardId == '') {
                            console.log('Nothing to do. selected menu is NULL');
                            return;
                        } else if (newDashboardId == 'createdb') {
                            console.log('Create DB');
                            self.c_selVisualizations.removeAll();
                            self.c_selectedVizs.removeAll();
                            self.loadVisualizations();
                        } else {
                            self.visualizations.removeAll();
                            $.getJSON(document.getElementById('appContextPath').value + '/DashboardServlet?operation=get_definision&dashboard_id=' + newDashboardId, function (response) {
                                overlayoff();
//                            console.log(JSON.stringify(response));
                                var dname = '';
                                $.each(response.items, function (index, value) {
                                    var id = value.visualization_id;
                                    var wid = value.v_width;
                                    var hei = value.v_height;
                                    var type = value.visualization_type;
                                    var name = value.visualization_name;
                                    dname = value.dashboard_name;
//                                    var dashboard_name = value.dashboard_name;
                                    var vSer = [];
                                    $.each(value.series, function (ind, val) {
                                        var x = '';
                                        x = x + '{\"name\" : \"' + ind + '\", \"items\":  [' + val + '] }';
                                        vSer.push(x);
                                    });
                                    var vGrp = [];
                                    $.each(value.groups, function (ind, val) {
                                        vGrp.push("\"" + val + "\"");
                                    });
//                                    var thresholdValues = [];
//                                    thresholdValues.push({max: Number(value.guage_min)});
//                                    thresholdValues.push({max: Number(value.guage_max)});
//                                    thresholdValues.push({});
                                    var thresholdValues = [];
                                    var x = '{"max": "' + Number(value.guage_min) + '"}';
                                    thresholdValues.push(x);
                                    x = '{"max": "' + Number(value.guage_max) + '"}';
                                    thresholdValues.push(x);
                                    x = '{}';
                                    thresholdValues.push(x);
                                    var rowObj = {id: id, type: type, name: name, v_width: wid, v_height: hei, vSeries: "[" + vSer + "]", vGroups: "[" + vGrp + "]", gvalue: value.singlevalue, gmax: value.guage_circle_max, gthreshold: "[" + thresholdValues + "]"};
                                    self.visualizations.push(rowObj);
                                    console.log('New Viz Pushed --' + JSON.stringify(rowObj));
                                });
                                self.dashboardName(dname);
                                self.dashboardId(newDashboardId);
//                            console.log('Total Visualizations--' + JSON.stringify(self.visualizations()));
//                            console.log('Fiunished...');
                            }).fail(function (jqxhr, textMessage, error) {
                                overlayoff();
                                var messageFromResource = jqxhr.responseText;
                                if (messageFromResource == undefined || messageFromResource == 'undefined') {
                                    messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                                }
                                console.log("Error while retrieving dashboard definition. Error:" + messageFromResource);
                            });
                        }
                        d_loadMenu(selectedMenu);

                    });

                    self.loadVisualizations = function () {
                        overlayon('Loading available visualizations');
                        self.visualizArray.removeAll();
                        $.getJSON(document.getElementById('appContextPath').value + "/DashboardServlet?operation=get_vizs", function (data) {
//                        console.log(JSON.stringify(data));
                            overlayoff();
                            $.each(data.items, function (index, value) {
                                var visualization_id = value.visualization_id;
                                var visualization_type = value.visualization_type;
                                var visualization_name = value.visualization_name;
                                var visualization_status = value.visualization_status;
                                var title = value.dataset_title;
//{visualization_id: visualization_id, dataset_title: 'Air India', visualization_name: 'Air India', visualization_type: '10.3.6', visualization_query: 2, visualization_status: 2, dataset_status: 'Air India Passenger Stats', support_notes: 1}
                                var rowObj = {visualization_id: visualization_id, dataset_title: title, visualization_name: visualization_name, visualization_status: visualization_status, visualization_type: visualization_type};
                                self.visualizArray.push(rowObj);
                            });
                        }).fail(function (jqxhr, textMessage, error) {
                            overlayoff();
                            var messageFromResource = jqxhr.responseText;
                            if (messageFromResource == undefined || messageFromResource == 'undefined') {
                                messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                            }
                            console.log("Error while fetching all visualizations. Error:" + messageFromResource);
                        });

                    };
                }
                this.getModel = function () {
                    return new this.AppsModel();
                }

                this.info = function (modelObject) {
                    console.log('.........This is Dashboard menu specific model.........');
                };

                this.setup = function (modelObject) {
                    console.log('.......... dashboard.setup() .........')
                    _dashboardModel = modelObject;
                    overlayon('Loading dashboards');
                    $.getJSON(document.getElementById('appContextPath').value + '/DashboardServlet?operation=get_dash', function (response) {
                        overlayoff();
                        console.log(JSON.stringify(response));
                        $.each(response.items, function (index, value) {
                            var dashboard_id = value.dashboard_id;
                            var dashboard_name = value.dashboard_name;
                            var rowObj = {id: dashboard_id, Title: dashboard_name};
                            console.log('Setup :: pushing:' + JSON.stringify(rowObj));
                            modelObject.allDashboards.push(rowObj);
                        });
                        console.log('Setup Fiunished :: Total DBs ==> ' + modelObject.allDashboards().length);
//                        var doc = document.getElementById('avldb');
//                        ko.cleanNode(doc);
//                        ko.applyBindings(modelObject, doc);
                        setTimeout(function () {
                            document.getElementById('d_navList').refresh();
                            console.log('Navigation List is Refreshed');
                        }, 500);
                    }).fail(function (jqxhr, textMessage, error) {
                        overlayoff();
                        var messageFromResource = jqxhr.responseText;
                        if (messageFromResource == undefined || messageFromResource == 'undefined') {
                            messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                        }
                        console.log("Error while retrieving dashboards. Error:" + messageFromResource);
                    });

                };

                this.destroy = function (modelObject) {
                    console.log('==============dashb.destroy============');
                };

            }
            return new parent();

        }
);


var _dashboardModel;
function d_loadMenu(selectedMenu) {
    if (selectedMenu == '' || selectedMenu == undefined) {
        return;
    }
    var htmlPageLocation = $('#' + selectedMenu).attr('data-view');
    var menuSpecificCSS = $('#' + selectedMenu).attr('data-style');
    console.log('View:' + htmlPageLocation + ', CSS:' + menuSpecificCSS);
    if (htmlPageLocation) {
        console.log('Model and View both are defined. Loading into body division.');
        d_loadMenuBodyApplyBindings('menubody', htmlPageLocation, menuSpecificCSS, _dashboardModel, _ko);
    } else {
        console.log('Model & View are not defined for ' + selectedMenu + ', Loading default page.');
    }

}


function d_loadMenuBodyApplyBindings(id, htmlPageLocation, menuSpecificCSS, menuBodyModelObj, ko) {
    $('#' + id).load(htmlPageLocation, function () {
        console.log('View pge is loaded to menubody division.');
        loadSpecificCss(menuSpecificCSS);

        var menuBodyDiv = document.getElementById(id);
        ko.cleanNode(menuBodyDiv);
        ko.applyBindings(menuBodyModelObj, menuBodyDiv);
        console.log('Menu Body -> Bindings Applied');
//        menuBodyModelObj.setup(menuBodyModelObj);
    });
}

function d_loadMenuBody(id, htmlPageLocation, menuSpecificCSS) {
    $('#' + id).load(htmlPageLocation, function () {
        console.log('View pge is loaded to menubody division.');
        loadSpecificCss(menuSpecificCSS);
    });
}

//function deleteDashboard() {
//    var dname = _dashboardModel.dashboardName();
//    var newDashboardId = _dashboardModel.dashboardId();
//
//    _dashboardModel.allDashboards.remove(function (db) {
//        console.log(db.id + '==' + newDashboardId);
//        return db.id == newDashboardId && db.Title == dname;
//    });
//    $('#menubody').html('<div style="text-align: center; color:red; font-size:24px; margin-top:5%;"><b>Dashboard Deleted.</b></div>')
//}
function renderSelectedVizualizations(selectedViz, vizDefArray) {

    if (selectedViz.length == 0) {
        console.log('Please select some visualization');
        return;
    }
    var vizIds = '';
    $.each(selectedViz, function (index, value)
    {
        console.log(JSON.stringify(value));
        if (vizIds.length > 0) {
            vizIds = vizIds + ',';
        }
        vizIds = vizIds + value;
    });
//                        console.log('Total visualizations:' + vizIds);
    vizDefArray.removeAll();
    $.getJSON(document.getElementById('appContextPath').value + '/DashboardServlet?operation=get_viz_details&viz_ids=' + vizIds, function (response) {
        console.log(JSON.stringify(response));
        $.each(response.items, function (index, value) {
            var id = value.visualization_id;
            var type = value.visualization_type;
            var name = value.visualization_name;
            var vSer = [];
            $.each(value.series, function (ind, val) {
                var x = '';
                x = x + '{\"name\" : \"' + ind + '\", \"items\":  [' + val + '] }';
                vSer.push(x);
            });
            var vGrp = [];
            $.each(value.groups, function (ind, val) {
                vGrp.push("\"" + val + "\"");
            });
            var thresholdValues = [];
            var x = '{"max": "' + Number(value.guage_min) + '"}';
            thresholdValues.push(x);
            x = '{"max": "' + Number(value.guage_max) + '"}';
//            thresholdValues.push({max: Number(value.guage_max)});
//            thresholdValues.push({});
            thresholdValues.push(x);
            x = '{}';
            thresholdValues.push(x);
            var rowObj = {id: id, chartid: "chart_" + id, type: type, name: name, vSeries: "[" + vSer + "]", vGroups: "[" + vGrp + "]", gvalue: value.singlevalue, gmax: value.guage_circle_max, gthreshold: "[" + thresholdValues + "]"};
//            console.log(JSON.stringify(rowObj));
            vizDefArray.push(rowObj);
        });
        document.querySelector('#avblViz').close();
    }).fail(function (jqxhr, textMessage, error) {
        overlayoff();
        document.querySelector('#avblViz').close();
        var messageFromResource = jqxhr.responseText;
        if (messageFromResource == undefined || messageFromResource == 'undefined') {
            messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
        }
        console.log("Error while retrieving dashboard definition. Error:" + messageFromResource);
    });

}