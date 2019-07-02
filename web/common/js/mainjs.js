var _ko;
var _oj;
var myPaths = {
    'knockout': '../../js/libs/knockout/knockout-3.4.2',
    'mapping': '../../js/libs/knockout/knockout.mapping-latest',
    'jquery': '../../js/libs/jquery/jquery-3.3.1.min',
    'jqueryui-amd': '../../js/libs/jquery/jqueryui-amd-1.12.1.min',
    'promise': '../../js/libs/es6-promise/es6-promise.min',
    'hammerjs': '../../js/libs/hammer/hammer-2.0.8.min',
    'ojdnd': '../../js/libs/dnd-polyfill/dnd-polyfill-1.0.0.min',
    'ojs': '../../js/libs/oj/v5.1.0/min',
//                        'ojs': 'libs/oj/v4.1.0/debug',
    'ojL10n': '../../js/libs/oj/v5.1.0/ojL10n',
    'ojtranslations': '../../js/libs/oj/v5.1.0/resources',
    'signals': '../../js/libs/js-signals/signals.min',
    'text': '../../js/libs/require/text',
    'oraclemapviewer': '../../js/libs/oraclemapsv2',
    'oracleelocation': '../../js/libs/oracleelocationv3',
    'customElements': '../../js/libs/webcomponents/custom-elements.min',
    'css': '../../js/libs/require-css/css.min',
    'appConfig': 'appConfigExternal',
    'ConnectionDrawer': '../../js/ConnectionDrawer',
    'jquerymin': '../../js/jquery-3.2.1.min',
    'jqueryuimin': '../../js/jquery-ui.min',
    'menuId1000': '../../common/js/homepagemodel',
    'input_area': '../../input/js/input',
    'dashboard_area': '../../dashboard/js/dashboard',
    'visualization_area': '../../visualization/js/visualization'
};
//console.log('Length of system paths ::' + Object.keys(myPaths).length);
//'use strict';
requirejs.config({
    // Path mappings for the logical module names
    paths: myPaths

            //endinjector
    ,
    // Shim configurations for modules that do not expose AMD
    shim: {
        'jquery': {
            exports: ['jQuery', '$']
        }
    },
    config: {
        ojL10n: {
            merge: {
                //'ojtranslations/nls/ojtranslations': 'resources/nls/menu'
            }
        }
    },
    waitSeconds: 0
});

require([
    'ojs/ojcore',
    'knockout',
    'jquery',
    'ojs/ojkeyset', 'menuId1000', 'input_area', 'visualization_area', 'dashboard_area',
    'ojs/ojknockout',
    'ojs/ojnavigationlist',
    'ojs/ojswitch',
    'ojs/ojprogress',
    'ojs/ojswitcher',
    'ojs/ojradioset',
    'ojs/ojlabel', 'ojs/ojbutton', 'ojs/ojdialog',
    'jquerymin',
    'jqueryuimin', 'ojs/ojarraytabledatasource',
    'ojs/ojoffcanvas', 'ojs/ojlistview',
    'ojs/ojswipetoreveal', 'ojs/ojjquery-hammer',
    'promise', 'ojs/ojpulltorefresh',
    'ojs/ojmodel', 'ojs/ojcheckboxset',
    'ojs/ojpopup',
//    'ojs/ojanimation',
    'ojs/ojinputtext',
    'ojs/ojselectcombobox', 'ojs/ojarraydataprovider',
    'ojs/ojdatetimepicker',
    'ojs/ojtable',
    'ojs/ojdatagrid',
    'ojs/ojcollectiondatagriddatasource',
    'ojs/ojcollectiontabledatasource',
    'ojs/ojinputnumber',
    'ojs/ojvalidation',
    'ojs/ojoption',
    'ojs/ojmenu'
],
        function (oj, ko, $, keySet, model1000, input_model, visualization_model, dashboard_model) {
            var modelObjects = {'input_area': input_model, 'visualization_area': visualization_model, 'dashboard_area': dashboard_model, 'menuId1000': model1000};
            _ko = ko;
            _oj = oj;
//            console.log('KO, OJ are assigned to global references');

            function CommonModel() {
                var self = this;
                self.selectedItem = ko.observable("input_area");
                self.currentEdge = ko.observable("top");
                self.appName = ko.observable("University of West Florida Data Analytics");


                self.valueChangedListener = function (event) {
                    console.log('Tab switched::' + JSON.stringify(event.detail));
                    var oldtab = event.detail.previousValue;
                    var oldmodel = modelObjects[oldtab];
                    var newtab = event.detail.value;
                    if (newtab == 'input_area') {
                        console.log('Loading input/upload settings...');
                        loadMenu(newtab, modelObjects);
                    } else if (newtab == 'visualization_area') {
                        console.log('Loading visualization settings...');
                        loadMenu(newtab, modelObjects);
                    } else if (newtab == 'dashboard_area') {
                        console.log('Loading dashboard settings...');
                        loadMenu(newtab, modelObjects);
                    } else {
                    }
                    oldmodel.destroy(oldmodel);
                };

                self.launch = function (event) {
                    console.log('Launching menu body');
                    event.preventDefault();
                    document.getElementById("myMenu").open(event);
                }.bind(self);

            }
            var objCommonModel = new CommonModel();
            $(function () {
                var ele = document.getElementById('sampleDemo');
                ko.cleanNode(ele);
                ko.applyBindings(objCommonModel, ele);
                console.log('Main bindings applied');
                loadMenu(objCommonModel.selectedItem(), modelObjects);
            });
        }
);

