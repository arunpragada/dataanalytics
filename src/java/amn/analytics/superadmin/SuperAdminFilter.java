package amn.analytics.superadmin;

import amn.analytics.common.UserBean;
import amn.analytics.common.CommonDAO;
import amn.analytics.common.Constants;
import amn.analytics.common.Utility;
import java.io.IOException;
import java.util.Properties;
import javax.servlet.Filter;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class SuperAdminFilter implements Filter {

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
            System.out.println("Login user email address is not available in request data. Forwarding to error page");
            req.setAttribute("ERROR_MESSAGE", "We are unable to recognize you. Please contact administrator.");
            req.getRequestDispatcher("/common/unauthorizedLogin.jsp").forward(req, res);
        } else {
            UserBean objBean = new CommonDAO().getUserDetails(strUserSSOLogin, objProperties);
            if (!objBean.isAdminUser()) {
                System.out.println("Login user doesn't have access to super admin activity.");
                req.setAttribute("ERROR_MESSAGE", "You don't have access to super admin module. You may need to request specific role through OIM to get access. Please contact administrator.");
                req.getRequestDispatcher("/common/unauthorizedLogin.jsp").forward(req, res);
            } else {
                chain.doFilter(request, response);
            }
        }
    }

}
