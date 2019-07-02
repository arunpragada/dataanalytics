package amn.analytics.input;

import amn.analytics.common.Utility;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Properties;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;

/**
 *
 * @author nmorla
 */
public class DatasetOperationsServlet extends HttpServlet {

    private Properties objProperties = null;
    private static final String PROPERTIES_NAME = "DATASET_PROPERTIES";
    private static final String fileName = "input/appParameters.properties";

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
        DatasetDataAccessOperations objDAO = new DatasetDataAccessOperations();
        try (PrintWriter out = response.getWriter()) {
            if (strOperation.equals("get_datasets")) {
                JSONArray objJSArray = objDAO.getAllDatasetsDetails(objProperties);
                String strResponse = "{\"items\":" + objJSArray + "}";
                response.getWriter().write(strResponse);
            } else if (strOperation.equals("getdatasetdetails")) {
                String strDSID = request.getParameter("dataset_id");
                String status = "";
                try {
                    long lDatasetId = Long.parseLong(strDSID);
                    JSONArray objJSArray = objDAO.getDatasetDetails(objProperties, lDatasetId);
                    String strResponse = "{\"items\":" + objJSArray + "}";
                    response.getWriter().write(strResponse);
                } catch (Exception e) {
                    status = "FAILED";
                }
            } else if (strOperation.equals("getsampledata")) {
                String strDSID = request.getParameter("dataset_id");
                String status = "";
                try {
                    long lDatasetId = Long.parseLong(strDSID);
                    JSONArray objSchemaArray = new JSONArray();
                    JSONArray objJSArray = objDAO.getDatasetSamples(objProperties, lDatasetId, objSchemaArray);
                    String strResponse = "{\"items\":" + objJSArray + ", \"schema\":" + objSchemaArray + "}";
                    response.getWriter().write(strResponse);
                } catch (Exception e) {
                    status = "FAILED";
                }
            } else if (strOperation.equals("delete_datasets")) {
                String status = "";
                try {
                    List<Long> lDatasetIds = getDatasetIds(request.getParameter("datasets"));
                    String strJustification = request.getParameter("justification");
                    status = objDAO.deleteDataset(objProperties, lDatasetIds, strJustification);
                } catch (Exception e) {
                    e.printStackTrace();
                    logInfo("Exception while deleting dataset. Ex:" + e);
                    status = "FAILED";
                }
                String strResponse = "";
                if (status.equalsIgnoreCase("SUCCESS")) {
                    strResponse = "{\"Status\":\"SUCCESS\"}";
                } else {
                    strResponse = "{\"Status\":\"FAILED\"}";
                }
                response.getWriter().write(strResponse);
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            }
        }
    }

    private List<Long> getDatasetIds(String datasetIds) {
        datasetIds = datasetIds == null ? "" : datasetIds.trim();
        List<Long> lDatasetIds = new ArrayList<>();
        String[] tokens = datasetIds.split(",");
        for (int i = 0; i < tokens.length; i++) {
            String token = tokens[i];
            lDatasetIds.add(Long.parseLong(token));
        }
        return lDatasetIds;
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
    private static final String strClassName = DatasetOperationsServlet.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            System.out.println("[" + strClassName + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }

}
