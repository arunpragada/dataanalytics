'use strict';
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojarraydataprovider', 'ojs/ojchart', 'ojs/ojtoolbar', 'ojs/ojknockout', 'ojs/ojlistview', 'ojs/ojgauge'],
        function (oj, ko, $) // this callback gets executed when all required modules are loaded
        {
            function parent() {
                this.VisualizationModel = function () {
                    var self = this;

//                    var data = [
//                        {visualization_id: visualization_id, dataset_title: 'Air India', visualization_name: 'Air India', visualization_type: '10.3.6', visualization_query: 2, visualization_status: 2, dataset_status: 'Air India Passenger Stats', support_notes: 1}
//                    ];
//                    self.existingVisualizations = new oj.ArrayDataProvider(data,
//                            {keys: data.map(function (value) {
//                                    return value.visualization_id;
//                                })});
                    self.allVizs = ko.observableArray([]);
                    self.existingVisualizations = new oj.ArrayDataProvider(self.allVizs, {'keyAttributes': 'visualization_id'});
                    self.innerRadius = ko.observable(0.5);
                    self.guagevalue = ko.observable(100);
                    self.guagemaxvalue = ko.observable(1000);
                    self.thresholdValues = [{max: 300}, {max: 700}, {}];
                    self.stackValue = ko.observable('off');
                    self.orientationValue = ko.observable('vertical');

                    /* bar chart data */
                    var barSeries = [{name: "Series 1", items: [42, 34]},
                        {name: "Series 2", items: [55, 30]},
                        {name: "Series 3", items: [36, 50]},
                        {name: "Series 4", items: [22, 46]},
                        {name: "Series 5", items: [22, 46]}];
                    var barGroups = ["Group A", "Group B"];

                    self.barSeriesValue = ko.observableArray(barSeries);
                    self.barGroupsValue = ko.observableArray(barGroups);

                    /* line chart data */
                    var lineSeries = [{name: "Series 1", items: [42, 34]},
                        {name: "Series 2", items: [55, 30]},
                        {name: "Series 3", items: [36, 50]},
                        {name: "Series 4", items: [22, 46]},
                        {name: "Series 5", items: [22, 46]}];

                    var lineGroups = ["Group A", "Group B"];

                    self.lineSeriesValue = ko.observableArray(lineSeries);
                    self.lineGroupsValue = ko.observableArray(lineGroups);

                    /* bar-line chart data */
                    var blSeries = [{name: "Series 1", items: [42, 34]},
                        {name: "Series 2", items: [55, 30]},
                        {name: "Series 3", items: [36, 50]},
                        {name: "Series 4", items: [22, 46]},
                        {name: "Series 5", items: [22, 46]}];

                    var blGroups = ["Group A", "Group B"];

                    self.blSeriesValue = ko.observableArray(blSeries);
                    self.blGroupsValue = ko.observableArray(blGroups);

                    /* pie chart data */
                    self.threeDValue = ko.observable('off');

                    var pieSeries = [{name: "Series 1", items: [42]},
                        {name: "Series 2", items: [55]},
                        {name: "Series 3", items: [36]},
                        {name: "Series 4", items: [10]},
                        {name: "Series 5", items: [5]}];

                    self.pieSeriesValue = ko.observableArray(pieSeries);
                    self.visualizationName = ko.observable();
                    self.supportNotes = ko.observable();
                    self.genericStatusMessage = ko.observable();
                    self.selectedDS = ko.observable();
                    self.availableDS = ko.observableArray([]);
                    self.qryId = ko.observable(1);
                    self.selectedVisualization = ko.observable('');
                    self.selectedVisualization.subscribe(function (newValue) {
                        console.log('Visualization is changed ... ' + newValue);
                        if (newValue == undefined || newValue == null || newValue == '') {
                            $("#query_building_part").hide();
                        } else {
                            $("#query_building_part").show();
                        }
                        if (newValue == 'barchart'
                                || newValue == 'barline'
                                || newValue == 'donutchart'
                                || newValue == 'piechart'
                                || newValue == 'linechart') {
                            $('#group_by_divs').show();
                            $('#guage_divs').hide();
                        } else if (newValue == 'guagechart') {
                            $('#group_by_divs').hide();
                            $('#guage_divs').show();
                        } else {
                        }
                    });
                    self.menuItemAction = function (event) {
                        self.selectedMenuItem(event.target.id);
                    }.bind(this);

                    self.verifyQuery = function (event) {
                        console.log('Verifying query ...');
                        if (self.selectedVisualization() == null || self.selectedVisualization() == '') {
                            console.log('Nothing is there in the unsaved mode.');
                            return;
                        }
                        var whereCondition = $('#op_q').val();
                        var whereFeature = $('#feature_q').val();
                        var whereClause = $('#qry_1').val();
                        var aggClause = $('#agg_1').val();
                        var aggFeature = '';
                        if (aggClause) {
                            if (aggClause == 'count') {
                                aggFeature = '*';
                            } else {
                                aggFeature = $('#feature_1').val();
                            }
                        }
                        var isValid = validateViz(self, whereCondition, whereFeature, whereClause, aggClause, aggFeature);
                        if (isValid == true) {
                            var content = '';
                            var finalQuery = '';
                            if (_chartType == 'guagechart') {
                                content = content + 'guage_min=' + $('#min_threshold').val();
                                content = content + '&guage_max=' + $('#max_threshold').val();
                                content = content + '&guage_circle_max=' + $('#max_gauge').val();
                                finalQuery = getSingleValuedQuery(self, whereCondition, whereFeature, whereClause, aggClause, aggFeature)
                                content = content + '&viz_query=' + encodeURIComponent(finalQuery);
                            } else {
                                var numQ = self.qryId();
                                finalQuery = getFinalQuery(self, numQ, whereCondition, whereFeature, whereClause, aggClause, aggFeature)
                                content = content + 'viz_query=' + encodeURIComponent(finalQuery);
                            }
                            console.log('content posting::' + content);
                            overlayon('Verifying Visualization...');
                            $.post(document.getElementById('appContextPath').value + '/VisualizationServlet?operation=validate_viz', content, function (response) {
                                overlayoff();
                                console.log(JSON.stringify(response));
                                updateChart(response);
                                self.genericStatusMessage("Success: Given criteria is valid.");
                                displayParentSuccessMessage(5500);
                            }).fail(function (jqxhr, textMessage, error) {
                                overlayoff();
                                var messageFromResource = jqxhr.responseText;
                                if (messageFromResource == undefined || messageFromResource == 'undefined') {
                                    messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                                    self.genericStatusMessage("Failed: " + messageFromResource);
                                    displayParentErrorMessage(5500);
                                }
                                console.log("Error while validating visualization. Error:" + messageFromResource);

                            });
                        } else {
                            console.log('Visualization is not valid.');
                        }
                    };

                    self.deleteVisualization = function () {
                        console.log(self.supportNotes());
                        if (self.supportNotes() == undefined || self.supportNotes() == 'undefined' || self.supportNotes() == '') {
                            self.genericStatusMessage("Please provide valid justification");
                            displayErrorMessage(2500);
                            return;
                        }
                        var content = '';
                        content = content + 'viz_id=' + _deleteVizId;
                        overlayon('Verifying ...');
                        $.post(document.getElementById('appContextPath').value + '/VisualizationServlet?operation=vefiry_viz_del', content, function (response) {
                            overlayoff();
                            console.log(JSON.stringify(response));
                            if (response.Allowed == true) {
                                overlayon('Deleting Visualization ...');
                                content = content + '&support_notes=' + encodeURIComponent(self.supportNotes());
                                $.post(document.getElementById('appContextPath').value + '/VisualizationServlet?operation=delete_viz', content, function (response2) {
                                    overlayoff();
                                    console.log(JSON.stringify(response2));
                                    self.supportNotes('');
                                    self.allVizs.remove(function (db) {
                                        console.log(db.visualization_id + '==' + _deleteVizId);
                                        return db.visualization_id == _deleteVizId;
                                    });
                                    document.querySelector('#deleteViz').close();
                                });
                            } else {
                                console.log('Delete Visualization is not Allowed. ' + response.Allowed);
                                document.querySelector('#deleteViz').close();
                                self.genericStatusMessage('Delete visualization is not allowed. Seems some dashboard is already using it.');
                                displayQErrorMessage(7500);
                            }
                        });
                    };

                    self.saveVisualization = function () {
                        if (self.selectedVisualization() == null || self.selectedVisualization() == '') {
                            console.log('Nothing is there in the unsaved mode.');
                            return;
                        }
                        console.log('Saving visualization');
                        var name = self.visualizationName();
                        var whereCondition = $('#op_q').val();
                        var whereFeature = $('#feature_q').val();
                        var whereClause = $('#qry_1').val();
                        var aggClause = $('#agg_1').val();
                        var aggFeature = '';
                        if (aggClause) {
                            if (aggClause == 'count') {
                                aggFeature = '*';
                            } else {
                                aggFeature = $('#feature_1').val();
                            }
                        }
                        if (name == undefined || name == null || name == '') {
                            self.genericStatusMessage("Please provide visualization name");
                            displayErrorMessage(2500);
                            return;
                        }

                        var isValid = validateViz(self, whereCondition, whereFeature, whereClause, aggClause, aggFeature);
                        if (isValid == true) {
                            console.log("Provided viz name :: " + name);
                            var content = '1=1';
                            var finalQuery = '';
                            if (_chartType == 'guagechart') {
                                content = content + '&guage_min=' + $('#min_threshold').val();
                                content = content + '&guage_max=' + $('#max_threshold').val();
                                content = content + '&guage_circle_max=' + $('#max_gauge').val();
                                finalQuery = getSingleValuedQuery(self, whereCondition, whereFeature, whereClause, aggClause, aggFeature)
                                content = content + '&viz_query=' + encodeURIComponent(finalQuery);
                            } else {
                                var numQ = self.qryId();
                                finalQuery = getFinalQuery(self, numQ, whereCondition, whereFeature, whereClause, aggClause, aggFeature)
                                console.log('Final query :: ' + finalQuery);
                            }
                            content = content + '&viz_name=' + encodeURIComponent(self.visualizationName());
                            content = content + '&viz_type=' + _chartType;
                            content = content + '&viz_query=' + encodeURIComponent(finalQuery);
                            content = content + '&dataset_id=' + self.selectedDS();
                            content = content + '&support_notes=' + encodeURIComponent(self.supportNotes());
                            console.log('Save Viz:: post content=' + content);

                            overlayon('Saving Changes ...');
                            $.post(document.getElementById('appContextPath').value + '/VisualizationServlet?operation=save_viz', content, function (response) {
                                overlayoff();
                                console.log(JSON.stringify(response));
                                self.genericStatusMessage(response.Status);
                                displayQStatusMessage(7500);
                                var visualization_id = response.id;
                                var visualization_type = _chartType;
                                var visualization_name = self.visualizationName();
                                var visualization_query = finalQuery;
                                var visualization_status = 'SUBMITTED';
                                var support_notes = self.supportNotes();
                                var dataset_status = '';
                                self.visualizationName('');
                                self.supportNotes('');
                                var title = '';
                                for (var j = 0; j < self.availableDS().length; j++) {
                                    var obj = self.availableDS()[j];
                                    if (obj.value == self.selectedDS()) {
                                        title = obj.label;
                                    }
                                }
//{visualization_id: visualization_id, dataset_title: 'Air India', visualization_name: 'Air India', visualization_type: '10.3.6', visualization_query: 2, visualization_status: 2, dataset_status: 'Air India Passenger Stats', support_notes: 1}
                                var rowObj = {visualization_id: visualization_id, dataset_title: title, visualization_name: visualization_name, visualization_query: visualization_query, visualization_status: visualization_status, support_notes: support_notes, dataset_status: dataset_status, visualization_type: visualization_type};
                                self.allVizs.push(rowObj);

                                cleanup();
                                altDisplay('vizHome', 'editCreateViz');
                                document.querySelector('#cancelViz').close();
                            }).fail(function (jqxhr, textMessage, error) {
                                overlayoff();
                                var messageFromResource = jqxhr.responseText;
                                if (messageFromResource == undefined || messageFromResource == 'undefined') {
                                    messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                                }
                                console.log("Error while saving visualization. Error:" + messageFromResource);
                                self.genericStatusMessage(messageFromResource);
                                displayQErrorMessage(7500);
                                cleanup();
                                altDisplay('vizHome', 'editCreateViz');
                                document.querySelector('#cancelViz').close();
                            });


//                            renderChart(_chartType);
                        }
                    };

                    self.clearVisualization = function () {
                        console.log('deleting visualization');
                        cleanup();
                        renderChart(_chartType);
                        document.querySelector('#cancelViz').close();
//                        renderChart(_chartType);
                    };

                    self.addQuery = function () {
                        console.log("Add Query Block");
                        var qryId = self.qryId();
                        qryId = qryId + 1;
                        self.qryId(qryId);
                        var query = _queryTemplate;
                        query = query.replace(/\${qid}/g, String(qryId));
                        $("#user_queries").append(query);
                        self.reattachBindings("qry_div_" + qryId, _vizModel);
                    };

                    self.datasetChanged = function (event) {
                        var dsID = event['detail'].value;
                        console.log('Dataset Changed To::' + dsID);
                        if (dsID == null || dsID == undefined || dsID == '') {
                            console.log('Invalid DS selected');
                            return;
                        }


                        $.getJSON(document.getElementById('appContextPath').value + "/VisualizationServlet?operation=get_schema&dataset_id=" + dsID, function (data) {
                            console.log(JSON.stringify(data));
                            overlayoff();
                            schema_cols.length = 0;
                            schema_cols = [];
                            $.each(data.items, function (index, value) {
                                var column_name = value.column_name;
                                var column_data_type = value.column_data_type;
                                var rowObj = {column_name: column_name, column_data_type: column_data_type};
                                schema_cols.push(rowObj);
                            });
                            addFeaturesToDropdowns(true);

                        }).fail(function (jqxhr, textMessage, error) {
                            overlayoff();
                            var messageFromResource = jqxhr.responseText;
                            if (messageFromResource == undefined || messageFromResource == 'undefined') {
                                messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                            }
                            console.log("Error while fetching ds schema. Error:" + messageFromResource);
                        });


                    };

                    self.reattachBindings = function (id, model) {
                        console.log("Reattach model to " + id);
                        var elem = document.getElementById(id);
                        _ko.cleanNode(elem);
                        _ko.applyBindings(model, elem);
                        console.log('bindings applied');
                    };

                }
                this.getModel = function () {
                    return new this.VisualizationModel();
                }

                this.info = function (modelObject) {
                    console.log('.........This is Visualization menu specific model.........');
                };

                this.setup = function (modelObject) {
                    _vizModel = modelObject;
                    console.log('.......... Visualization.setup() .........');
                    overlayon('Loading available visualizations');
                    $.getJSON(document.getElementById('appContextPath').value + "/VisualizationServlet?operation=get_vizs", function (data) {
//                        console.log(JSON.stringify(data));
                        overlayoff();
                        $.each(data.items, function (index, value) {
                            var visualization_id = value.visualization_id;
                            var visualization_type = value.visualization_type;
                            var visualization_name = value.visualization_name;
                            var visualization_query = value.visualization_query;
                            var visualization_status = value.visualization_status;
                            var support_notes = value.support_notes;
                            var dataset_status = value.dataset_status;
                            var title = value.dataset_title;
//{visualization_id: visualization_id, dataset_title: 'Air India', visualization_name: 'Air India', visualization_type: '10.3.6', visualization_query: 2, visualization_status: 2, dataset_status: 'Air India Passenger Stats', support_notes: 1}
                            var rowObj = {visualization_id: visualization_id, dataset_title: title, visualization_name: visualization_name, visualization_query: visualization_query, visualization_status: visualization_status, support_notes: support_notes, dataset_status: dataset_status, visualization_type: visualization_type};
                            modelObject.allVizs.push(rowObj);
                        });
                    }).fail(function (jqxhr, textMessage, error) {
                        overlayoff();
                        var messageFromResource = jqxhr.responseText;
                        if (messageFromResource == undefined || messageFromResource == 'undefined') {
                            messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                        }
                        console.log("Error while fetching all visualizations. Error:" + messageFromResource);
                    });

                    $.getJSON(document.getElementById('appContextPath').value + "/VisualizationServlet?operation=get_masters", function (data) {
                        console.log(JSON.stringify(data));
                        overlayoff();
                        $.each(data.items, function (index, value) {
                            var datasets_master_id = value.datasets_master_id;
                            var dataset_title = value.dataset_title;
                            var rowObj = {value: datasets_master_id, label: dataset_title};
                            modelObject.availableDS.push(rowObj);
                        });
                    }).fail(function (jqxhr, textMessage, error) {
                        overlayoff();
                        var messageFromResource = jqxhr.responseText;
                        if (messageFromResource == undefined || messageFromResource == 'undefined') {
                            messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                        }
                        console.log("Error while fetching all datasets. Error:" + messageFromResource);
                    });
//                    console.log('Pallet Height::' + $("#pallet_area").css("height"));
//                    $("#chart_area").css("height", $("#pallet_area").css("height"));
                };

                this.destroy = function (modelObject) {
                    console.log('==============viz.destroy============');
                    cleanup();
                    _chartType = '';

                };

            }
            return new parent();

        }
);

