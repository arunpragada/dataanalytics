package amn.analytics.visualization;

import amn.analytics.common.Constants;
import amn.analytics.common.Utility;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author nmorla
 */
public class VisualizationServlet extends HttpServlet {

    private Properties objProperties = null;
    private static final String PROPERTIES_NAME = "VISUALIZATION_PROPERTIES";
    private static final String fileName = "visualization/appParameters.properties";

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
        VisualizationDataAccessOperations objDAO = new VisualizationDataAccessOperations();
        try (PrintWriter out = response.getWriter()) {
            if (strOperation.equals("get_vizs")) {
                JSONArray objJSArray = objDAO.getAllVisualizations(objProperties);
                String strResponse = "{\"items\":" + objJSArray + "}";
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("get_masters")) {
                JSONArray objJSArray = (JSONArray) session.getAttribute(Constants.DATASET_TITLES);
                if (objJSArray == null) {
                    objJSArray = objDAO.getDatasetMasters(objProperties);
                    session.setAttribute(Constants.DATASET_TITLES, objJSArray);
                }
                String strResponse = "{\"items\":" + objJSArray + "}";
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("get_schema")) {
                String strDatasetId = request.getParameter("dataset_id");
                JSONArray objJSArray = (JSONArray) session.getAttribute(Constants.DS_SCHEMA + strDatasetId);
                if (objJSArray == null) {
                    objJSArray = objDAO.getDatasetSchema(objProperties, Long.parseLong(strDatasetId));
                    session.setAttribute(Constants.DS_SCHEMA + strDatasetId, objJSArray);
                }
                String strResponse = "{\"items\":" + objJSArray + "}";
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("validate_viz")) {
                String vizQuery = request.getParameter("viz_query");
                logInfo("validation qry:" + vizQuery);
                try {
                    JSONObject root = new JSONObject();
                    boolean isMultiGrp = objDAO.validateVisualizationQry(objProperties, vizQuery, root);
                    JSONObject series = new JSONObject();
                    JSONArray groups = new JSONArray();
                    if (!root.has("singlevalue")) {
                        Utility.mergeChartJson(root, series, groups, isMultiGrp);
                    }
                    String strResponse = "";
                    if (!root.has("singlevalue")) {
                        strResponse = "{\"Status\":\"Success\", \"groups\":" + groups + ", \"series\":" + series + ", \"singlevalue\":\"0\"}";
                    } else {
                        strResponse = "{\"Status\":\"Success\", \"groups\":" + groups + ", \"series\":" + series + ", \"singlevalue\":" + root.getString("singlevalue") + "}";
                    }
                    response.getWriter().write(strResponse);
                } catch (Exception ex) {
                    ex.printStackTrace();
                    String strResponse = "{\"Status\":\"Failed\", \"Reason\":" + ex + "}";
                    response.getWriter().write(strResponse);
                }
            } else if (strOperation.equals("save_viz")) {
                String vizName = request.getParameter("viz_name");
                String vizType = request.getParameter("viz_type");
                String vizQuery = request.getParameter("viz_query");
                String vizSuppNotes = request.getParameter("support_notes");
                String vizDataset = request.getParameter("dataset_id");
                String guageMin = request.getParameter("guage_min");
                guageMin = guageMin == null ? "0" : guageMin.trim();
                String guageMax = request.getParameter("guage_max");
                guageMax = guageMax == null ? "0" : guageMax.trim();
                String guageCircleMax = request.getParameter("guage_circle_max");
                guageCircleMax = guageCircleMax == null ? "0" : guageCircleMax.trim();                                
//                String guageMin = request.getParameter("guage_min");
//                guageMin = guageMin == null ? "" : guageMin.trim();
//                String guageMax = request.getParameter("guage_max");
//                guageMax = guageMax == null ? "" : guageMax.trim();
//                String guageCircleMax = request.getParameter("guage_circle_max");
//                guageCircleMax = guageCircleMax == null ? "" : guageCircleMax.trim();
                int nVizId = objDAO.createVisualization(objProperties, vizType, vizName, Long.parseLong(vizDataset), vizQuery, vizSuppNotes, guageMin, guageMax, guageCircleMax);
                String strResponse;
                if (nVizId > 0) {
                    strResponse = "{\"Status\":\"Success\", \"id\":\"" + nVizId + "\"}";
                } else {
                    strResponse = "{\"Status\":\"Failed\"}";
                }
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("update_viz")) {
                String vizQuery = request.getParameter("viz_query");
                String vizSuppNotes = request.getParameter("support_notes");
                String vizId = request.getParameter("viz_id");
                String guageMin = request.getParameter("guage_min");
                guageMin = guageMin == null ? "" : guageMin.trim();
                String guageMax = request.getParameter("guage_max");
                guageMax = guageMax == null ? "" : guageMax.trim();
                String guageCircleMax = request.getParameter("guage_circle_max");
                guageCircleMax = guageCircleMax == null ? "" : guageCircleMax.trim();

                String strStatus = objDAO.updateVisualization(objProperties, Long.parseLong(vizId), vizQuery, vizSuppNotes, guageMin, guageMax, guageCircleMax);
                String strResponse = "{\"Status\":\"" + strStatus + "\"}";
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("vefiry_viz_del")) {
                String vizId = request.getParameter("viz_id");
                boolean isAllowed = false;
                String strResponse;
                try {
                    isAllowed = objDAO.isVisualizationDelAllowed(objProperties, Long.parseLong(vizId));
                    strResponse = "{\"Status\":\"SUCCESS\",\"Allowed\":" + isAllowed + "}";
                } catch (Exception ex) {
                    Logger.getLogger(VisualizationServlet.class.getName()).log(Level.SEVERE, null, ex);
                    strResponse = "{\"Status\":\"FAILED\",\"Allowed\":" + isAllowed + ",\"message\":\"Unexpected error:" + ex.getMessage() + "\"}";
                }
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("delete_viz")) {
                String vizSuppNotes = request.getParameter("support_notes");
                String vizId = request.getParameter("viz_id");
                String strStatus;
                String strMessage = "";
                try {
                    strStatus = objDAO.deleteVisualization(objProperties, vizSuppNotes, Long.parseLong(vizId));
                } catch (Exception ex) {
                    strStatus = "FAILED";
                    strMessage = "Unable to delete visualization. " + ex.getMessage();
                }
                String strResponse = "{\"Status\":\"" + strStatus + "\",\"message\":\"" + strMessage + "\"}";
                response.getWriter().write(strResponse);
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
    private static final String strClassName = VisualizationServlet.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            System.out.println("[" + strClassName + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }

}