function loadMenu(selectedMenu, modelObjects) {
//    try {
    var menuType = $('#' + selectedMenu).attr('data-menutype');
    if (menuType == 'LEAF') {
        var modelFactory = modelObjects[selectedMenu];
        modelFactory.info();
        var htmlPageLocation = $('#' + selectedMenu).attr('data-view');
        var menuSpecificCSS = $('#' + selectedMenu).attr('data-style');
        console.log('View:' + htmlPageLocation + ', CSS:' + menuSpecificCSS);
        if (modelFactory && htmlPageLocation) {
            console.log('Model and View both are defined. Loading into body division.');
            var menuBodyModelObj = modelFactory.getModel();
            loadMenuBodyApplyBindings(selectedMenu + '_body', htmlPageLocation, menuSpecificCSS, menuBodyModelObj, modelFactory, _ko);
        } else if (htmlPageLocation) {
            console.log('Model is not defined for ' + selectedMenu + ', Loading view page.');
            loadMenuBody(selectedMenu + '_body', htmlPageLocation, menuSpecificCSS);
        } else {
            console.log('Model & View are not defined for ' + selectedMenu + ', Loading default page.');
            loadDefaultMenuBody();
        }
    } else {
        console.log('PARENT MENU is clicked. Just do nothing.');
    }
//    } catch (err) {
//        console.log('Script error:' + err);
//        handleError(err, 'Excetion while loading menu body for ' + selectedMenu);
//    }
}

function handleError(err, message) {
    console.log('JS exception handling block :: Functionality is not implemented.');
}

function loadSpecificCss(path) {
    if (path == undefined || path == 'undefined' || path == '') {
        return false;
    }
    var tokens = document.location.href.split('/');
    var myURL = '';
    for (var i = 0; i < (tokens.length - 1); i++) {
        if (myURL.length > 0) {
            myURL = myURL + '/';
        }
        myURL = myURL + tokens[i];
    }
    if (path) {
        myURL = myURL + '/' + path;
    }
    console.log('Menu Specific CSS Location:' + myURL);
    var cssId = 'SpecificCss';  // you could encode the css path itself to generate id..
    var link = document.getElementById(cssId);
    var head = document.getElementsByTagName('head')[0];
    if (!link) {
        console.log('Creating Menu Specific Link.');
        link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.media = 'all';
        head.appendChild(link);
        link.href = myURL;
    } else {
        console.log('Updating Menu Specific Link.');
        link.href = myURL;
    }
}


function getMonthIndex(month) {
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (i = 0; i < months.length; i++) {
        if (month.toUpperCase() == months[i]) {
            return (i + 1);
        }
    }
}

function getMonthLabel(indx) {
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[indx];
}

function reverseArrays() {
    var i;
    for (i = 0; i < arguments.length; i++) {
        arguments[i].reverse();
    }
}

function arrayMinus(sourceArray, destArray) {
    var result = [];
    if (sourceArray) {
        if (destArray) {
            var i;
            for (i = 0; i < sourceArray.length; i++) {
                var elem = sourceArray[i];
                var found = isElementFoundInArray(elem, destArray);
                if (found == false) {
                    console.log('Push Element [' + elem + '], its not found in ' + destArray + ", Length:" + destArray.length);
                    result.push(elem);
                }
            }
        } else {
            console.log('arrayMinus :: Else');
//            result.push(sourceArray.splice(0, sourceArray.length));
            arrayCopy(sourceArray, result);
        }
    }
    return result;
}


function isApproverExistInList(approversList, item) {
    var found = false;
    var cnt;
    if (approversList) {
        for (cnt = 0; cnt < approversList.length; cnt++) {
            var apprRecord = approversList[cnt];
            if (item.ApproverEmail == apprRecord.ApproverEmail && item.ApprovalLevel == apprRecord.ApprovalLevel) {
                found = true;
                break;
            }
        }
    }
    return found;
}


