package amn.analytics.common;

import java.io.IOException;
import java.util.Date;
import java.util.Properties;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author nmorla
 */
public class WebResource extends HttpServlet {

    private Properties objProperties;
    private String fileName = "common/appParameters.properties";

    @Override
    public void init(ServletConfig config) throws ServletException {
        try {
            super.init(config);
            ServletContext servletContext = config.getServletContext();
            objProperties = (Properties) servletContext.getAttribute(Constants.COMMON_PROPERTIES_NAME);
            if (objProperties == null || objProperties.isEmpty()) {
                objProperties = Utility.readProperties(servletContext, fileName);
                servletContext.setAttribute(Constants.COMMON_PROPERTIES_NAME, objProperties);
            }
            String strDBSchema = servletContext.getInitParameter("DEFAULT_DB_SCHEMA");
            strDBSchema = strDBSchema == null ? "" : strDBSchema.trim();
            if (!strDBSchema.isEmpty()) {
                Constants.DB_SCHEMA = strDBSchema;
            }
            String strMaxConsLog = servletContext.getInitParameter("MAX_CONSOLE_LOG_STMT_LENGTH");
            strMaxConsLog = strMaxConsLog == null ? "" : strMaxConsLog.trim();
            if (!strMaxConsLog.isEmpty()) {
                try {
                    int nMaxConsoleLogLen = Integer.parseInt(strMaxConsLog);
                    Constants.MAX_CONSOLE_LOG_STMT_LENGTH = nMaxConsoleLogLen;
                } catch (Exception e) {
                }
            }
            DBConnectionManager.setup(objProperties);
//            try {
//                DBConnectionManager.testDataSource();
//            } catch (Exception e) {
//                System.out.println("Exception while testing connection pool." + e);
//            }
        } catch (Exception ex) {
            throw new ServletException("Couldn't load application properties.", ex);
        }
    }

    @Override
    public void destroy() {
        super.destroy(); //To change body of generated methods, choose Tools | Templates.
        DBConnectionManager.destroy();
    }

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

        String strResponse = "";
        String actionType = request.getParameter("action");
        actionType = actionType == null ? "" : actionType.trim();

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
    private static final String strClassName = WebResource.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            Utility.logConsole("[" + strClassName + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }
}
