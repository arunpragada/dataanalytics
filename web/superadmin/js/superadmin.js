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
    'menuconfig': '../../superadmin/js/menuconfig',
    'rolemapping': '../../superadmin/js/rolemapping'
};
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
    // This section configures the i18n plugin. It is merging the Oracle JET built-in translation
    // resources with a custom translation file.
    // Any resource file added, must be placed under a directory named "nls". You can use a path mapping or you can define
    // a path that is relative to the location of this main.js file.
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
    'menuconfig', 'rolemapping',
    'ojs/ojcore',
    'knockout',
    'jquery',
    'ojs/ojkeyset',
    'ojs/ojknockout',
    'ojs/ojnavigationlist',
    'ojs/ojswitch',
    'ojs/ojprogress',
    'ojs/ojswitcher',
    'ojs/ojradioset',
    'ojs/ojlabel', 'ojs/ojbutton', 'ojs/ojdialog',
    'jquerymin',
    'jqueryuimin', 'ojs/ojarraytabledatasource',
    'ojs/ojlistview',
    'ojs/ojjquery-hammer',
    'promise', 'ojs/ojpulltorefresh',
    'ojs/ojmodel', 'ojs/ojcheckboxset',
    'ojs/ojpopup', 
//    'ojs/ojanimation', 
    'ojs/ojinputtext',
    'ojs/ojselectcombobox', 'ojs/ojarraydataprovider',
    'ojs/ojtable',
    'ojs/ojdatagrid',
    'ojs/ojcollectiondatagriddatasource',
    'ojs/ojcollectiontabledatasource',
    'ojs/ojinputnumber',
    'ojs/ojvalidation'
],
        function (menuconfig, rolemapping, oj, ko, $, keySet) {
            var modelObjects = {'menuconfig': menuconfig, 'rolemapping': rolemapping};
            _ko = ko;
            _oj = oj;
            console.log('KO, OJ are assigned to global references');
            function headerModel() {
                this.appName = ko.observable("Data Analytics Tool - Configuration");
            }
            var objHeaderModel = new headerModel();
            ko.applyBindings(objHeaderModel, document.getElementById('dashboardHeaderDiv'));

            $.getJSON(document.getElementById('appContextPath').value + "/AdminToolCommonResource?module=common&action=load_user_profile", function (data) {
                console.log(JSON.stringify(data));
            });

            function CommonModel() {
                this.itemOnly = function (context) {
                    return context['leaf'];
                };
                var self = this;
                self.selectedItem = ko.observable('menuconfig');
                self.previousMenu = '';
                loadMenu(self.selectedItem(), modelObjects);
//                this.expanded = new keySet.ExpandedKeySet(['cookbook']);
                self.selectedItem.subscribe(function (selectedMenu) {
                    destroyPreviousModel(modelObjects, self.previousMenu);
                    console.log('New Value:' + JSON.stringify(selectedMenu));
                    loadMenu(selectedMenu, modelObjects);
                    self.previousMenu = selectedMenu;
                });
            }
            var objCommonModel = new CommonModel();
            $(function () {
                ko.applyBindings(objCommonModel, document.getElementById('totalbody'));
            });
        }
);

function destroyPreviousModel(modelObjects, selectedMenu) {
    var modelFactory = modelObjects[selectedMenu];
    if (modelFactory) {
        try {
            modelFactory.destroy(modelFactory)
        } catch (e) {
            var msg = "Script error while destroying previously used model.";
            console.log(msg);
            handleError(e, msg);
        }
    }
}

function loadMenu(selectedMenu, modelObjects) {
    try {
        var menuType = $('#' + selectedMenu).attr('data-menutype');
        if (menuType == 'LEAF') {
            var modelFactory = modelObjects[selectedMenu];
            var htmlPageLocation = $('#' + selectedMenu).attr('data-view');
            var menuSpecificCSS = $('#' + selectedMenu).attr('data-style');
            if (modelFactory && htmlPageLocation) {
                var menuBodyModelObj = modelFactory.getModel();
                console.log('Model retrieved from factory.');
                loadMenuBodyApplyBindings(htmlPageLocation, menuSpecificCSS, menuBodyModelObj, modelFactory, _ko);
            } else if (htmlPageLocation) {
                console.log('Model is not defined for ' + selectedMenu + ', Loading view page.');
                loadMenuBody(htmlPageLocation, menuSpecificCSS);
            } else {
                console.log('Model & View are not defined for ' + selectedMenu + ', Loading default page.');
                loadDefaultMenuBody();
            }
        } else {
            console.log('PARENT MENU is clicked. Just do nothing.');
        }
    } catch (err) {
        console.log('Script error:' + err);
        handleError(err, 'Excetion while loading menu body for ' + selectedMenu);
    }
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

function overlayon(msg) {
    var sHalfWidth = screen.width / 2;
    var sHalfHeight = screen.height / 3;
    document.getElementById("OverlayImg").style.paddingLeft = sHalfWidth + "px";
    document.getElementById("OverlayImg").style.paddingTop = sHalfHeight + "px";
    document.getElementById("overlay").style.display = "block";
    var elem = document.getElementById("overlaytext");
    if (elem && msg) {
        elem.innerHTML = msg;
    }
}

function overlayoff() {
    document.getElementById("overlay").style.display = "none";
    var elem = document.getElementById("overlaytext");
    if (elem) {
        elem.innerHTML = '';
    }
}

function callServerGC() {
//    $.getJSON(document.getElementById('appContextPath').value + "/apprmodifyresource?module=common&action=jvm_gc", function (data) {
//        console.log('[GC Block]' + JSON.stringify(data));
//    });
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

function loadMenuBodyApplyBindings(htmlPageLocation, menuSpecificCSS, menuBodyModelObj, modelFactory, ko) {
    $('#menubody').load(htmlPageLocation, function () {
        console.log('View pge is loaded to menubody division.');
        loadSpecificCss(menuSpecificCSS);

        var menuBodyDiv = document.getElementById('menubody');
        ko.cleanNode(menuBodyDiv);
        ko.applyBindings(menuBodyModelObj, menuBodyDiv);
        console.log('Menu Body -> Bindings Applied');
        modelFactory.setup(menuBodyModelObj);
    });
}

function loadMenuBody(htmlPageLocation, menuSpecificCSS) {
    $('#menubody').load(htmlPageLocation, function () {
        console.log('View pge is loaded to menubody division.');
        loadSpecificCss(menuSpecificCSS);
    });
}


function loadDefaultMenuBody() {
    $('#menubody').html('Default Menu Body');
}
