<!DOCTYPE html>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html lang="en-us" style="height:100%;" dir="ltr">
    <head>
        <title>University of West Florida Data Analytics</title>
        <meta charset="UTF-8">
        <meta http-equiv="x-ua-compatible" content="IE=edge">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/x-icon" href="css/images/favicon.ico">
        <link rel="apple-touch-icon-precomposed" href="../css/images/touchicon.png">
        <meta name="apple-mobile-web-app-title" content="Oracle JET">
        <link rel="stylesheet" id="css" href="css/libs/oj/v5.1.0/alta/oj-alta-min.css">
        <link rel="stylesheet" href="common/css/app.css">
        <link rel="stylesheet" href="css/demo-alta-site-min.css">
        <!--<link rel="stylesheet" href="css/demo.css">-->
        <script>
            // The "oj_whenReady" global variable enables a strategy that the busy context whenReady,
            // will implicitly add a busy state, until the application calls applicationBootstrapComplete
            // on the busy state context.
            window["oj_whenReady"] = true;
        </script>
        <script data-main="common/js/mainjs" src="js/libs/require/require.js"></script>
        <style>
            #datagrid-wrapper-ma{
                margin-left: 2%;
            }

            #datagrid-wrapper{
                margin-left: 2%;
            }
        </style>
    </head>
    <body class="demo-disable-bg-image">
        <div id="overlay" style="display: none;">
            <img id="OverlayImg">
            <div style="/*margin-top: 20%;*/">
                <div id="overlaytext" style="text-align: center;  font-size: 17px; font-weight: 500; color: #3498db;"></div>
                <div class="loading_wait"></div>
            </div>         
            <!--<img id="OverlayImg" src='css/images/pleasewait.gif' width="128" height="128" style="vertical-align:middle; "/>-->
        </div>
        <input type="hidden" id="appContextPath" name="appContextPath" value="<%=request.getContextPath()%>"/>
        <%
            System.out.println("From JSP::" + request.getContextPath());
        %>
        <input type="hidden" id="logged_in_user" name="logged_in_user" value="${sessionScope.sso_userlogin}"/>

        <div id="sampleDemo" style="height: 100%;" class="demo-padding demo-container">
            <header id="dashboardHeaderDiv" role="banner" style="top: 0px;     background-color: #f0f0f0;    width: 100%;  z-index: 1;    text-align: left;    display: block;">
                <img style="height: 2.5em; display: inline;" src="css/images/logo.png" type="image/svg+xml"/>
                <span style="display: inline;"><h2 style="display: inline;font-weight: 500;font-size: 20px;" title="Application Name" data-bind="text: appName"></h2></span>
                <label style="float: right; padding-top: 0.5em; margin-right: 2%"><a style="cursor: pointer;">${sessionScope.sso_userlogin}</a></label>
                <oj-tab-bar style="overflow:hidden; display: inline-block; float: right" id="hnavlist" edge="[[currentEdge]]" selection="{{selectedItem}}">
                    <ul class="idcscustom-ul oj-navigationlist-element oj-navigationlist-has-icons">
                        <li id="input_area" class="oj-navigationlist-item-element oj-navigationlist-item" data-menutype="LEAF" data-view="input/input.html" data-style="input/css/input.css">
                            <a href="#" aria-controls="input-panel" id="input-tab" >
                                <span class="oj-navigationlist-item-icon demo-icon-font-24 demo-copy-icon-24"></span>
                                <span class="oj-navigationlist-item-label">Upload</span>
                            </a>
                        </li>

                        <li role="separator" class="oj-navigationlist-divider"></li>

                        <li id="visualization_area" class="oj-navigationlist-item-element oj-navigationlist-item" data-menutype="LEAF" data-view="visualization/visualization.html" data-style="visualization/css/app.css">
                            <a href="#"  aria-controls="visualization-panel" id="blogs-tab">
                                <span class="oj-navigationlist-item-icon demo-icon-font-24 demo-edit-icon-24"></span>
                                <span class="oj-navigationlist-item-label">Visualization</span>
                            </a>
                        </li>

                        <li role="separator" class="oj-navigationlist-divider"></li>

                        <li id="dashboard_area" class="oj-navigationlist-item-element oj-navigationlist-item" data-menutype="LEAF" data-view="dashboard/dashboard.html" data-style="dashboard/css/app.css">
                            <a href="#" aria-controls="dashboard-panel" id="home-tab" >
                                <span class="oj-navigationlist-item-icon demo-icon-font-24 demo-chart-icon-24"></span>
                                <span class="oj-navigationlist-item-label">Dashboard</span>
                            </a>
                        </li>
                        <!--				
                        <li role="separator" class="oj-navigationlist-divider"></li>
                                                        
                        <li id="map_area" class="oj-navigationlist-item-element oj-navigationlist-item">
                            <a href="#" aria-controls="settings-tab-panel" id="settings-tab" >
                                <span class="oj-navigationlist-item-label">Map</span>
                            </a>
                        </li>
                        -->
                        <!--                                <li id="about">
                                                            <a href="#"  aria-controls="about-tab-panel" id="about-tab">
                                                                About
                                                            </a>
                                                        </li>-->
                    </ul>
                </oj-tab-bar>
            </header>


            <div id="componentDemoContent" style="width: 1px; min-width: 100%; height: 94%" class="oj-web-applayout-content oj-web-applayout-max-width">
                <!--                <div id="totalbody" style="height: 100%">
                                    <div id="menubody" style="display: inline-block; vertical-align: top;width:100%; padding-left: 0.5%;height: 99%;max-height: 99%;">
                                    </div>
                                </div>-->
                <div id="demo-container" style="height: 100%;" class="oj-flex demo-edge-top">
                    <oj-switcher value="[[selectedItem]]" on-value-changed="{{valueChangedListener}}" style="width: 100%">
                        <div slot="input_area"
                             id="input-panel"
                             role="tabpanel" 
                             aria-labelledby="input-tab">
                            <div id="input_area_body">Input</div>
                        </div>
                        <div slot="dashboard_area"
                             id="dashboard-panel"
                             role="tabpanel" 
                             aria-labelledby="home-tab" style="height: 100%;">
                            <div id="dashboard_area_body" style="height: 100%;">Dashboard</div>
                        </div>
                        <div slot="visualization_area"
                             id="visualization-panel"
                             role="tabpanel" 
                             aria-labelledby="blogs-tab">
                            <div id="visualization_area_body">Visualization</div>
                        </div>
                        <div slot="map_area"
                             id="settings-tab-panel"
                             role="tabpanel" 
                             aria-labelledby="settings-tab">

                        </div>
                        <div slot="about"
                             id="about-tab-panel"
                             role="tabpanel" 
                             aria-labelledby="about-tab">
                            <div class="demo-tab-content">
                                <h2>About content area</h2>
                            </div>
                        </div>
                    </oj-switcher>
                </div>  
            </div>

            <footer class="oj-web-applayout-footer" role="contentinfo" style="bottom: 2px;    position: absolute;    width: 99.7%; display: none;">
                <div class="oj-web-applayout-footer-item oj-web-applayout-max-width">
                    <ul>
                        <li><a href="#">About University</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Legal Notices</a></li>
                    </ul>
                </div>
                <div class="oj-web-applayout-footer-item oj-text-secondary-color oj-text-sm oj-web-applayout-max-width">
                    Copyright info, All rights reserved.
                </div>
            </footer>

        </div>
        <script type="text/javascript" id="mainpageScript">
            overlayon('Loading Data Analytics Tool...');
            function overlayon(msg) {
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
            setTimeout(function () {
                overlayoff();
            }, 10000);
        </script>
    </body>
</html>