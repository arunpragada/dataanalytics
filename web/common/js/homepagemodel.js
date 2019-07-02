function applyHomePageModel() {
    var model = new HomePageModel();
    var bindElem = document.getElementById("homeMainDiv");
    _ko.cleanNode(bindElem);
    _ko.applyBindings(model, bindElem);
    console.log('Bindings applied to home  page...');
}

function HomePageModel() {
    var self = this;
    self.menus = _ko.observableArray([]);
    self.menus_datasource = new _oj.ArrayTableDataSource(self.menus);
    self.menudscolumns = [
        {"headerText": "Module",
            "field": "MenuLabel",
             "renderer": _oj.KnockoutTemplateUtils.getRenderer("module_renderer", true),
            "id": "column1", "style": "", "headerStyle": " background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"},
        {"headerText": "Parent Module",
            "field": "ParentMenu",
            "renderer": _oj.KnockoutTemplateUtils.getRenderer("parent_module_renderer", true),
            "id": "column2", "style": "", "headerStyle": "background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"},
        {"headerText": "Roles Mapped",
            "field": "RolesMapped",
            "renderer": _oj.KnockoutTemplateUtils.getRenderer("roles_renderer", true),
            "id": "column3", "style": "", "headerStyle": "background-color: #5a5d5d; color: #F5F5F5; font-weight: 700"}

    ];
    overlayon();
    console.log('making WS call to get menu role-mappings');
    $.getJSON(document.getElementById('appContextPath').value + "/AdminToolCommonResource?module=common&action=getmenurolemappings", function (data) {
        console.log('Data retrieved from server');
        overlayoff();
        $('#MenuResponse').show();
//        var items = JSON.parse(data.items);
        $.each(data.items, function (index, value) {
            var _MenuLabel = value.MenuLabel;
            var _ParentMenu = value.ParentMenu;
            var _RolesMapped = value.RolesMapped;
            var rowObj = {MenuLabel: _MenuLabel, ParentMenu: _ParentMenu, RolesMapped: _RolesMapped};
            self.menus.push(rowObj);
        });
    }).fail(function (jqxhr, textMessage, error) {
        overlayoff();
        var messageFromResource = jqxhr.responseText;
        if (messageFromResource == undefined || messageFromResource == 'undefined') {
            messageFromResource = 'Unexpected error while processing request. Please contact administrator.';
        }
        $('#HomeErrorMessage').html(messageFromResource);
        console.log("Error while retrieving exiting apprs. Error:" + messageFromResource);
    });
}