function isElementFoundInArray(elem, arry) {
    var result = false;
    if (arry && elem) {
        var i;
        for (i = 0; i < arry.length; i++) {
            var item = arry[i];
            if (elem == item) {
                result = true;
                return result;
            }
        }
    }
    return result;
}

function arrayCopy(source, dest) {
    var i;
    dest.length = 0;
    for (i = 0; i < source.length; i++) {
        dest[i] = source[i];
    }
}

function koArrayCopy(source, dest) {
    console.log('Source Length:' + source().length);
    var i;
    dest.removeAll();
    for (i = 0; i < source().length; i++) {
        dest.push(source()[i]);
    }
}

function resizeToOriginal(tab) {
    setTimeout(function () {
        $('#' + tab + ' > table').css("width", "100%");
        $('#' + tab + ' > table > thead').css("width", "90% !important");
        $('#' + tab + ' > table > tbody').css("width", "100%");
        console.log('*** Styles applied to ' + tab + '**');
    }, 1500);
}

function getCartEntitiesJSON(array) {
    var jsoncontent = '{entities=[';
    var i;
    if (array) {
        for (i = 0; i < array.length; i++) {
            if (i == 0) {
                jsoncontent = jsoncontent + JSON.stringify(array[i].data);
            } else {
                jsoncontent = jsoncontent + ',' + JSON.stringify(array[i].data);
            }
        }
    }
    jsoncontent = jsoncontent + ']';
    return encodeURIComponent(jsoncontent);
}

function getDatasetsIds(array) {
    var jsoncontent = '';
    var i;
    if (array) {
        for (i = 0; i < array.length; i++) {
            if (i == 0) {
                jsoncontent = jsoncontent + JSON.stringify(array[i].data.DatasetId);
            } else {
                jsoncontent = jsoncontent + ',' + JSON.stringify(array[i].data.DatasetId);
            }
        }
    }
    return encodeURIComponent(jsoncontent);
}

function getCartApproversJSON(array) {
    var jsoncontent = '{approvers=[';
    var i;
    if (array) {
        for (i = 0; i < array.length; i++) {
            if (i == 0) {
                jsoncontent = jsoncontent + JSON.stringify(array[i]);
            } else {
                jsoncontent = jsoncontent + ',' + JSON.stringify(array[i]);
            }
        }
    }
    jsoncontent = jsoncontent + ']';
    return encodeURIComponent(jsoncontent);
}

function resizeTextFields(id, size) {
    setTimeout(function () {
        $('#' + id + ' > input').css("width", size + "em");
        console.log('*** Resized ' + id + ' to ' + size + '**');
    }, 1500);
}

function overlayon() {
    var sHalfWidth = screen.width / 2;
    var sHalfHeight = screen.height / 3;
    document.getElementById("OverlayImg").style.paddingLeft = sHalfWidth + "px";
    document.getElementById("OverlayImg").style.paddingTop = sHalfHeight + "px";
    document.getElementById("overlay").style.display = "block";
}

function overlayoff() {
    document.getElementById("overlay").style.display = "none";
}

function getPercentage(per, total) {
    if (per && total) {
        return (total * per) / 100;
    } else {
        return 0;
    }
}


var _selectionChangedInProcessing;
/**
 *  This method marks check boxes as selected/unselected based on selectionObj argument.
 * @param {type} selectionObj
 * @param {type} datasource
 */
function selectionChangedHandler(selectionObj, datasource) {
    _selectionChangedInProcessing = true;
    console.log('selectionChangedHandler :: ' + selectionObj);
    var totalSize = datasource.totalSize();
    var i, j;
    for (i = 0; i < totalSize; i++) {
        datasource.at(i).then(function (row) {
            var foundInSelection = false;
            if (selectionObj) {
                for (j = 0; j < selectionObj.length; j++) {
                    var range = selectionObj[j];
                    var startIndex = range.startIndex;
                    var endIndex = range.endIndex;

                    if (startIndex != null && startIndex.row != null) {
                        if (row.index >= startIndex.row && row.index <= endIndex.row) {
                            row.data.Selected(['checked']);
                            foundInSelection = true;
                        }
                    }
                }
            }
            if (!foundInSelection) {
                row.data.Selected([]);
            }
        });
    }
}
;

