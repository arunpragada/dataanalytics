package amn.analytics.superadmin;

import amn.analytics.common.UserBean;
import amn.analytics.common.Constants;
import amn.analytics.common.Utility;
import java.io.IOException;
import java.util.Date;
import java.util.Properties;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author nmorla
 */
public class SuperAdminResource extends HttpServlet {

    private Properties objProperties;
    private String fileName = "common/appParameters.properties";

    @Override
    public void init(ServletConfig config) throws ServletException {
        try {
            super.init(config);
            objProperties = (Properties) config.getServletContext().getAttribute(Constants.COMMON_PROPERTIES_NAME);
            if (objProperties == null || objProperties.isEmpty()) {
                objProperties = Utility.readProperties(config.getServletContext(), fileName);
                config.getServletContext().setAttribute(Constants.COMMON_PROPERTIES_NAME, objProperties);
            }
        } catch (Exception ex) {
            throw new ServletException("Couldn't load application properties.", ex);
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        String strUserSSOLogin = Utility.getUserLoginFromSession(request);
        UserBean objUserBean = (UserBean) request.getSession().getAttribute(Constants.SESSION_USER_DETAILS);
        if (objUserBean == null) {
            logInfo("<warning><warning> [goGet] User details is not found in session. Seems load balancer sent initial request(homepage) to different node where we set all user specific data into session & current request came to this node.");
            if (!strUserSSOLogin.equals(Constants.USER_LOGIN_NOT_FOUND_IN_CONTEXT)) {
                logInfo("<warning><warning> [doGet] Querying DB for user details[" + strUserSSOLogin + "].");
                Utility.setUserDataInSession(request, strUserSSOLogin);
                objUserBean = (UserBean) request.getSession().getAttribute(Constants.SESSION_USER_DETAILS);
            } else {
                logInfo("<warning><warning> [doGet] SSO user login[" + strUserSSOLogin + "] is not valid.");
            }
        }

        if (strUserSSOLogin.isEmpty() || strUserSSOLogin.equals(Constants.USER_LOGIN_NOT_FOUND_IN_CONTEXT) || objUserBean == null) {
            response.getWriter().write("Unauthorized access. SSO login is required.");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().flush();
            return;
        }
        String strResponse = "";
        if (!strResponse.isEmpty()) {
            response.getWriter().write(strResponse);
        }
        response.getWriter().flush();
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
    private static final String strClassName = SuperAdminResource.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            Utility.logConsole("[" + strClassName + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }
}