function removeQuery(qid) {
    console.log("Remove Query - ::" + qid);
    $('#qry_div_' + String(qid)).remove();
}

function removeAllQueries(quid) {
    var i;
    for (i = 1; i <= quid; i++) {
        console.log("Removing Query - ::" + i);
        if ($('#qry_div_' + String(i)) != null && $('#qry_div_' + String(i)) != undefined) {
            $('#qry_div_' + String(i)).remove();
        } else {
            console.log("Seems query " + ('qry_div_' + String(i)) + " doesn't exist.");
        }
    }
}

//function barchartAdded() {
//    console.log("Add bar chart to visualization");
//    if (_dirtyMode == true) {
//        console.log("Cannot add new visual componenets as there is another component on plot.");
//        openVisualizationDialog();
//    } else {
//        addBarChart();
//    }
//}

function addBarChart() {
    _dirtyMode = true;
    $("#addgrpbtn").show();
    _vizModel.selectedVisualization('barchart');
    $("#barc").show();
    _vizModel.barGroupsValue.removeAll();
    _vizModel.barGroupsValue.push("Group-A");
    _vizModel.barGroupsValue.push("Group-B");
    _vizModel.barSeriesValue.removeAll();
    _vizModel.barSeriesValue.push({name: "Series A", items: [0, 0]});
    _vizModel.barSeriesValue.push({name: "Series B", items: [0, 0]});
    _vizModel.barSeriesValue.push({name: "Series C", items: [0, 0]});
    _vizModel.barSeriesValue.push({name: "Series D", items: [0, 0]});
    console.log("Line chart is prepared. Attaching the model.");
    reattachBindings("barc", _vizModel);
}