function adjustCartTableWidth(tableId, widthAllocated) {
    try {
        var ojTabWidth = $('#' + tableId).css('width');
        var ojTabHeight = $('#' + tableId).css('height');
        var ojTabWidthNum = Number(ojTabWidth.replace('px', ''));
        var gap = 5;
        var idealTbodyWidth = ojTabWidthNum - gap;
        idealTbodyWidth = idealTbodyWidth + 'px';
        console.log('[adjustCartTableWidth] ' + tableId + ' contained cart is opened. OJ-Table width:' + ojTabWidth + ', height:' + ojTabHeight);
        var ths = $('#' + tableId + ' > table > thead > tr > th');
        var i;
        for (i = 0; i < ths.length; i++) {
            var thWidth = $(ths[i]).css('min-width');
            if (thWidth) {
                var thisThWidth = Number(thWidth.replace('px', ''));
//                console.log('th[' + i + '] => (before) ' + thisThWidth);
                if (thisThWidth > 0) {
                    var maxAllowed = getPercentage(widthAllocated[i], (ojTabWidthNum - gap));
                    $(ths[i]).css('min-width', maxAllowed + 'px');
                }
//                console.log('th[' + i + '] => (after) ' + $(ths[i]).css('min-width'));
            }
        }
//                    var tds = $('#modifyappr-cart-table > table > tbody > tr:nth-child(1) > td');
        var trs = $('#' + tableId + ' > table > tbody > tr');
        console.log('Num rows in cart table:' + trs.length);
        for (var j = 0; j < trs.length; j++) {
//        console.log('adjusting individual tr[' + j + '] widhts');
            var tds = trs[j].children;
            for (i = 0; i < tds.length; i++) {
//            console.log('td[' + i + '] => (before) ' + $(tds[i]).css('min-width'));
                $(tds[i]).css('min-width', $(ths[i]).css('min-width'));
                $(tds[i]).css('max-width', $(ths[i]).css('min-width'));
                $(tds[i]).css('overflow', 'hidden');
                $(tds[i]).css('white-space', 'nowrap');
//            console.log('td[' + i + '] => (after) ' + $(tds[i]).css('min-width'));
            }

        }
        var innerTableWidth = $('#' + tableId + ' > table').css('width');
        var innerTableWidthNum = Number(innerTableWidth.replace('px', ''));
        if (innerTableWidthNum > ojTabWidthNum) {
            $('#' + tableId + ' > table').css('width', idealTbodyWidth);
            console.log('table width adjusted to ' + idealTbodyWidth);
        }
        var innerTableBodyWidth = $('#' + tableId + ' > table > tbody').css('width');
        var innerTableBodyWidthNum = Number(innerTableBodyWidth.replace('px', ''));
        if (innerTableBodyWidthNum > (ojTabWidthNum - 5)) {
            $('#' + tableId + ' > table > tbody').css('width', idealTbodyWidth);
            console.log('tbody width adjusted to ' + idealTbodyWidth);
        }
        var theadWidth = $('#' + tableId + ' > table > thead').css('width');
        var theadWidthNum = Number(theadWidth.replace('px', ''));
        if (theadWidthNum > (ojTabWidthNum - 5)) {
            $('#' + tableId + ' > table > thead').css('width', idealTbodyWidth);
            console.log('thead width adjusted to ' + idealTbodyWidth);
        }
        console.log('[adjustCartTableWidth] [' + tableId + '] OJ table\'s internal table width :: ' + innerTableWidth + ', tbody width:' + innerTableBodyWidth + ', original table width:' + ojTabWidth + ', Ideal tbody width:' + idealTbodyWidth);
    } catch (err) {
        var errorMessage = 'JS error while adjusting table[' + tableId + '] widths';
        console.log(errorMessage);
        handleError(err, errorMessage);
    }
}


function loadMenuBodyApplyBindings(id, htmlPageLocation, menuSpecificCSS, menuBodyModelObj, modelFactory, ko) {
    $('#' + id).load(htmlPageLocation, function () {
        console.log('View pge is loaded to menubody division.');
        loadSpecificCss(menuSpecificCSS);

        var menuBodyDiv = document.getElementById(id);
        ko.cleanNode(menuBodyDiv);
        ko.applyBindings(menuBodyModelObj, menuBodyDiv);
        console.log('Menu Body -> Bindings Applied');
        modelFactory.setup(menuBodyModelObj);
    });
}

function loadMenuBody(id, htmlPageLocation, menuSpecificCSS) {
    $('#' + id).load(htmlPageLocation, function () {
        console.log('View pge is loaded to menubody division.');
        loadSpecificCss(menuSpecificCSS);
    });
}


function loadDefaultMenuBody() {
    $('#menubody').html('Default Menu Body');
}

function launch() {
    $("#myMenu").show();
    document.getElementById("myMenu").open();
}

function showHide(id) {
    $('#' + id).show();
    setTimeout(function () {
        $('#' + id).hide();
    }, 6000);
}


function displayQErrorMessage(deplay) {
    $('#q_errorMessageDiv').show();
    $('#q_errorMessageDiv').css('display', 'block');
    setTimeout(function () {
        $('#q_errorMessageDiv').hide();
    }, deplay);
}

function displayQStatusMessage(deplay) {
    $('#q_successMessageDiv').show();
    $('#q_successMessageDiv').css('display', 'block');
    setTimeout(function () {
        $('#q_successMessageDiv').hide();
    }, deplay);
}