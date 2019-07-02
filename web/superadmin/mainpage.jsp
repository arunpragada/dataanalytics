<!DOCTYPE html>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html lang="en-us" style="height:100%;" dir="ltr">
    <head>
        <title>University of West Florida Data Analytics - Configuration</title>
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
        <script>
            // The "oj_whenReady" global variable enables a strategy that the busy context whenReady,
            // will implicitly add a busy state, until the application calls applicationBootstrapComplete
            // on the busy state context.
            window["oj_whenReady"] = true;
        </script>
        <script data-main="superadmin/js/superadmin" src="js/libs/require/require.js"></script>
    </head>
    <body class="demo-disable-bg-image">
        <div id="overlay" style="display: none;">
            <img id="OverlayImg">
            <div style="margin-top: 20%;">
                <div id="overlaytext" style="text-align: center;  font-size: 17px; font-weight: 500; color: #3498db;"></div>
                <div class="loading_wait"></div>
            </div>         
            <!--<img id="OverlayImg" src='css/images/pleasewait.gif' width="128" height="128" style="vertical-align:middle; "/>-->
        </div>
        <input type="hidden" id="appContextPath" name="appContextPath" value="<%=request.getContextPath()%>"/>
        <input type="hidden" id="logged_in_user" name="logged_in_user" value="${sessionScope.sso_userlogin}"/>

        <div id="sampleDemo" style="height: 100%;" class="demo-container">
            <header id="dashboardHeaderDiv" role="banner">
                <img style="height: 2.5em;width: 11em; padding-left: 2vh; display: inline;" src="css/images/OracleLogo_FromSVG.PNG" type="image/svg+xml"/>
                <span style="display: inline;"><h2 style="display: inline;font-weight: 500;font-size: 20px;" title="Application Name" data-bind="text: appName"></h2></span>
                <label style="float: right; padding-top: 0.5em; margin-right: 2%; width: auto; height: auto; font-size: unset;"><a style="cursor: pointer;">${sessionScope.sso_userlogin}</a></label>
            </header>
            <div id="componentDemoContent" style="width: 1px; min-width: 100%; height: 92%; padding-top: 4px;">
                <div id="totalbody" style="height: 100%">
                    <c:if test="${requestScope.errorInProcessing eq 'true'}">
                        <div style="text-align: center; padding: 5px;">
                            <c:choose>
                                <c:when test="${requestScope['javax.servlet.error.status_code'] eq '404'}">
                                    <h1 style="color: #ff0000;font-size: 8em; font-weight: 500">404</h1>
                                    <h2 style="font-weight: 400">We're sorry, the page does not exist or is no longer available.</h2>
                                </c:when>
                                <c:otherwise>
                                    <h2 style="font-weight: 400">We're sorry, cannot process your request right now. Please contact administrator.</h2>
                                </c:otherwise>
                            </c:choose>
                        </div>
                    </c:if>
                    <c:if test="${requestScope.errorInProcessing eq null}">
                        <div id="navlistcontainer" style="" class="mainpage_NavContainer">
                            <oj-navigation-list aria-label="Choose a navigation item" 
                                                drill-mode="collapsible"
                                                selection="{{selectedItem}}"
                                                >
                                <ul >
                                    <li id="menuconfig" data-menutype="LEAF" data-view="superadmin/menuconfig.html" data-style="superadmin/css/app.css">
                                        <a href="#">
                                            <span class="oj-navigationlist-item-icon
                                                  demo-icon-font-24
                                                  demo-list-icon-16">
                                            </span>
                                            Menu Configuration
                                        </a>
                                    </li>
                                    <li id="rolemapping" data-menutype="LEAF" data-view="superadmin/rolemapping.html" data-style="superadmin/css/app.css">
                                        <a href="#">
                                            <span class="oj-navigationlist-item-icon
                                                  demo-icon-font-24
                                                  demo-gear-icon-16">
                                            </span>
                                            Role Mapping
                                        </a>
                                    </li>
                                </ul>
                            </oj-navigation-list>
                        </div>
                        <div id="menubody" style="display: inline-block; width: 84%; max-width: 84%;min-width: 82%; vertical-align: top; padding-left: 0.5%;height: 99%;max-height: 99%;"></div>
                    </c:if>
                </div>
            </div>
        </div>
    </body>
</html>