function updateChart(data) {
    if (_chartType == 'barchart') {
        _vizModel.barGroupsValue.removeAll();
        console.log('Groups::' + JSON.stringify(data.groups));
        $.each(data.groups, function (index, value) {
            _vizModel.barGroupsValue.push(value);
        });
        _vizModel.barSeriesValue.removeAll();
        console.log('Series::' + JSON.stringify(data.series));
        $.each(data.series, function (index1, value1) {
            console.log('Index => ' + index1 + ', Value=> ' + JSON.stringify(value1));
            var serObj = {name: index1, items: value1};
            console.log(serObj)
            _vizModel.barSeriesValue.push(serObj);
        });
        console.log("Bar chart is prepared. Attaching the model.");
        reattachBindings("barc", _vizModel);
    } else if (_chartType == 'linechart') {
        _vizModel.lineGroupsValue.removeAll();
        console.log('Groups::' + JSON.stringify(data.groups));
        $.each(data.groups, function (index, value) {
            _vizModel.lineGroupsValue.push(value);
        });
        _vizModel.lineSeriesValue.removeAll();
        console.log('Series::' + JSON.stringify(data.series));
        $.each(data.series, function (index1, value1) {
            console.log('Index => ' + index1 + ', Value=> ' + JSON.stringify(value1));
            var serObj = {name: index1, items: value1};
            console.log(serObj)
            _vizModel.lineSeriesValue.push(serObj);
        });
        console.log("Line chart is prepared. Attaching the model.");
        reattachBindings("linec", _vizModel);
    } else if (_chartType == 'guagechart') {
        console.log('singlevalue::' + JSON.stringify(data.singlevalue));
        _vizModel.guagevalue(data.singlevalue);
        _vizModel.guagemaxvalue(Number($('#max_gauge').val()));
        console.log(JSON.stringify(_vizModel.thresholdValues))
        _vizModel.thresholdValues = [];
        _vizModel.thresholdValues.push({max: Number($('#min_threshold').val())});
        _vizModel.thresholdValues.push({max: Number($('#max_threshold').val())});
        _vizModel.thresholdValues.push({});
        console.log(JSON.stringify(_vizModel.thresholdValues))
        console.log("Guage chart is prepared. Attaching the model.");
        reattachBindings("guagec", _vizModel);
    } else if (_chartType == 'barline') {
        _vizModel.blGroupsValue.removeAll();
        console.log('Groups::' + JSON.stringify(data.groups));
        $.each(data.groups, function (index, value) {
            _vizModel.blGroupsValue.push(value);
        });
        _vizModel.blSeriesValue.removeAll();
        console.log('Series::' + JSON.stringify(data.series));
        $.each(data.series, function (index1, value1) {
            console.log('Index => ' + index1 + ', Value=> ' + JSON.stringify(value1));
            var serObj = {name: index1, items: value1};
            console.log(serObj)
            _vizModel.blSeriesValue.push(serObj);
        });
        console.log("Multi chart is prepared. Attaching the model.");
        reattachBindings("barlinec", _vizModel);
    } else if (_chartType == 'piechart' || _chartType == 'donutchart') {
//        _vizModel.pieGroupsValue.removeAll();
//        console.log('Groups::' + JSON.stringify(data.groups));
//        $.each(data.groups, function (index, value) {
//            _vizModel.pieGroupsValue.push(value);
//        });
        _vizModel.pieSeriesValue.removeAll();
        console.log('Series::' + JSON.stringify(data.series));
        $.each(data.series, function (index1, value1) {
            console.log('Index => ' + index1 + ', Value=> ' + JSON.stringify(value1));
            var serObj = {name: index1, items: value1};
            console.log(serObj)
            _vizModel.pieSeriesValue.push(serObj);
        });
        console.log("Pie/Donut chart is prepared. Attaching the model.");
        if (_chartType == 'piechart') {
            reattachBindings("piec", _vizModel);
        } else {
            reattachBindings("donutc", _vizModel);
        }
    }
}

