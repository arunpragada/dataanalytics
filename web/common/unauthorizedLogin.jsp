<%-- 
    Document   : errorPage
    Created on : Jun 22, 2018, 6:05:10 PM
    Author     : nmorla
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <link rel="icon" type="image/x-icon" href="css/images/favicon.ico">
        <link rel="apple-touch-icon-precomposed" href="../css/images/touchicon.png">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Info</title>
    </head>
    <body style="color: #f9f9f9; text-align: center;">
        <div style="width: 100%; background: #003b4d; height: 6em"></div>
        <div style="color: black; width: 100%;     padding-top: 2%;">
            <h2>Sorry, We are unable to process request</h2>
        </div>
        <div style="width: 100%;     background: #5f5f5f; position: relative; overflow: hidden; padding-top: 2em; padding-bottom: 2em; margin-top: 1%;">
            <h2>${requestScope.ERROR_MESSAGE}</h2>
        </div>
        <div style="color: black; width: 100%;     padding-top: 2%;">
            <h4>Unauthorized login, Please contact system administrator.</h4>
        </div>

    </body>
</html>
