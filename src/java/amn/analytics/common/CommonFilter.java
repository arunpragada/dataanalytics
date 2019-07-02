package amn.analytics.common;

import java.io.IOException;
import java.util.List;
import java.util.Properties;
import javax.servlet.Filter;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CommonFilter implements Filter {

    private FilterConfig _filterConfig = null;
    private Properties objProperties;
    private String fileName = "common/appParameters.properties";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        _filterConfig = filterConfig;
        try {
            objProperties = (Properties) filterConfig.getServletContext().getAttribute(Constants.COMMON_PROPERTIES_NAME);
            if (objProperties == null || objProperties.isEmpty()) {
                objProperties = Utility.readProperties(filterConfig.getServletContext(), fileName);
                filterConfig.getServletContext().setAttribute(Constants.COMMON_PROPERTIES_NAME, objProperties);
            }
        } catch (Exception ex) {
            throw new ServletException("Couldn't load application properties.", ex);
        }
    }

    @Override
    public void destroy() {
        _filterConfig = null;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        String strUserSSOLogin = Utility.getUserLoginFromContext(request);
        if (strUserSSOLogin.equals(Constants.USER_LOGIN_NOT_FOUND_IN_CONTEXT)) {
//            response.getWriter().write("Un-authorized access. SSO login is required.");
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            response.getWriter().flush();
            System.out.println("Login user email address is not available in request data. Forwarding to error page");
            req.setAttribute("ERROR_MESSAGE", "We are unable to recognize you. Please contact administrator.");
            req.getRequestDispatcher("/common/unauthorizedLogin.jsp").forward(req, res);
        } else {
            try {
//                List<MenuItem> menus = new CommonDAO().getAccessibleMenus(strUserSSOLogin, objProperties);
//                if (menus.isEmpty()) {
//                    System.out.println("Login user doesn't have access to menus");
//                    req.setAttribute("ERROR_MESSAGE", "You don't have access to any module. You may need to request specific role through OIM to get access to desired menu. Please contact administrator.");
//                    req.getRequestDispatcher("/common/unauthorizedLogin.jsp").forward(req, res);
//                } else {
//                    req.setAttribute(Constants.MENU_ITEMS, menus);
//                    request.getSession().setAttribute(Constants.MENU_ITEMS, menus);
//                    chain.doFilter(request, response);
//                }
                    chain.doFilter(request, response);
            } catch (Exception e) {
                req.setAttribute("ERROR_MESSAGE", e.getMessage());
                req.getRequestDispatcher("/common/errorPage.jsp").forward(req, res);
            }
        }
    }

}