function barlineAdded() {
    console.log("Add bar+line chart to visualization");
    if (_dirtyMode == true) {
        console.log("Cannot add new visual componenets as there is another component on plot.");
        openVisualizationDialog();
    } else {
        addBarLineChart();
    }
}

function addBarLineChart() {
    _dirtyMode = true;
    $("#addgrpbtn").show();
    _vizModel.selectedVisualization('barline');
    $("#barlinec").show();
    _vizModel.blGroupsValue.removeAll();
    _vizModel.blGroupsValue.push("Group-A");
    _vizModel.blGroupsValue.push("Group-B");
    _vizModel.blSeriesValue.removeAll();
    _vizModel.blSeriesValue.push({name: "Series 1", items: [0, 0]});
    _vizModel.blSeriesValue.push({name: "Series 2", items: [0, 0]});
    _vizModel.blSeriesValue.push({name: "Series 3", items: [0, 0]});
    _vizModel.blSeriesValue.push({name: "Series 4", items: [0, 0]});
    console.log("Line chart is prepared. Attaching the model.");
    reattachBindings("barlinec", _vizModel);
}

//function linechartAdded() {
//    console.log("Add line chart to visualization");
//    if (_dirtyMode == true) {
//        console.log("Cannot add new visual componenets as there is another component on plot.");
//        openVisualizationDialog();
//    } else {
//        addLineChart();
//    }
//}

