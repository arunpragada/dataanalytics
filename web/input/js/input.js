'use strict';
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojfilepicker', 'ojs/ojmessages', 'ojs/ojmessage',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojdialog',
    'jquerymin', 'ojs/ojpulltorefresh',
    'ojs/ojmodel', 'ojs/ojcheckboxset',
    'ojs/ojpopup', 'ojs/ojinputtext',
    'ojs/ojselectcombobox', 'ojs/ojarraydataprovider',
    'ojs/ojtable', 'jqueryuimin', 'ojs/ojarraytabledatasource'],
        function (oj, ko, $) // this callback gets executed when all required modules are loaded
        {
            function parent() {

                var DatasetTableWidthPercentages = [0, 5, 18, 18, 15, 10, 22, 10];
                var DSCartWidthPercentages = [0, 10, 15, 15, 15, 15, 15, 15];
                var DSDeleteCartWidthPercentages = [0, 10, 35, 35, 20];
                this.AppsModel = function () {
                    var self = this;
                    self.filter = ko.observable('');
                    self.previousFilter = ko.observable('');
                    self.progressValue = ko.observable(0);
                    self.numOfCartItems = ko.observable(0);
                    self.genericStatusMessage = ko.observable('');
                    self.uploadDatasetLable = ko.observable('Upload Dataset');
                    self.viewCartLable = ko.observable('Delete Datasets (' + self.numOfCartItems() + ')');
                    self.searchCriteria = ko.observable('');
                    self.cartItems = ko.observableArray([]);
                    self.clearApprovalChangesMsg = ko.observable();
                    self.viewDatasetDetais_DSID = ko.observable();
                    self.selectAllFlag = ko.observable(false);
                    self.selectFlag = ko.observable(false);
                    self.syncCheckBoxFlag = ko.observable(false);
                    self.cancelPrefFlag = ko.observable(false);
                    self.syncCheckBoxOnLoad = ko.observable(false);
                    self.recursionFlag = ko.observable(false);
                    self.datasetMasterTableArr = ko.observableArray([]);
                    self.datasetWorkingArray = ko.observableArray([]);
                    self.datasetWorkingArray(self.datasetMasterTableArr.slice(0));
                    self.datasource = new oj.ArrayTableDataSource(self.datasetWorkingArray, {idAttribute: 'DatasetId'});
                    self.columnArray = [
                        {"renderer": oj.KnockoutTemplateUtils.getRenderer("checkbox_tmpl", true),
                            "headerRenderer": oj.KnockoutTemplateUtils.getRenderer("checkbox_hdr_tmpl", true),
                            "id": "column1", "style": "padding-left:2em; ", "headerStyle": "padding-left:2em; background-color: #5a5d5d; color: #F5F5F5;"},
//                        {"headerText": "Dataset Id",
//                            "field": "DatasetId",
//                            "id": "column3", "class": "DSTable_ID_Data", "headerClassName": "DSTable_ID_Header"},
                        {"headerText": "Dataset Name",
                            "field": "FileName",
                            "id": "column3", "class": "DSTable_Name_Data", "headerClassName": "DSTable_Name_Header"},
                        {"headerText": "Control File",
                            "field": "ControlFileName",
                            "id": "column4", "class": "DSTable_CF_Name_Data", "headerClassName": "DSTable_CF_Name_Header"},
                        {"headerText": "Edge Node Path",
                            "field": "EdgenodePath",
                            "id": "column5", "class": "DSTable_EDGE_Data", "headerClassName": "DSTable_EDGE_Header"},
                        {"headerText": "Dataset Status",
                            "field": "Status",
                            "id": "column6", "class": "DSTable_Status_Data", "headerClassName": "DSTable_Status_Header"},
                        {"headerText": "Comments",
                            "field": "SupportNotes",
                            "renderer": oj.KnockoutTemplateUtils.getRenderer("ds_comments", true),
                            "id": "column7", "class": "DSTable_Comments_Data", "headerClassName": "DSTable_Comments_Header"},
                        {"headerText": "Dateset Details",
                            "renderer": oj.KnockoutTemplateUtils.getRenderer("dataset_details", true),
                            "field": "DatasetDetails",
                            "id": "column8", "class": "DSTable_Details_Data", "headerClassName": "DSTable_Details_Header"}
                    ];

                    self.handleValueChanged = function ()
                    {
//                    console.log('********* ADD Handle Value change ************');
                        var filter = document.getElementById('filter').rawValue;
                        if (filter == undefined || filter.length == 0) {
                            self.clearClick();
                            return;
                        }
                        var tempArray = [];
                        var i;
                        for (i = self.datasetMasterTableArr().length - 1; i >= 0; i--) {
//                        var arrayElement = self.datasetMasterTableArr()[i];
                            var arrayElement = cloneDatasetBaseRecord(self.datasetMasterTableArr()[i], ko);
//                        console.log('cloned:' + JSON.stringify(arrayElement) + ', Original:' + JSON.stringify(self.datasetMasterTableArr()[i]));
                            Object.keys(arrayElement).forEach(function (field) {
                                if (field && (field == 'FileName' || field == 'ControlFileName' || field == 'Status')) {
//                                console.log('Mat Field:' + field + ', value:' + arrayElement[field]);
                                    if (arrayElement[field].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
//                                    console.log('Matched ::' + arrayElement[field].toString().toLowerCase());
                                        if (tempArray.indexOf(arrayElement) < 0) {
//                                        console.log(JSON.stringify(arrayElement));
                                            var isItCartItem = isItemExistInCart(self.cartItems(), arrayElement);
                                            if (isItCartItem == true) {
                                                arrayElement.Selected()[0] = 'checked';
//                                            console.log('cart item :' + JSON.stringify(arrayElement.Selected()) + '<=====>' + JSON.stringify(arrayElement));
                                            } else {
//                                            console.log('not a cart item');
                                            }
                                            tempArray.push(arrayElement);
                                        }
                                    }
                                }
                            });
                        }
                        tempArray.reverse();
                        self.datasetWorkingArray.removeAll();
//                    console.log("Temp Array: " + JSON.stringify(tempArray));

                        self.datasetWorkingArray(tempArray);
                        self.syncCheckBoxOnLoad(true);
                        setTimeout(function () {
                            document.getElementById('dataset_table').refresh();
                            setTimeout(function () {
                                adjustCartTableWidth('dataset_table', DatasetTableWidthPercentages);
                            }, 500);
//                        setTimeout(function () {
//                            self.syncCheckboxesOnLoad();
//                        }, 1000);
                        }, 200);
                    };

                    self.clearClick = function (event) {
                        console.log('*****  Clear Dataset Upload Filter  ********');
                        if (self.filter() == 'LOADING') {
                            console.log('Clear Dataset Upload Filter::Initial Load');
                            return false;
                        }
                        self.filter('');
                        self.previousFilter('');
                        if (self.datasetMasterTableArr().length == self.datasetWorkingArray().length) {
                            console.log('Clear Dataset Upload Filter:: Both master/working arrays are same. Refresh not required.');
                            return false;
                        }
                        self.datasetWorkingArray.removeAll();
                        self.datasetWorkingArray(self.datasetMasterTableArr.slice(0));
                        self.selectCheckboxes(self.cartItems(), 'data');
                        adjustCartTableWidth('dataset_table', DatasetTableWidthPercentages);
//                    self.datasource(new oj.ArrayDataProvider(self.datasetMasterTableArr, {idAttribute: 'DepartmentId'}));
                        self.syncCheckBoxFlag(true);
                        document.getElementById('filter').value = "";
                        return true;
                    };

                    self.progressValue.subscribe(function (newValue) {
                        if (newValue == 100) {
                            $("#loadingRegion").text("Done!");
//                        console.log('Completed');
                        }
                    });
                    var intvObj = window.setInterval(function () {
                        if (self.progressValue() !== -1) {
                            self.progressValue(self.progressValue() + 1);
                        }
                        if (self.progressValue() == 100) {
//                        console.log('Dataset Upload::Progress Val is 100, Stopping interval::' + self.progressValue());
                            window.clearInterval(intvObj);
                        }
                    }, 50);

                    self.onLoadActivities = function () {
                        console.log('.......... Upload Dataset On Load Activities .........')
                        setTimeout(function () {
                            $("#progress-container").hide();
                            $("#cal_main").css("visibility", "visible");
                            console.log('******** Upload Dataset :: Onload Activities Executing. **********');
                            self.syncCheckboxesOnLoad();
                            var aging_table = document.getElementById('dataset_table');
                            $('#dataset_table').on('click', '.oj-checkboxset', self.syncCheckboxes);
                            aging_table.addEventListener('selectionChanged', self.systemSelectionChanged);
                        }, 1000);
                    };

                    self.systemSelectionChanged = function (event) {
                        _selectionChangedInProcessing = false;
                        setTimeout(function () {
                            if (_selectionChangedInProcessing == true) {
                                console.log('Selection changed while processing some logic.');
                                return false;
                            } else {
                                console.log('Selection changed becase of mouse click.');
                                var selectionObj = [];
                                var totalSize = self.datasource.totalSize();
                                var i;
                                var table = document.getElementById('dataset_table');
                                for (i = 0; i < totalSize; i++)
                                {
                                    self.datasource.at(i).then(function (row) {
                                        if (row.data.Selected().length > 0 && row.data.Selected()[0] == 'checked') {
                                            selectionObj.push({startIndex: {row: row.index}, endIndex: {row: row.index}});
                                        }
                                        if (row.index == totalSize - 1) {
                                            table.selection = selectionObj;
                                        }
                                    });
                                }
                            }
                        }, 500);
                    };

                    self.selectAllListener = function (event)
                    {
                        console.log("*******  Dataset Upload :: In selectAllListener    **********");
                        if (self._clearCheckboxHdr) {
                            console.log('Do Nothing ... Checkbox Header');
                            return;
                        }
                        var data = event.detail;
//                    console.log('data='+JSON.stringify(data));
                        if (data != null) {
                            self.selectAllFlag(true);
                            var table = document.getElementById('dataset_table');
                            if (data['value'].length > 0) {
                                var totalSize = self.datasource.totalSize();
                                if (totalSize == 0) {
                                    return;
                                }
                                table.selection = [{startIndex: {"row": 0}, endIndex: {"row": totalSize - 1}}];
                                selectionChangedHandler(table.selection, self.datasource);
                            } else {
                                table.selection = [];
                                selectionChangedHandler(table.selection, self.datasource);
                            }
                        }
                        self.addToCart();
                    };
                    self.changeAddToCartBtnLabel = function () {
                        self.viewCartLable('Delete Datasets (' + self.numOfCartItems() + ')');
                    };
                    self.changeNumOfCartItems = function () {
                        self.numOfCartItems(self.cartItems().length);
                    };
                    self.onCartOpen = function () {
                        console.log('Dialog is opened. width:' + $('#deleteDatasetCart').css('width') + ', height:' + $('#deleteDatasetCart').css('height'));
                        adjustCartTableWidth('deleteds-cart-table', DSDeleteCartWidthPercentages);
                    };
                    self.onDSDetailsPopupOpen = function () {
                        console.log('Dataset Details popup is opened.');
//                    overlayon();
                    };

                    self.addToCart = function () {
                        console.log('****** Dataset Upload :: Adding Items to Cart*******');
                        var totalSize = self.datasource.totalSize();
                        var i;
                        self.cartItems.removeAll();
//                        var anyElementChecked = false;
                        for (i = 0; i < totalSize; i++) {
                            self.datasource.at(i).then(function (row) {
//                                console.log(row.data.Selected()[0] + '--' + JSON.stringify(row.data));
                                if (row.data.Selected().length > 0 && row.data.Selected()[0] == 'checked') {
//                                    anyElementChecked = true;
                                    var found = isItemExistInCart(self.cartItems(), row.data);
//                                    console.log('--add to cart -----2');
                                    if (found == false) {
//                                        console.log('Item adding to cart...');
                                        self.cartItems.push(row);
                                    }
                                }
                                if (row.index == totalSize - 1) {
//                                    if (anyElementChecked == true) {
                                    self.numOfCartItems(self.cartItems().length);
                                    self.changeAddToCartBtnLabel();
                                    console.log("No.of Items in Cart::" + self.numOfCartItems());
                                    if (self.numOfCartItems() > 0) {
//                                            self.genericStatusMessage('Items added to cart');
//                                            displayStatusMessage(1500);
                                    } else {
//                                            self.genericStatusMessage('Please select items to add to cart.');
//                                            displayErrorMessage(2000);
                                    }
//                                    } else {
//                                        self.genericStatusMessage('Please select items to add to cart.');
//                                        displayErrorMessage(2000);
//                                    }
                                }
                            });
                        }
                    };

                    var objCartModel;
                    self.deleteDataset = function () {
                        console.log('****** delete : Upload module*******');
                        if (self.cartItems().length > 0) {
                            $('#deleteDatasetCartBody').load('input/deleteDatasetCart.html', function (status, message, xhr) {
                                if (xhr.status === 200) {
                                    console.log('Delete dataset :: View page is loaded.');
                                    document.querySelector('#deleteDatasetCart').open();
                                    objCartModel = new DeleteDatasetsCartModel(self);
                                    objCartModel.setup();
                                    objCartModel.parentModelObj = self;
                                    self.myCartModel = objCartModel;
                                    var deleteDatasetCartBody = document.getElementById('deleteDatasetCartBody');
                                    ko.cleanNode(deleteDatasetCartBody);
                                    ko.applyBindings(objCartModel, deleteDatasetCartBody);
                                    console.log("Cart Bindings Applied.");
                                    $('#deleteds-cart-table').on('click', '.oj-checkboxset', objCartModel.syncCheckboxes);
                                } else {
                                    self.genericStatusMessage('Error::' + xhr.status + ' - ' + xhr.statusText + '. Please try again.');
                                    displayErrorMessage(2000);
                                }
                            });
                        } else {
                            self.genericStatusMessage('Cart is empty.');
                            displayErrorMessage(2000);
                        }
                    };

                    self.removeDatasetFromObservables = function (obj, datasetIDs) {
                        console.log('Deleting datasets ...' + JSON.stringify(datasetIDs));
                        var i;
                        for (i = 0; i < datasetIDs.length; i++) {
                            console.log('Scannings ' + i + ' elem from array.');
                            var d = obj.remove(function (elem) {
                                return elem.DatasetId == datasetIDs[i];
                            });
                            console.log('Deleted ... ' + JSON.stringify(d));
                        }
                    };

                    self.deleteDatasetInDB = function () {
                        console.log('****** Deleting DS :: Changes to DB *******');
                        var justfication1 = objCartModel.justification();
                        if (justfication1 == undefined || justfication1 == 'undefined') {
                            justfication1 = '';
                        }
                        justfication1 = justfication1.trim();
                        var justfy = encodeURIComponent(justfication1);
                        if (justfy == '') {
                            objCartModel.validationFailedMessage('Provide us valid justification.');
                            return objCartModel.displayError();
                        }
                        var content = '';
                        var datasetIds = getDatasetsIds(self.cartItems());
                        content = content + '&datasets=' + datasetIds;
                        content = content + '&justification=' + justfy;
                        console.log('Content:' + content);
                        overlayon('Saving Changes ...');
                        $.post(document.getElementById('appContextPath').value + '/DatasetOperationsServlet?operation=delete_datasets', content, function (response) {
                            overlayoff();
                            self.removeDatasetFromObservables(self.datasetMasterTableArr, decodeURIComponent(datasetIds).split(','));
                            self.removeDatasetFromObservables(self.datasetWorkingArray, decodeURIComponent(datasetIds).split(','));
                            document.querySelector('#deleteDatasetCart').close();
                            console.log(JSON.stringify(response));
                            self.genericStatusMessage(response.Status);
                            displayStatusMessage(3500);
                            self.clearApprovalChangesMsg(response.Status);
                            self.clearApprovalChanges();
                            setTimeout(function () {
                                document.getElementById('dataset_table').refresh();
                                console.log('Refreshed.....');
                            }, 800)
                        }).fail(function (jqxhr, textMessage, error) {
                            overlayoff();
                            var messageFromResource = jqxhr.responseText;
                            if (messageFromResource == undefined || messageFromResource == 'undefined') {
                                messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                            }
                            console.log("Error while saving deleting dataset. Error:" + messageFromResource);
                            self.genericStatusMessage('Error:-' + messageFromResource);
                            displayStatusMessage(3500);
                            self.clearApprovalChangesMsg(messageFromResource);
                            self.clearApprovalChanges();
                        });
                    };

                    self.clearApprovalChanges = function () {
                        var message = self.clearApprovalChangesMsg();
                        console.log('Message :' + message);
                        if (message == undefined || message == 'undefined') {
                            message = 'Cancelled your selection, Cart is emptied.';
                        }
                        console.log('********** Cancel User Changes ********');
//                    document.querySelector('#modalDialog1').close();
                        document.querySelector('#deleteDatasetCart').close();
                        var table = document.getElementById('dataset_table');
                        self.cancelPrefFlag(true);
                        setTimeout(function () {
                            var selectionObj = [];
                            var totalSize = self.datasource.totalSize();
                            var i;
                            for (i = 0; i < totalSize; i++) {
                                self.datasource.at(i).then(function (row) {
                                    if (row.data.Selected().length > 0 && row.data.Selected()[0] == 'checked') {
                                        row.data.Selected()[0] = '';
                                    }
                                    if (row.index == totalSize - 1) {
                                        table.selection = selectionObj;
                                        selectionChangedHandler(selectionObj, self.datasource);
                                        if (self.numOfCartItems() > 0) {
                                            self.cartItems.removeAll();
                                            self.numOfCartItems(0);
                                            self.genericStatusMessage(message);
                                            self.changeAddToCartBtnLabel();
                                            displayStatusMessage(2500);
                                        }
                                        self._clearCheckboxHdr = true;
                                        $('#table_checkboxset_hdr')[0].value = [];
                                        self._clearCheckboxHdr = false;
                                    }
                                });
                            }
                            self.clearApprovalChangesMsg(undefined);
                        }, 0);
                    };

                    self.syncCheckboxes = function (event)
                    {
                        console.log("***********    In syncCheckboxes   *********");
                        var table = document.getElementById('dataset_table');
                        event.stopPropagation();
                        if (event.currentTarget.id != 'table_checkboxset_hdr')
                        {
                            self._clearCheckboxHdr = true;
                            $('#table_checkboxset_hdr')[0].value = [];
                            self._clearCheckboxHdr = false;
                        }
                        console.log('------1---------');
                        setTimeout(function () {
                            // sync the checkboxes with selection obj
                            var selectionObj = [];
                            var totalSize = self.datasource.totalSize();
                            var i;
                            for (i = 0; i < totalSize; i++)
                            {
                                self.datasource.at(i).then(function (row) {
                                    if (row.data.Selected().length > 0 && row.data.Selected()[0] == 'checked') {
                                        selectionObj.push({startIndex: {row: row.index}, endIndex: {row: row.index}});
                                    }
                                    if (row.index == totalSize - 1) {
                                        self.syncCheckBoxFlag(true);
                                        table.selection = selectionObj;
                                        selectionChangedHandler(selectionObj, self.datasource);
                                        console.log('Invoking addtocart from sync-check');
                                        self.addToCart();
                                    }
                                });
                            }
                        }, 0);
                    };
                    self.changeTableSelection = function () {
                        console.log("***********    In changeTableSelection   *********");
                        var table = document.getElementById('dataset_table');
                        setTimeout(function () {
                            var selectionObj = [];
                            var totalSize = self.datasource.totalSize();
                            var i;
                            for (i = 0; i < totalSize; i++)
                            {
                                self.datasource.at(i).then(function (row) {
                                    if (row.data.Selected().length > 0 && row.data.Selected()[0] == 'checked') {
                                        selectionObj.push({startIndex: {row: row.index}, endIndex: {row: row.index}});
                                    }
                                    if (row.index == totalSize - 1) {
                                        self.syncCheckBoxFlag(true);
                                        setTimeout(function () {
                                            table.selection = selectionObj;
                                            selectionChangedHandler(selectionObj, self.datasource);
                                        }, 1000);
                                    }
                                });
                            }
                        }, 0);
                    };
                    //self.cartItemsArray.push({Selected: ko.observable([]), DatasetId: row.data.DatasetId, ControlFileName: row.data.ControlFileName, FileName: row.data.FileName, HdfsPath: row.data.HdfsPath, EdgenodePath: row.data.EdgenodePath, SupportNotes: row.data.SupportNotes, Status: row.data.Status});

                    self.uncheckCheckboxes = function (rowArray, param)
                    {
                        console.log("*********** Dataset Upload ::   In uncheck Checkboxes   " + JSON.stringify(rowArray) + "*********");
                        var table = document.getElementById('dataset_table');
                        setTimeout(function () {
                            var selectionObj = [];
                            var totalSize = self.datasource.totalSize();
                            console.log('Parent Table Size:' + totalSize);
                            var i;
                            for (i = 0; i < totalSize; i++)
                            {
                                self.datasource.at(i).then(function (row) {
                                    var cnt;
                                    if (row.data.Selected().length > 0 && row.data.Selected()[0] == 'checked') {
                                        var isRowFound = false;
                                        for (cnt = 0; cnt < rowArray.length; cnt++) {
                                            var anotherRow = rowArray[cnt];
                                            if (param == undefined || param == 'undefined' || param == '') {
                                                if (anotherRow.DatasetId == row.data.DatasetId) {
                                                    isRowFound = true;
                                                    break;
                                                }
                                            } else {
                                                if (anotherRow[param].DatasetId == row.data.DatasetId) {
                                                    isRowFound = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (isRowFound == true) {
                                            selectionObj.push({startIndex: {row: row.index}, endIndex: {row: row.index}});
                                            row.data.Selected()[0] = 'checked';
                                        } else {
                                            row.data.Selected()[0] = '';
                                        }
                                    }
                                    if (row.index == totalSize - 1) {
                                        self.syncCheckBoxFlag(true);
                                        table.selection = selectionObj;
                                        selectionChangedHandler(selectionObj, self.datasource);
                                    }

                                });
                            }
                        }, 0);
                    };

                    self.selectCheckboxes = function (rowArray, param)
                    {
                        if (rowArray.length == 0) {
                            console.log('***********    Dataset Upload :: In select Checkboxes. Nothing to do as cart is empty *******');
                            return false;
                        }
                        console.log("***********    Dataset Upload :: In select Checkboxes   " + JSON.stringify(rowArray) + "*********");
                        var table = document.getElementById('dataset_table');
                        setTimeout(function () {
                            var selectionObj = [];
                            var totalSize = self.datasource.totalSize();
                            var i;
                            for (i = 0; i < totalSize; i++) {
                                self.datasource.at(i).then(function (row) {
                                    var isRowFound = false;
                                    var cnt;
                                    for (cnt = 0; cnt < rowArray.length; cnt++) {
                                        var anotherRow = rowArray[cnt];
                                        if (param == undefined || param == 'undefined' || param == '') {
                                            if (anotherRow.DatasetId == row.data.DatasetId) {
                                                isRowFound = true;
                                                break;
                                            }
                                        } else {
                                            if (anotherRow[param].DatasetId == row.data.DatasetId) {
                                                isRowFound = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (isRowFound == true) {
                                        selectionObj.push({startIndex: {row: row.index}, endIndex: {row: row.index}});
                                        row.data.Selected()[0] = 'checked';
                                    } else {
                                        row.data.Selected()[0] = '';
                                    }
                                    if (row.index == totalSize - 1) {
                                        self.syncCheckBoxFlag(true);
                                        table.selection = selectionObj;
                                        selectionChangedHandler(selectionObj, self.datasource);
                                    }

                                });
                            }
                        }, 0);
                    };

                    self.syncCheckboxesOnLoad = function ()
                    {
                        console.log("*******   Dataset Upload:: In syncCheckboxesOnLoad **********");
                        var table = document.getElementById('dataset_table');
                        setTimeout(function () {
                            // sync the checkboxes with selection obj
                            var selectionObj = [];
                            var totalSize = self.datasource.totalSize();
                            var i;
                            for (i = 0; i < totalSize; i++)
                            {
                                self.datasource.at(i).then(function (row) {
                                    if (row.data.Selected().length > 0 && row.data.Selected()[0] == 'checked') {
                                        selectionObj.push({startIndex: {row: row.index}, endIndex: {row: row.index}});
                                    }
                                    if (row.index == totalSize - 1) {
                                        if (selectionObj.length > 0) {
                                            self.syncCheckBoxOnLoad(true);
                                            console.log('syncCheckBoxOnLoad :: ' + self.syncCheckBoxOnLoad());
                                            table.selection = selectionObj;
                                            selectionChangedHandler(selectionObj, self.datasource);
                                        }
//                                    console.log('Selection in sync On load.');
//                                    console.log(JSON.stringify(selectionObj));
                                    }
                                });
                            }
                        }, 0);
                    };

                    self.tableSorted = function (event) {
                        self.changeTableSelection();
                    };

                    var objCartModel;
                    self.uploadDataset = function (event) {
                        $('#UploadDatasetBody').load('input/uploadform.html', function (status, message, xhr) {
                            if (xhr.status === 200) {
                                document.querySelector('#UploadDataset').open();
                                objCartModel = new UploadModel(self);
                                setTimeout(function () {
                                    var objBody = document.getElementById('UploadDatasetBody');
                                    _ko.cleanNode(objBody);
                                    _ko.applyBindings(objCartModel, objBody);
                                }, 1500);
                            } else {
                                self.genericStatusMessage('Error::' + xhr.status + ' - ' + xhr.statusText + '. Please try again.');
                                displayErrorMessage(2000);
                            }
                        });
                    };

                    self.uploadFiles = function (event) {
                        var justfication1 = objCartModel.justification();
                        if (justfication1 == undefined || justfication1 == 'undefined') {
                            justfication1 = '';
                        }
                        justfication1 = justfication1.trim();
                        var justfy = encodeURIComponent(justfication1);
                        if (justfy == '') {
                            objCartModel.validationFailedMessage('Provide us valid justification.');
                            return objCartModel.displayError();
                        }
                        var dsTitle1 = objCartModel.dsTitle();
                        if (dsTitle1 == undefined || dsTitle1 == 'undefined') {
                            dsTitle1 = '';
                        }
                        dsTitle1 = dsTitle1.trim();
                        var dsTitle = encodeURIComponent(dsTitle1);
                        if (dsTitle == '') {
                            objCartModel.validationFailedMessage('Provide us valid dataset title.');
                            return objCartModel.displayError();
                        }
                        if (objCartModel.dataFileNames() == '' || objCartModel.dataFileNames() == undefined || objCartModel.controlFileNames() == '' || objCartModel.controlFileNames() == undefined) {
                            objCartModel.validationFailedMessage('Provide us valid dataset/schema files.');
                            return objCartModel.displayError();
                        }
                        console.log('Uploading Files:' + objCartModel.controlFile().name);
                        console.log('Uploading Files:' + objCartModel.dataFile().name);
                        overlayon('Uploading Dataset');
                        var data = new FormData();
                        data.append("data_file", objCartModel.dataFile());
                        data.append("control_file", objCartModel.controlFile());
                        $.ajax({
                            type: "POST",
                            enctype: 'multipart/form-data',
                            url: $('#appContextPath').val() + "/FileUploadServlet?justification=" + justfy + "&title=" + dsTitle,
                            data: data,
                            processData: false,
                            contentType: false,
                            cache: false,
                            timeout: 600000,
                            success: function (data) {
                                overlayoff();
                                console.log('success response:' + JSON.stringify(data));
                                var res = JSON.parse(data);

                                if (res.status == 500) {
                                    objCartModel.dataFileNames('');
                                    objCartModel.controlFileNames('');
                                    showHide('notificationMessages_success');
                                    document.querySelector('#UploadDataset').close();
                                    self.genericStatusMessage('Dataset Upload Failed.' + res.message);
                                    displayStatusMessage(6000);
                                } else {
                                    var datasetId = res.id;
                                    var fileName = res.title;
                                    var _edgeNodePath = res.datasetPath;
                                    if (_edgeNodePath == undefined || _edgeNodePath == 'undefined') {
                                        _edgeNodePath = '';
                                    }
                                    var _controlFileName = res.controlFileName;
                                    if (_controlFileName == undefined || _controlFileName == 'undefined') {
                                        _controlFileName = '';
                                    }
                                    var _hdfsPath = res.hdfsPath;
                                    if (_hdfsPath == undefined || _hdfsPath == 'undefined') {
                                        _hdfsPath = '';
                                    }
                                    var _status = res.status;
                                    if (_status == undefined || _status == 'undefined') {
                                        _status = '';
                                    }
                                    var _SupportNotes = res.supportnotes;
                                    if (_SupportNotes == undefined || _SupportNotes == 'undefined') {
                                        _SupportNotes = '';
                                    }

                                    objCartModel.dataFileNames('');
                                    objCartModel.controlFileNames('');
                                    showHide('notificationMessages_success');
                                    document.querySelector('#UploadDataset').close();
                                    //var rowObj = {Selected: ko.observable([]), DatasetId: res.id==undefined ?'':res.id, ControlFileName: res.controlFileName, HdfsPath: res.hdfsPath==undefined?'':res.hdfsPath, EdgenodePath: res.edgeNodePath, FileName: res.datasetFileName, SupportNotes: res.SupportNotes==undefined?'':res.SupportNotes, Status: res.status==undefined?'':res.status, DatasetDetails: 'View Details'};
                                    var rowObj = {Selected: ko.observable([]), DatasetId: datasetId, ControlFileName: _controlFileName, HdfsPath: _hdfsPath, EdgenodePath: _edgeNodePath, FileName: fileName, SupportNotes: _SupportNotes, Status: _status, DatasetDetails: 'View Details'};
                                    self.datasetMasterTableArr.push(rowObj);
                                    self.datasetWorkingArray.push(rowObj);
                                    self.genericStatusMessage('Dataset is uploaded successfully. It will be processed and available for visualization soon.');
                                    displayStatusMessage(6000);
                                }
                            },
                            error: function (e) {
                                overlayoff();
                                console.log('failure response:' + JSON.stringify(e) + ', ==' + e.responseText);
                                objCartModel.dataFileNames('');
                                objCartModel.controlFileNames('');
                                showHide('notificationMessages_error');
                                self.genericStatusMessage('Dataset upload failed, please contact system administrator..');
                                displayErrorMessage(6000);
                                document.querySelector('#UploadDataset').close();
                            }
                        });
                    };
                    self.clearDs = function () {
                        objCartModel.dataFileNames('');
                        objCartModel.controlFileNames('');
                    };
                };
                function DeleteDatasetsCartModel(arg) {
                    var self = this;
                    self.validationFailedMessage = _ko.observable();
                    self.justification = _ko.observable();
                    self.dsTitle = _ko.observable();
                    self.selectedCartItems = _ko.observableArray([]);
//                    self.selectedCartItems = _ko.observableArray([]);
                    self.setup = function () {
                    };
                    self.parentModelObj = arg;
                    self.enableCartItemDelete = function (event) {
                        $('#deleteDSFromCart_lab').hide();
                        $('#deleteDSFromCart_btn').show();
                        $('#deleteDSFromCart_btn').css('cursor', 'pointer');
//                    $('#deleteDSFromCart_btn').css('visibility', 'visible');
                    };
                    self.disableCartItemDelete = function (event) {
                        $('#deleteDSFromCart_btn').hide();
                        if (self.cartItemsArray().length > 0) {
                            $('#deleteDSFromCart_lab').show();
                        }
//                    $('#deleteDSFromCart_btn').css('visibility', 'hidden');
                    };
                    self.displayError = function () {
                        $('#errorMessageDiv_CART').show();
                        setTimeout(function () {
                            $('#errorMessageDiv_CART').hide();
                        }, 6000);
                    };

                    self.deleteDSFromCart = function (data, event) {
                        var table = document.getElementById('deleteds-cart-table');
                        var j;
                        for (j = 0; j < self.cartItemsArray().length; j++) {
                            var tmpDatasetId = self.cartItemsArray()[j].DatasetId;
                            for (var i = 0; i < self.selectedCartItems().length; i++) {
                                if (self.selectedCartItems()[i].data) {
                                    var selectedDatasetId = self.selectedCartItems()[i].data.DatasetId;
                                    if (tmpDatasetId == selectedDatasetId) {
                                        self.cartItemsArray.remove(function (entity) {
                                            return (entity.DatasetId == tmpDatasetId);
                                        });
                                        self.parentModelObj.cartItems.remove(function (entity) {
                                            return (entity.data.DatasetId == tmpDatasetId);
                                        });
                                        j = j - 1;
                                        self.parentModelObj.changeNumOfCartItems();
                                        self.parentModelObj.changeAddToCartBtnLabel();
                                    }
                                }
                            }
                        }
                        self.selectedCartItems.removeAll();
                        self.disableCartItemDelete();
                        table.refresh();
                        if (self.cartItemsArray().length == 0) {
                            self.parentModelObj.clearApprovalChangesMsg('Cart is empty.');
                            self.parentModelObj.clearApprovalChanges();
                        } else {
                            self.parentModelObj.uncheckCheckboxes(self.cartItemsArray(), '');
                            adjustCartTableWidth('deleteds-cart-table', DSCartWidthPercentages);
                        }
                    };
                    self.cancelDialog = function () {
                        document.getElementById("editDialog").close();
                        return true;
                    };
                    self.syncCheckboxes = function (event)
                    {
                        console.log("***********    In delete DS cart :: syncCheckboxes   *********");
                        event.stopPropagation();
                        setTimeout(function () {
                            // sync the checkboxes with selection obj
                            var selectionObj = [];
                            var totalSize = self.datasource.totalSize();
                            self.selectedCartItems.removeAll();
                            var i;
                            for (i = 0; i < totalSize; i++)
                            {
                                self.datasource.at(i).then(function (row) {
                                    if (row.data.Selected().length > 0 && row.data.Selected()[0] == 'checked') {
                                        selectionObj.push({DatasetId: row.data.DatasetId});
                                        self.selectedCartItems.push(row);
                                    }
                                    if (row.index == totalSize - 1) {
//                                    self.syncCheckBoxFlag(true);
                                        console.log(JSON.stringify(selectionObj));
//                                    console.log(JSON.stringify(self.selectedCartItems()));
                                        if (selectionObj.length > 0) {
                                            self.enableCartItemDelete();
                                        } else {
                                            self.disableCartItemDelete();
                                        }
                                    }
                                });
                            }
                        }, 0);
                    };
                    self.cartItemsArray = ko.observableArray([]);
                    var cnt;
                    for (cnt = 0; cnt < self.parentModelObj.cartItems().length; cnt++) {
                        var row = self.parentModelObj.cartItems()[cnt];
                        self.cartItemsArray.push({Selected: ko.observable([]), DatasetId: row.data.DatasetId, ControlFileName: row.data.ControlFileName, FileName: row.data.FileName, HdfsPath: row.data.HdfsPath, EdgenodePath: row.data.EdgenodePath, SupportNotes: row.data.SupportNotes, Status: row.data.Status});
                    }
                    self.datasource = new oj.ArrayTableDataSource(self.cartItemsArray, {idAttribute: "DatasetId"});
                    self.columnArray = [{"renderer": oj.KnockoutTemplateUtils.getRenderer("checkbox_tmpl_cart", true),
//                        "headerRenderer": oj.KnockoutTemplateUtils.getRenderer("checkbox_hdr_tmpl", true),
                            "sortable": "disabled",
                            "id": "column1", "style": "padding-left:2em;height:10px; max-height:10px;", "headerStyle": "padding-left:2em; background-color: #5a5d5d; color: #F5F5F5;"},
                        {"headerText": "Dataset Name",
                            "field": "FileName",
                            "id": "column2", "class": "DS_Delete_Table_FN_Data", "headerClassName": "DS_Delete_Table_FN_Header"},
                        {"headerText": "Control File",
                            "field": "ControlFileName",
                            "id": "column4", "class": "DS_Delete_Table_CN_Data", "headerClassName": "DS_Delete_Table_CN_Header"},
                        {"headerText": "Status",
                            "field": "Status",
                            "id": "column5", "class": "DS_Delete_Table_Status_Data", "headerClassName": "DS_Delete_Table_Status_Header"}
                    ];
                }


                this.getModel = function () {
                    return new this.AppsModel();
                }

                this.info = function (modelObject) {
                    console.log('.........This is Upload menu specific model.........');
                };

                this.setup = function (modelObject) {
                    var self = modelObject;
                    modelObject.onLoadActivities();
                    console.log('.......... input.setup() .........');
                    overlayon("Loading user's datasets...");
                    self.datasetMasterTableArr.removeAll();
                    self.datasetWorkingArray.removeAll();
//                    document.getElementById('dataset_table').refresh();
                    /*Loading all active datasets into cache because this module requires users validation.*/
                    $.getJSON(document.getElementById('appContextPath').value + "/DatasetOperationsServlet?operation=get_datasets", function (data) {
                        console.log(JSON.stringify(data));
                        overlayoff();
                        $.each(data.items, function (index, value) {
                            var datasetId = value.datasets_master_id;
                            var fileName = value.dataset_file_name;
                            var title = value.dataset_title;
                            var _edgeNodePath = value.dataset_path;
                            if (_edgeNodePath == undefined || _edgeNodePath == 'undefined') {
                                _edgeNodePath = '';
                            }
                            var _controlFileName = value.control_file_name;
                            if (_controlFileName == undefined || _controlFileName == 'undefined') {
                                _controlFileName = '';
                            }
                            var _hdfsPath = value.hdfs_path;
                            if (_hdfsPath == undefined || _hdfsPath == 'undefined') {
                                _hdfsPath = '';
                            }
                            var _status = value.dataset_status;
                            if (_status == undefined || _status == 'undefined') {
                                _status = '';
                            }
                            var _SupportNotes = value.support_notes;
                            if (_SupportNotes == undefined || _SupportNotes == 'undefined') {
                                _SupportNotes = '';
                            }
                            var rowObj = {Selected: ko.observable([]), DatasetId: datasetId, ControlFileName: _controlFileName, HdfsPath: _hdfsPath, EdgenodePath: _edgeNodePath, FileName: title, SupportNotes: _SupportNotes, Status: _status, DatasetDetails: 'View Details'};
                            self.datasetMasterTableArr.push(rowObj);
                            self.datasetWorkingArray.push(rowObj);
                            setTimeout(function () {
                                adjustCartTableWidth('dataset_table', DatasetTableWidthPercentages);
                            }, 500);
                        });
                    }).fail(function (jqxhr, textMessage, error) {
                        overlayoff();
                        var messageFromResource = jqxhr.responseText;
                        if (messageFromResource == undefined || messageFromResource == 'undefined') {
                            messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
                        }
                        $('#datagrid-wrapper').hide();
                        $('#DS_ErrorMessage').show();
                        $('#DS_ErrorMessage').html(messageFromResource);
                        console.log("Error while fetching entities based on selection. Error:" + messageFromResource);
                    });

                };

                this.destroy = function (modelObject) {
                    console.log('==============input.destroy============');
                };

                function UploadModel(org) {
                    var self = this;
                    self.multiple = ko.observableArray(['multiple']);
                    self.multipleStr = ko.pureComputed(function () {
                        return self.multiple()[0] ? "multiple" : "single";
                    }, self);
                    self.acceptDF = ko.observable(".csv");
                    self.acceptDataFormat = ko.pureComputed(function () {
                        var accept = self.acceptDF();
                        return accept ? accept.split(",") : [];
                    }, self);
                    self.acceptCF = ko.observable("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel");
                    self.acceptControlFormat = ko.pureComputed(function () {
                        var accept = self.acceptCF();
                        return accept ? accept.split(",") : [];
                    }, self);
                    self.dataFileNames = ko.observable();
                    self.controlFileNames = ko.observable();
                    self.dataFile = ko.observable();
                    self.controlFile = ko.observable();
                    self.justification = ko.observable();
                    self.dsTitle = ko.observable();
                    self.validationFailedMessage = ko.observable();
                    self.selectListenerForData = function (event) {
                        var files = event.detail.files;
                        for (var i = 0; i < files.length; i++) {
                            self.dataFileNames(files[i].name);
                        }
                        self.dataFile(files[0]);
                    };
                    self.selectListenerForControl = function (event) {
                        var files = event.detail.files;
                        for (var i = 0; i < files.length; i++) {
                            self.controlFileNames(files[i].name);
                        }
                        self.controlFile(files[0]);
                    };
                    self.displayError = function () {
                        $('#errorMessageDiv_CART').show();
                        setTimeout(function () {
                            $('#errorMessageDiv_CART').hide();
                        }, 6000);
                    };

                }
            }
            return new parent();
        }
);

function isItemExistInCart(cartItems, item) {
    var found = false;
    var cnt;
    for (cnt = 0; cnt < cartItems.length; cnt++) {
        var cartRow = cartItems[cnt];
        if (item.DatasetId == cartRow.data.DatasetId) {
            found = true;
            break;
        }
    }
    return found;
}



function displayStatusMessage(deplay) {
    $('#statusMessageDiv').show();
    $('#statusMessageDiv').css('display', 'inline-block');
    setTimeout(function () {
        $('#statusMessageDiv').hide();
    }, deplay);
}


function displayErrorMessage(deplay) {
    $('#errorMessageDiv').show();
    $('#errorMessageDiv').css('display', 'inline-block');
    setTimeout(function () {
        $('#errorMessageDiv').hide();
    }, deplay);
}

function displayParentErrorMessage(deplay) {
    $('#p_errorMessageDiv').show();
    $('#p_errorMessageDiv').css('display', 'block');
    setTimeout(function () {
        $('#p_errorMessageDiv').hide();
    }, deplay);
}
function displayParentSuccessMessage(deplay) {
    $('#p_successMessageDiv').show();
    $('#p_successMessageDiv').css('display', 'block');
    setTimeout(function () {
        $('#p_successMessageDiv').hide();
    }, deplay);
}

function showDatasetDetails(obj) {
    var datasetId = $(obj).attr('data-DatasetId');
    var datasetName = $(obj).attr('data-DatasetName');
    var datasetStatus = $(obj).attr('data-DatasetStatus');
    console.log('Dataset ID:' + datasetId);
    var objDSDetailsModel = new ViewDatasetDetailsModel(datasetId, datasetName, datasetStatus);
    $('#DSDetailsBody').load('input/datasetDetails.html');
    setTimeout(function () {
        var objDSDetailsBody = document.getElementById('DSDetailsBody');
        _ko.cleanNode(objDSDetailsBody);
        _ko.applyBindings(objDSDetailsModel, objDSDetailsBody);
        document.querySelector('#DSDetailsPopup').open();
    }, 1500);
}



function ViewDatasetDetailsModel(datasetId, datasetName, datasetStatus) {
    var self = this;
    self.columns = [
        {"headerText": "Order",
            "field": "Order",
            "id": "column3", "style": "width:10em; max-width:10em !important;", "headerStyle": "width:10em; max-width:10em; background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"},
        {"headerText": "Name",
            "field": "Name",
            "id": "column2", "style": "width:20em; max-width:20em !important;", "headerStyle": "width:20em; max-width:20em; background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"},
        {"headerText": "Data Type",
            "field": "DataType",
            "id": "column1", "style": "width:15em; max-width:15em !important;", "headerStyle": "width:15em; max-width:15em; background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"},
        {"headerText": "Is Mandatory",
            "field": "Mandatory",
            "id": "column1", "style": "width:10em; max-width:10em !important;", "headerStyle": "width:10em; max-width:10em; background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"},
        {"headerText": "Default Value",
            "field": "DefaultValue",
            "id": "column1", "style": "width:20em; max-width:20em !important;", "headerStyle": "width:20em; max-width:20em; background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"}
    ];
    self.DatasetName = _ko.observable('');
    self.DatasetName('Dataset Name: ' + datasetName);
    self.DatasetStatus = _ko.observable('');
    self.DatasetStatus('Status: ' + datasetStatus);
    self.DSDetailsTable = _ko.observableArray([]);
    self.datasource = new _oj.ArrayTableDataSource(self.DSDetailsTable, {idAttribute: 'SchemaId'});
    self.DS_Table = _ko.observableArray([]);
    self.ds_datasource = new _oj.ArrayTableDataSource(self.DS_Table, {idAttribute: 'idamn'});
    self.ds_columns = _ko.observableArray([]);
    $.getJSON(document.getElementById('appContextPath').value + "/DatasetOperationsServlet?operation=getdatasetdetails&&dataset_id=" + datasetId, function (data) {
        overlayoff();
//                    console.log('Approvers details :' + JSON.stringify(data));
        $.each(data.items, function (index, value) {
            var _schema_id = value.schema_id;
            var _column_order = value.column_order;
            var _column_name = value.column_name;
            var _column_data_type = value.column_data_type;
            var _column_mandatory = value.column_mandatory;
            var _column_default_value = value.column_default_value;
            var rowObj = {SchemaId: _schema_id, Order: _column_order, Name: _column_name, DataType: _column_data_type, Mandatory: _column_mandatory, DefaultValue: _column_default_value};
            self.DSDetailsTable.push(rowObj);
        });
    }).fail(function (jqxhr, textMessage, error) {
        overlayoff();
        var messageFromResource = jqxhr.responseText;
        if (messageFromResource == undefined || messageFromResource == 'undefined') {
            messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
        }
        $('#addappr-cart-appr-table').hide();
        $('#ExistingApprs_ErrorMsg').show();
        $('#ExistingApprs_ErrorMsg').html(messageFromResource);
        console.log("Error while retrieving dataset schema. Error:" + messageFromResource);
    });

    $.getJSON(document.getElementById('appContextPath').value + "/DatasetOperationsServlet?operation=getsampledata&&dataset_id=" + datasetId, function (data) {
        overlayoff();
        var cols = [];
        console.log('Schema::' + JSON.stringify(data.schema[0]));
//        $.each(data.schema[0], function (index, value) {
//            cols.push(value.column_name);
//            var colObj = {"headerText": value.column_name, "field": value.column_name, "id": value.column_name, "headerStyle": "background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"};
//            self.ds_columns.push(colObj);
////            console.log('Pushed new column::' + colObj);
//        });

        $.each(data.schema[0], function (index, value) {
            cols.push(value.column_name);
            if (value.column_name != "idamn") {
                var colObj = {"headerText": value.column_name, "field": value.column_name, "id": value.column_name, "headerStyle": "background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"};
                self.ds_columns.push(colObj);
            }
//            console.log('Pushed new column::' + colObj);
        });
//

//        console.log("Columns in dataset .. " + JSON.stringify(cols));
        $.each(data.items, function (index, value) {
            var rowObj = {};
            for (var i = 0; i < cols.length; i++) {
                var col_name = cols[i];
//                console.log("This Col Name :" + col_name);
                rowObj[col_name] = value[col_name];
            }
            console.log('Row object ::' + JSON.stringify(rowObj));
            self.DS_Table.push(rowObj);
        });
    }).fail(function (jqxhr, textMessage, error) {
        overlayoff();
        var messageFromResource = jqxhr.responseText;
        if (messageFromResource == undefined || messageFromResource == 'undefined') {
            messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
        }
        console.log("Error while retrieving sample dataset records. Error:" + messageFromResource);
    });

}

function cloneDatasetBaseRecord(element, ko) {
    var _select = '';
    if (element.Selected()[0] == 'checked') {
        _select = 'checked';
    }
    return {Selected: ko.observable([_select]), DatasetId: element.DatasetId, ControlFileName: element.ControlFileName, HdfsPath: element.HdfsPath, EdgenodePath: element.EdgenodePath, FileName: element.FileName, SupportNotes: element.SupportNotes, Status: element.Status, DatasetDetails: element.DatasetDetails};
}

