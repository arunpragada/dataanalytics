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
        function (oj, ko, $) // this callback gets executed when all required modules are loaded
        {
            function parentModel() {

                this.getModel = function () {
                    console.log('Get Model:: In role mapping model');
                    return new this.RoleMappingModel();
                };
                this.RoleMappingModel = function () {};
                this.setup = function (modelObj) {
                    console.log('.......... role mapping model.setup() .........');
                };
                this.destroy = function () {};
            }
            return new parentModel();
        }
);