function addLineChart() {
    _dirtyMode = true;
    $("#addgrpbtn").show();
    _vizModel.selectedVisualization('linechart');
    $("#linec").show();
    _vizModel.lineGroupsValue.removeAll();
    _vizModel.lineGroupsValue.push("Group-A");
    _vizModel.lineGroupsValue.push("Group-B");
    _vizModel.lineSeriesValue.removeAll();
    _vizModel.lineSeriesValue.push({name: "Series 1", items: [0, 0]});
    _vizModel.lineSeriesValue.push({name: "Series 2", items: [0, 0]});
    _vizModel.lineSeriesValue.push({name: "Series 3", items: [0, 0]});
    _vizModel.lineSeriesValue.push({name: "Series 4", items: [0, 0]});
    console.log("Line chart is prepared. Attaching the model.");
    reattachBindings("linec", _vizModel);
}

//function piechartAdded() {
//    console.log("Add pie chart to visualization");
//    if (_dirtyMode == true) {
//        console.log("Cannot add new visual componenets as there is another component on plot.");
//        openVisualizationDialog();
//    } else {
//        addPieChart();
//    }
//}

function addPieChart() {
    _dirtyMode = true;
    $("#addgrpbtn").hide();
    _vizModel.selectedVisualization('piechart');
    $("#piec").show();
    _vizModel.pieSeriesValue.removeAll();
    _vizModel.pieSeriesValue.push({name: "Series 1", items: [100]});
//    _vizModel.pieSeriesValue.push({name: "Series 8", items: [31]});
//    _vizModel.pieSeriesValue.push({name: "Series 7", items: [44]});
//    _vizModel.pieSeriesValue.push({name: "Series X", items: [40]});
    console.log("Line chart is prepared. Attaching the model.");

    reattachBindings("piec", _vizModel);
}

function addDonutChart() {
    _dirtyMode = true;
    $("#addgrpbtn").hide();
    _vizModel.selectedVisualization('donutchart');
    $("#donutc").show();
    _vizModel.pieSeriesValue.removeAll();
    _vizModel.pieSeriesValue.push({name: "Series 1", items: [100]});
//    _vizModel.pieSeriesValue.push({name: "Series 8", items: [31]});
//    _vizModel.pieSeriesValue.push({name: "Series 7", items: [44]});
//    _vizModel.pieSeriesValue.push({name: "Series X", items: [40]});
    console.log("Donut chart is prepared. Attaching the model.");

    reattachBindings("donutc", _vizModel);
}

function addGuageChart() {
    _dirtyMode = true;
//    $("#agg_divs").hide();
    $("#group_by_divs").hide();
    $("#guage_divs").show();
    _vizModel.selectedVisualization('guagechart');
    $("#guagec").show();
    console.log("Guage chart is prepared. Attaching the model.");

    reattachBindings("guagec", _vizModel);
}

function openVisualizationDialog(type) {
    console.log('[openVisualizationDialog] Type:' + type + ", currently it is in unsaved?" + _dirtyMode);
    _chartType = type;
    if (_dirtyMode == true) {
        document.querySelector('#cancelViz').open();
    } else {
        renderChart(type);
    }
}

