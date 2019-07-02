package amn.analytics.visualization;

import amn.analytics.common.Constants;
import amn.analytics.common.DBConnectionManager;
import amn.analytics.common.DataAccessException;
import amn.analytics.common.ProcessingException;
import amn.analytics.common.Utility;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Date;
import java.util.Properties;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author nmorla
 */
public class VisualizationDataAccessOperations {

    public JSONArray getAllVisualizations(Properties objProps) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_VISUALIZATIONS");
            stmt = conn.prepareStatement(query);
            logInfo("query:" + query);
            rs = stmt.executeQuery();
            objArray = Utility.convert(rs);
            logInfo("Dataset JSON ::" + objArray);
        } catch (DataAccessException ex) {
            throw ex;
        } catch (ProcessingException ex) {
            throw ex;
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while retreving active datasets");
            throw new ProcessingException("Exception while retreving active datasets", e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objArray;
    }

    public JSONArray getDatasetMasters(Properties objProps) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_DATASETS_MAS");
            stmt = conn.prepareStatement(query);
            logInfo("query:" + query);
            rs = stmt.executeQuery();
            objArray = Utility.convert(rs);
            logInfo("Dataset JSON ::" + objArray);
        } catch (DataAccessException ex) {
            throw ex;
        } catch (ProcessingException ex) {
            throw ex;
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while retreving active datasets");
            throw new ProcessingException("Exception while retreving active datasets", e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objArray;
    }

    public JSONArray getDatasetSchema(Properties objProps, long lDataSetID) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_SCHEMAS");
            stmt = conn.prepareStatement(query);
            stmt.setLong(1, lDataSetID);
            logInfo("query:" + query);
            rs = stmt.executeQuery();
            objArray = Utility.convert(rs);
            logInfo("Dataset JSON ::" + objArray);
        } catch (DataAccessException ex) {
            throw ex;
        } catch (ProcessingException ex) {
            throw ex;
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while retreving active datasets");
            throw new ProcessingException("Exception while retreving active datasets", e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objArray;
    }

    public int createVisualization(Properties objProps, String visualizationType, String visualizationName, long datasetId, String visualizationQuery, String supportNotes, String guageMin, String guageMax, String guageCircleMax) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        String strStatus = "";
        int nVizId = -1;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("INSERT_VISUALIZATION");
            logInfo("Saving visualization. Query: " + query);
            stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, visualizationType);
            stmt.setString(2, visualizationName);
            stmt.setLong(3, datasetId);
            stmt.setString(4, visualizationQuery);
            stmt.setString(5, Constants.STATUS_SUBMITTED);
            stmt.setString(6, supportNotes);
            stmt.setString(7, guageMin);
            stmt.setString(8, guageMax);
            stmt.setString(9, guageCircleMax);
            int nUpdateCount = stmt.executeUpdate();
            logInfo("No.of visualizations created :: " + nUpdateCount);
            strStatus = "SUCCESS";
            rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                nVizId = rs.getInt(1);
            }
        } catch (Exception e) {
            strStatus = "FAILED";
            logInfo("Exception while saving visualization. Ex:" + e);
            e.printStackTrace();
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return nVizId;
    }

    public boolean validateVisualizationQry(Properties objProps, String visualizationQuery, JSONObject root) throws Exception {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            logInfo("Validation Query::" + visualizationQuery);
            stmt = conn.prepareStatement(visualizationQuery);
            rs = stmt.executeQuery();
            boolean isMultiGrp = Utility.convertToChartJson(rs, root);
            return isMultiGrp;
        } catch (Exception e) {
            logInfo("Exception while validating  visualization. Ex:" + e);
            throw e;
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
    }

    public boolean isVisualizationDelAllowed(Properties objProps, long visualizationId) throws Exception {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String visualizationQuery = objProps.getProperty("IS_VISUALIZATION_DEL");
            logInfo("Is Viz Delete Allowed: Query::" + visualizationQuery);
            stmt = conn.prepareStatement(visualizationQuery);
            stmt.setLong(1, visualizationId);
            rs = stmt.executeQuery();
            return rs.next();
        } catch (Exception e) {
            logInfo("Exception while verifying whether viz can be deleted or not . Ex:" + e);
            throw e;
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
    }

    public String deleteVisualization(Properties objProps, String strJustification, long visualizationId) throws Exception {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String visualizationQuery = objProps.getProperty("DELETE_VISUALIZATION");
            logInfo("Delete Visualization: Query::" + visualizationQuery);
            stmt = conn.prepareStatement(visualizationQuery);
            stmt.setString(1, strJustification);
            stmt.setLong(2, visualizationId);
            int updateCount = stmt.executeUpdate();
            logInfo("No.of visualizations deleted:" + updateCount);
            return "SUCCESS";
        } catch (Exception e) {
            logInfo("Exception while deleting visualization. Ex:" + e);
            throw e;
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
    }

    public String updateVisualization(Properties objProps, long visualizationId, String visualizationQuery, String supportNotes, String guageMin, String guageMax, String guageCircleMax) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        String strStatus = "";
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("UPDATE__VISUALIZATION");
            stmt = conn.prepareStatement(query);
            stmt.setString(1, visualizationQuery);
            stmt.setString(2, supportNotes);
            stmt.setString(3, guageMin);
            stmt.setString(4, guageMax);
            stmt.setString(5, guageCircleMax);
            stmt.setLong(6, visualizationId);
            int nUpdateCount = stmt.executeUpdate();
            logInfo("No.of visualizations updated :: " + nUpdateCount);
            strStatus = "SUCCESS";
        } catch (Exception e) {
            strStatus = "FAILED";
            logInfo("Exception while updating visualization. Ex:" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return strStatus;
    }

    private static final String CLASS_NAME = VisualizationDataAccessOperations.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            Utility.logConsole("[" + CLASS_NAME + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }
}
