<%-- 
    Document   : menuItemPage
    Created on : Jul 6, 2018, 6:02:59 PM
    Author     : nmorla
--%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<ul>
    <c:forEach items="${requestScope.MenuItems}" var="menuItem">
        <li id="menuId${menuItem.id}" data-view="${menuItem.view}" data-model="${menuItem.model}" data-style="${menuItem.style}" data-menutype="${menuItem.menuType}">
            <a href="#" ><span class="${menuItem.icon}" style="margin-right: 2%; margin-left: ${menuItem.menuDepth eq null ? 0 : menuItem.menuDepth*2}%"></span>${menuItem.displayName}</a>
                <c:if test="${menuItem.containsChild}">
                    <c:set var="MenuItems" value="${menuItem.childs}" scope="request"/>
                    <jsp:include page="menuItemPage.jsp"></jsp:include>
                </c:if>
        </li>
    </c:forEach>
</ul>