function reattachBindings(id, model) {
    console.log("Reattach model to " + id);
    var elem = document.getElementById(id);
    _ko.cleanNode(elem);
    _ko.applyBindings(model, elem);
    console.log('Global :: bindings applied');
}

function renderChart(type) {
    console.log('[renderChart] Type:' + type);
    if (type == 'barchart') {
        addBarChart();
    } else if (type == 'barline') {
        addBarLineChart();
    } else if (type == 'linechart') {
        addLineChart();
    } else if (type == 'piechart') {
        addPieChart();
    } else if (type == 'donutchart') {
        addDonutChart();
    } else if (type == 'guagechart') {
        addGuageChart();
    }
}

function cleanup() {
    console.log('Cleanup invoked');
    _vizModel.stackValue('off');
    _vizModel.orientationValue('vertical');
    _vizModel.barSeriesValue.removeAll();
    _vizModel.barGroupsValue.removeAll();
    _vizModel.lineSeriesValue.removeAll();
    _vizModel.lineGroupsValue.removeAll();
    _vizModel.blSeriesValue.removeAll();
    _vizModel.blGroupsValue.removeAll();
    _vizModel.pieSeriesValue.removeAll();
    _vizModel.selectedDS('');
    _vizModel.selectedVisualization('');
    $('#query_building_part').hide();
//    removeAllQueries(_vizModel.qryId());
//    _vizModel.qryId(1);
    _dirtyMode = false;

    $("#barc").hide();
    $("#barlinec").hide();
    $("#linec").hide();
    $("#piec").hide();
    $("#guagec").hide();
    $("#donutc").hide();
    $('#qry_1').val('');
    $('#agg_1').val('');
    $('#agg_1').length = 0;
    $('#feature_1').val('');
    $('#feature_1').length = 0;
    $('#max_gauge').val('');
    $('#min_threshold').val('');
    $('#max_threshold').val('');
    $('#feature_q').val('');
    $('#op_q').val('');
    removeGroup();
//    altDisplay('vizHome', 'editCreateViz');
    console.log('All charts are hidden and went back to list view.');
}

function addGroup() {
    var qryId = _vizModel.qryId();
    qryId = qryId + 1;
    _vizModel.qryId(qryId);
    var query = _groupByQuery;
    query = query.replace(/\${gid}/g, String(qryId));
    $("#group_by_divs").append(query);
    if (qryId == 2) {
        if (_vizModel.selectedVisualization() == 'piechart'
                || _vizModel.selectedVisualization() == 'donutchart'
                || _vizModel.selectedVisualization() == 'linechart'
                || _vizModel.selectedVisualization() == 'barline'
                || _vizModel.selectedVisualization() == 'guagechart'
                || _vizModel.selectedVisualization() == 'barchart') {
            $("#addgrpbtn").hide();
        }
    }
    addFeaturesToDropdowns(false);
}

function removeGroup() {
    var qryId = _vizModel.qryId();
    if (qryId == 2) {
        console.log("Remove Query - ::" + _vizModel.qryId());
        $('#grpby_' + String(_vizModel.qryId()) + '_div').remove();
        qryId = qryId - 1;
        _vizModel.qryId(qryId);
    }
    if (qryId < 2) {
        if (_vizModel.selectedVisualization() == 'linechart'
                || _vizModel.selectedVisualization() == 'barline'
                || _vizModel.selectedVisualization() == 'barchart') {
            $("#addgrpbtn").show();
        }
    }
}

function saveVizLinkClicked() {
//    _vizModel.saveVisualization();
    if (_vizModel.selectedVisualization() == '') {
        console.log('Nothing to save.');
        return;
    }
    document.querySelector('#cancelViz').open();
}

function cancelVizLinkClicked() {
//    _vizModel.clearVisualization();
    console.log('Cancelling changes in visualization');
    cleanup();
    document.querySelector('#cancelViz').close();
    altDisplay('vizHome', 'editCreateViz');
}

function altDisplay(arg1, arg2) {
    $("#" + arg1).show();
    $("#" + arg2).hide();
}

