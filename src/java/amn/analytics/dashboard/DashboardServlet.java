package amn.analytics.dashboard;

import amn.analytics.common.Utility;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.json.JSONArray;

/**
 *
 * @author nmorla
 */
public class DashboardServlet extends HttpServlet {

    private Properties objProperties = null;
    private static final String PROPERTIES_NAME = "DASHBOARD_PROPERTIES";
    private static final String fileName = "dashboard/appParameters.properties";

    @Override
    public void init(ServletConfig config) throws ServletException {
        try {
            super.init(config);
            objProperties = (Properties) getServletContext().getAttribute(PROPERTIES_NAME);
            if (objProperties == null || objProperties.isEmpty()) {
                objProperties = Utility.readProperties(getServletContext(), fileName);
                getServletContext().setAttribute(PROPERTIES_NAME, objProperties);
                String strMaxRows = config.getInitParameter("MAX_RECORDS_TO_DISPLAY");
                strMaxRows = strMaxRows == null ? "" : strMaxRows.trim();
                logInfo("<warning><warning> Application-Properties not found in ServletContext. Seems load balancer sent first request to another node where Application-Properties are read and kept in context. Now Application-Properties read and kept in context");
            }
        } catch (Exception ex) {
            throw new ServletException("Couldn't load application properties.", ex);
        }
    }

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        String strOperation = request.getParameter("operation");
        strOperation = strOperation == null ? "" : strOperation.trim();
        HttpSession session = request.getSession();
        DashboardDataAccessOperations objDAO = new DashboardDataAccessOperations();
        try (PrintWriter out = response.getWriter()) {
            if (strOperation.equals("get_dash")) {
                JSONArray objJSArray = objDAO.getActiveDashboards(objProperties);
                String strResponse = "{\"items\":" + objJSArray + "}";
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("get_vizs")) {
                JSONArray objJSArray = objDAO.getCompletedVisualizations(objProperties);
                String strResponse = "{\"items\":" + objJSArray + "}";
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("get_definision")) {
                String strID = request.getParameter("dashboard_id");
                try {
                    JSONArray array = objDAO.getDashboardDefenision(objProperties, Long.parseLong(strID));
                    String strResponse = "{\"Status\":\"Success\", \"items\":" + array + "}";
                    response.getWriter().write(strResponse);
                } catch (Exception ex) {
                    ex.printStackTrace();
                    String strResponse = "{\"Status\":\"Failed\", \"Reason\":" + ex + "}";
                    response.getWriter().write(strResponse);
                }
            } else if (strOperation.equals("get_viz_details")) {
                String strIDs = request.getParameter("viz_ids");
                try {
                    JSONArray array = objDAO.getVisualizationDefenision(objProperties, strIDs);
                    String strResponse = "{\"Status\":\"Success\", \"items\":" + array + "}";
                    response.getWriter().write(strResponse);
                } catch (Exception ex) {
                    ex.printStackTrace();
                    String strResponse = "{\"Status\":\"Failed\", \"Reason\":" + ex + "}";
                    response.getWriter().write(strResponse);
                }
            } else if (strOperation.equals("save_dash")) {
                String strDashboardName = request.getParameter("name");
                long lDashboardId = objDAO.createDashboardMaster(objProperties, strDashboardName);
                if (lDashboardId != -1) {
                    String strVizIDs = request.getParameter("viz_ids");
                    String[] ids = strVizIDs.split(",");
                    long[] lvizIds = new long[ids.length];
                    for (int i = 0; i < ids.length; i++) {
                        String id = ids[i];
                        lvizIds[i] = Long.parseLong(id);
                    }
                    Map<Long, String> objWidhts = new HashMap<Long, String>();
                    String strWidths = request.getParameter("widths");
                    String[] widths = strWidths.split(",");
                    for (int i = 0; i < widths.length; i++) {
                        String id = widths[i];
                        objWidhts.put(Long.parseLong(id.split("=>")[0]), id.split("=>")[1]);
                    }

                    Map<Long, String> objHeights = new HashMap<Long, String>();
                    String strHeights = request.getParameter("heights");
                    String[] heights = strHeights.split(",");
                    for (int i = 0; i < heights.length; i++) {
                        String id = heights[i];
                        objHeights.put(Long.parseLong(id.split("=>")[0]), id.split("=>")[1]);
                    }
                    logInfo("Widths::" + objWidhts + ", Heights:" + objHeights);
                    String strStatus = objDAO.createDashboardDetails(objProperties, lDashboardId, lvizIds, objWidhts, objHeights);
                    String strResponse = "{\"Status\":\"" + strStatus + "\", \"ID\":\"" + lDashboardId + "\"}";
                    response.getWriter().write(strResponse);
                } else {
                    String strResponse = "{\"Status\":\"Failed\", \"Reason\":\"Dashboard Master Setup Failed\"}";
                    response.getWriter().write(strResponse);
                }
            } else if (strOperation.equals("del_dash")) {
                String strDashboardId = request.getParameter("dashboard_id");
                String strJustification = request.getParameter("justification");
                logInfo("Deleting dashboard:" + strDashboardId);
                String strStatus = objDAO.deleteDashboard(objProperties, Long.parseLong(strDashboardId), strJustification);
                String strResponse = "{\"Status\":\"" + strStatus + "\"}";
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("update_dash")) {
                String strDashboardId = request.getParameter("id");
                String strJustification = request.getParameter("justification");
                strJustification = strJustification == null ? "" : strJustification.trim();
                logInfo("Updating dashboard:" + strDashboardId + ", Justification:" + strJustification);
                long lDashboardId = Long.parseLong(strDashboardId);
                if (lDashboardId != -1) {
                    String strStatus = objDAO.deleteDashboardDetails(objProperties, lDashboardId, strJustification);
                    if (strStatus.equalsIgnoreCase("SUCCESS")) {
                        objDAO.updateDashboardMaster(objProperties, lDashboardId, strJustification);
                        String strVizIDs = request.getParameter("viz_ids");
                        String[] ids = strVizIDs.split(",");
                        long[] lvizIds = new long[ids.length];
                        for (int i = 0; i < ids.length; i++) {
                            String id = ids[i];
                            lvizIds[i] = Long.parseLong(id);
                        }
                        Map<Long, String> objWidhts = new HashMap<Long, String>();
                        String strWidths = request.getParameter("widths");
                        String[] widths = strWidths.split(",");
                        for (int i = 0; i < widths.length; i++) {
                            String id = widths[i];
                            objWidhts.put(Long.parseLong(id.split("=>")[0]), id.split("=>")[1]);
                        }
                        Map<Long, String> objHeights = new HashMap<Long, String>();
                        String strHeights = request.getParameter("heights");
                        String[] heights = strHeights.split(",");
                        for (int i = 0; i < heights.length; i++) {
                            String id = heights[i];
                            objHeights.put(Long.parseLong(id.split("=>")[0]), id.split("=>")[1]);
                        }
                        logInfo("Widths::" + objWidhts + ", Heights:" + objHeights);
                        strStatus = objDAO.createDashboardDetails(objProperties, lDashboardId, lvizIds, objWidhts, objHeights);
                        String strResponse = "{\"Status\":\"" + strStatus + "\", \"ID\":\"" + lDashboardId + "\"}";
                        response.getWriter().write(strResponse);
                    } else {
                        String strResponse = "{\"Status\":\"FAILED\", \"message\":\"Failed to delete previous dashboard details\"}";
                        response.getWriter().write(strResponse);
                        logInfo("Failed to delete previous dashboard details");
                    }
                } else {
                    String strResponse = "{\"Status\":\"Failed\", \"Reason\":\"Dashboard Master Setup Failed\"}";
                    response.getWriter().write(strResponse);
                }
            } else if (strOperation.equals("update_viz")) {
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            }
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
        processRequest(request, response);
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
        processRequest(request, response);
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
    private static final String strClassName = DashboardServlet.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            System.out.println("[" + strClassName + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }

}