function addFeaturesToDropdowns(flag) {

    var op_q = document.getElementById('op_q');
    if ((op_q && op_q.length == 0)) {
        console.log('Operators adding to op_q dropdown::' + op_q.id);
        var option = document.createElement("option");
        option.text = '--Select--';
        op_q.appendChild(option);
        var option1 = document.createElement("option");
        option1.text = '=';
        option1.value = '=';
        op_q.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = '>';
        option1.value = '>';
        op_q.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = '>=';
        option1.value = '>=';
        op_q.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = '<';
        option1.value = '<';
        op_q.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = '<=';
        option1.value = '<=';
        op_q.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = 'contains';
        option1.value = 'contains';
        op_q.appendChild(option1);

    } else {
        console.log('op_q ==> ' + op_q);
    }


    var feature_q = document.getElementById('feature_q');
    if (flag == true && feature_q) {
        console.log('Features adding to feature_q dropdown::' + feature_q.id);
        var x = feature_q.length;
        console.log(feature_q.id + '--Options Length --' + feature_q.length);
        for (var p = 0; p < x; p++) {
            feature_q.remove(0);
        }
        var option = document.createElement("option");
        option.text = '--Select--';
        feature_q.appendChild(option);
        for (var j = 0; j < schema_cols.length; j++) {
            var option1 = document.createElement("option");
            option1.text = schema_cols[j].column_name;
            option1.value = schema_cols[j].column_name;
            feature_q.appendChild(option1);
        }
    } else {
        console.log('feature_q ==> ' + feature_q);
    }

    for (var i = 1; i <= _vizModel.qryId(); i++) {
        var feature = document.getElementById('feature_' + i);
        var grpCol = document.getElementById('grp_col_type_' + i);
        if (flag == true && feature) {
            console.log('Features adding to feature dropdown::' + feature.id);
            var x = feature.length;
            console.log(feature.id + '--Options Length --' + feature.length);
            for (var p = 0; p < x; p++) {
                feature.remove(0);
                console.log('Deleted Opton ' + p + ' from ' + feature.id);
            }
        } else {
            console.log('feature_' + i + ' ==> ' + feature);
        }
        if (grpCol) {
            console.log('Features adding to group by dropdown::' + '--' + grpCol.id);
            var x = grpCol.length;
            console.log(grpCol.id + '--Options Length --' + grpCol.length);
            for (var p = 0; p < x; p++) {
                grpCol.remove(0);
                console.log('Deleted Opton ' + p + ' from ' + grpCol.id);
            }
        } else {
            console.log('grp_col_type_' + i + ' ==> ' + grpCol);
        }
        var option = document.createElement("option");
        if (flag == true && feature) {
            option.text = '--Select--';
            feature.appendChild(option);
        }
        if (grpCol) {
            option = document.createElement("option");
            option.text = '--Select--';
            grpCol.appendChild(option);
        }
        for (var j = 0; j < schema_cols.length; j++) {
            if (flag == true && feature) {
                var option1 = document.createElement("option");
                option1.text = schema_cols[j].column_name;
                option1.value = schema_cols[j].column_name;
                feature.appendChild(option1);
            }
            if (grpCol) {
                var option2 = document.createElement("option");
                option2.text = schema_cols[j].column_name;
                option2.value = schema_cols[j].column_name;
                grpCol.appendChild(option2);
            }
        }
    }

    var select = document.getElementById('agg_1');
    if (select && select.length == 0) {
        select.length = 0;
        var option1 = document.createElement("option");
        option1.text = '--Select--';
        select.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = 'count(*)';
        option1.value = 'count';
        select.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = 'sum';
        option1.value = 'sum';
        select.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = 'Maximum';
        option1.value = 'max';
        select.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = 'Minimum';
        option1.value = 'min';
        select.appendChild(option1);

        option1 = document.createElement("option");
        option1.text = 'Average';
        option1.value = 'avg';
        select.appendChild(option1);
    }
}

function getFinalQuery(self, numQ, whereCondition, whereFeature, whereClause, aggClause, aggFeature) {
    if (whereCondition == 'contains') {
        whereCondition = ' like ';
        whereClause = ' lower(\'%' + whereClause + '%\') ';
        whereFeature = ' lower(' + whereFeature + ') ';
    } else {
        whereClause = '\'' + whereClause + '\''
    }
    var wCond = whereFeature + ' ' + whereCondition + ' ' + whereClause;
    var finalQuery = "select " + aggClause + "(" + aggFeature + "), ${columns} from ds_" + self.selectedDS()
            + " where " + wCond + " ";
    var groupByAdded = false;
    var groupByClasus = 0;
    var groupByColumns = '';
    for (var q = 1; q <= numQ; q++) {
        var groupBy = document.getElementById('grp_col_type_' + q);
        if (groupBy) {
            if (groupByAdded == false) {
                finalQuery = finalQuery + ' group by ';
                groupByAdded = true;
            }
            console.log('groupByClasus => ' + groupByClasus + ' ### groupByColumns => ' + groupByColumns);
            if (groupByClasus > 0) {
                groupByColumns = groupByColumns + ', ';
            }
            groupByColumns = groupByColumns + groupBy.value;
            groupByClasus = groupByClasus + 1;
        }
    }
    finalQuery = finalQuery + groupByColumns;
    finalQuery = finalQuery.replace(/\${columns}/g, groupByColumns);
    return finalQuery;
}

function getSingleValuedQuery(self, whereCondition, whereFeature, whereClause, aggClause, aggFeature) {
    if (whereCondition == 'contains') {
        whereCondition = ' like ';
        whereClause = ' lower(\'%' + whereClause + '%\') ';
        whereFeature = ' lower(' + whereFeature + ') ';
    } else {
        whereClause = '\'' + whereClause + '\''
    }
    var wCond = whereFeature + ' ' + whereCondition + ' ' + whereClause;
    var finalQuery = "select " + aggClause + "(" + aggFeature + ") from ds_" + self.selectedDS()
            + " where " + wCond + " ";
    return finalQuery;
}


function groupByColChanged(obj) {
    var id = obj.id;
    var value = obj.value;
    var colType = '';
    for (var i = 0; i < schema_cols.length; i++) {
        var rowObj = schema_cols[i];
        if (rowObj.column_name == value) {
            colType = rowObj.column_data_type;
            break;
        }
    }
    var qid = id.replace('grp_col_type_', '');
    console.log('Qid:' + qid + ', Col name:' + value + ", Type:" + colType);
    if (colType == 'timestamp') {
        $('#interval_' + qid).show();
    }
    //interval_1
    //grp_col_type_1
}

function editVisualization(obj) {
    var vizid = $(obj).attr('data-vizid');
    var vizName = $(obj).attr('data-vizname');
    console.log('Edit Viz:: Viz Name:' + vizid + ', Viz Name:' + vizName);
}

var _deleteVizId = '';
function deleteVisualization(obj) {
    _deleteVizId = $(obj).attr('data-vizid');
    var vizName = $(obj).attr('data-vizname');
    console.log('Delete Viz:: Viz Name:' + _deleteVizId + ', Viz Name:' + vizName);
    document.querySelector('#deleteViz').open();
}

function aggValueChnged() {
    var aggClause = $('#agg_1').val();
    if (aggClause == 'count') {
        $('#feature_div').hide();
    } else {
        $('#feature_div').show();
    }
}
function validateViz(self, whereCondition, whereFeature, whereClause, aggClause, aggFeature) {
    if (_vizModel.selectedDS() == '' || _vizModel.selectedDS() == undefined) {
        self.genericStatusMessage("Please select valid datasource");
        document.querySelector('#cancelViz').close();
        displayParentErrorMessage(5500);
        return false;
    }

    if ((whereCondition == undefined || whereCondition == null || whereCondition == '')
            || (whereFeature == undefined || whereFeature == null || whereFeature == '')
            || (whereClause == undefined || whereClause == null || whereClause == '')) {
        self.genericStatusMessage("Please provide valid query");
        document.querySelector('#cancelViz').close();
        displayParentErrorMessage(5500);
        return false;
    } else if (aggClause == undefined || aggClause == null || aggClause == '' || aggClause == '--Select--') {
        self.genericStatusMessage("Please provide valid aggrigation");
        document.querySelector('#cancelViz').close();
        displayParentErrorMessage(5500);
        return false;
    } else if (aggClause !== 'count' && (aggFeature == undefined || aggFeature == null || aggFeature == '')) {
        self.genericStatusMessage("Please provide valid feature for aggrigation");
        document.querySelector('#cancelViz').close();
        displayParentErrorMessage(5500);
        return false;
    }
    if (_chartType == 'guagechart') {
        var min_threshold = Number($('#min_threshold').val());
        var max_threshold = Number($('#max_threshold').val());
        var max_gauge = Number($('#max_gauge').val());
        if (min_threshold == '' || min_threshold == undefined) {
            self.genericStatusMessage("Please provide min threshold for gauge");
            document.querySelector('#cancelViz').close();
            displayParentErrorMessage(5500);
            return false;
        } else if (max_threshold == '' || max_threshold == undefined) {
            self.genericStatusMessage("Please provide max threshold for gauge");
            document.querySelector('#cancelViz').close();
            displayParentErrorMessage(5500);
            return false;
        } else if (max_gauge == '' || max_gauge == undefined) {
            self.genericStatusMessage("Please provide maximum value for gauge");
            document.querySelector('#cancelViz').close();
            displayParentErrorMessage(5500);
            return false;
        } else if (max_threshold <= min_threshold) {
            self.genericStatusMessage("Max threshold should be greater than min threshold");
            document.querySelector('#cancelViz').close();
            displayParentErrorMessage(5500);
            return false;
        }
    }
    return true;
}


/**
 * Boolean variable which shows current visulization status
 */
var _dirtyMode = false;
var schema_cols = [];
var _chartType = '';
var _vizModel;
var _queryTemplate = "<div id=\"qry_div_${qid}\" style=\"border: 1px solid; border-radius: 4px; min-height: 5em;width: 100%; margin-top:3px;\">" +
        "<div style=\"margin: 10px; font-size: 1.3em;\">" +
        "<div style=\"padding: 2px;\" class=\"qbody\">" +
        "<div class=\"qbody\"><label>Agg : </label></div><div class=\"qbody\">&nbsp;<select name=\"agg_${qid}\" id=\"agg_${qid}\" style=\"width:10em\"></select></div>" +
        "<div class=\"qbody\"><label>Feature : </label></div><div class=\"qbody\">&nbsp;<select name=\"feature_${qid}\" id=\"feature_${qid}\" style=\"width:10em\"></select></div>" +
        "</div>" +
        "<div style=\"padding: 2px;\" class=\"qbody\">" +
        "<div class=\"qbody\"><label>Group By : </label></div><div class=\"qbody\">&nbsp;<select id=\"grp_col_type_${qid}\" name=\"grp_col_type_${qid}\" style=\"width:10em\"></select>&nbsp;&nbsp;&nbsp;<select id=\"grp_col_${qid}\" name=\"grp_col_${qid}\" style=\"width:10em\"></select></div>" +
        "</div>" +
        "<div style=\"padding: 2px;\" class=\"qbody\">" +
        "<div class=\"qbody\"><label>Time Interval : </label></div><div class=\"qbody\">&nbsp;<select id=\"interval_${qid}\" name=\"interval_${qid}\" style=\"width:10em\"></select></div>" +
        "</div>" +
        "<div style=\"padding: 2px; float:right;\" class=\"qbody\">" +
        "<div class=\"qbody\">&nbsp;<button id=\"remQry_${qid}\" onclick=\"removeQuery(${qid})\" name=\"remQry_${qid}\" class=\"oj-button\" >Remove</button></div>" +
        "</div>" +
        "</div>" +
        "</div>";

var _groupByQuery = '<div style="padding: 2px;" class="" id="grpby_${gid}_div">' +
        '<div  class="qbody"  style="width: 7em;"><label>Group By : </label></div><div class="qbody">&nbsp;<select id="grp_col_type_${gid}" onchange="groupByColChanged(this)" name="grp_col_type_${gid}" style="width:10em"></select></div>' +
        '<div class="qbody" id="grpby_${gid}_time" style="display: none"><label>Time Interval : </label></div>' +
        '<div class="qbody" style="display:none;">&nbsp;' +
        '<input type="text" id="interval_${gid}" name="interval_${gid}" style="width:10em" />' +
        '</div>' +
        '<div class="qbody">&nbsp;<button id="remQry_1" onclick="removeGroup()"  class="oj-button oj-complete"style="width: 5em;">Remove</button></div>' +
        '</div>';