package amn.analytics.dashboard;

import amn.analytics.common.Constants;
import amn.analytics.common.DBConnectionManager;
import amn.analytics.common.DataAccessException;
import amn.analytics.common.ProcessingException;
import amn.analytics.common.Utility;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;
import java.util.Properties;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author nmorla
 */
public class DashboardDataAccessOperations {

    public JSONArray getCompletedVisualizations(Properties objProps) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_COMPLETED_VISUALIZATIONS");
            stmt = conn.prepareStatement(query);
            logInfo("query:" + query);
            stmt.setString(1, Constants.STATUS_COMPLETED);
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

    public JSONArray getActiveDashboards(Properties objProps) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_ACTIVE_DASHBOARDS");
            stmt = conn.prepareStatement(query);
            logInfo("query:" + query);
            rs = stmt.executeQuery();
            objArray = Utility.convert(rs);
            logInfo("Dashboards JSON ::" + objArray);
        } catch (DataAccessException ex) {
            throw ex;
        } catch (ProcessingException ex) {
            throw ex;
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while retreving active dashboards: " + e);
            throw new ProcessingException("Exception while retreving active dashboards", e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objArray;
    }

    public JSONArray getDashboardDefenision(Properties objProps, long lDashboardID) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_DASHBOARD_DEF");
            stmt = conn.prepareStatement(query);
            stmt.setString(1, Constants.STATUS_COMPLETED);
            stmt.setLong(2, lDashboardID);
            logInfo("query:" + query);
            rs = stmt.executeQuery();
            objArray = Utility.dashboardConvert(rs);
            logInfo("Dashboard Def JSON ::" + objArray);
        } catch (DataAccessException ex) {
            throw ex;
        } catch (ProcessingException ex) {
            throw ex;
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while retreving dashboard def");
            throw new ProcessingException("Exception while retreving dashboard def", e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objArray;
    }

    public JSONArray getVisualizationDefenision(Properties objProps, String strVizIds) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_SELECTED_VIZ");
            query = query.replace(":viz_ids", strVizIds);
            stmt = conn.prepareStatement(query);
            stmt.setString(1, Constants.STATUS_COMPLETED);
            logInfo("query:" + query);
            rs = stmt.executeQuery();
            objArray = Utility.dashboardConvert(rs);
            logInfo("Viz Def JSON ::" + objArray);
        } catch (DataAccessException ex) {
            throw ex;
        } catch (ProcessingException ex) {
            throw ex;
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while retreving visualization def");
            throw new ProcessingException("Exception while retreving visualization def", e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objArray;
    }

    public int createDashboardMaster(Properties objProps, String dashboardName) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        int nVizId = -1;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("SAVE_DASHBOARD_MST");
            stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, dashboardName);
            int nUpdateCount = stmt.executeUpdate();
            logInfo("No.of dashboard masters created :: " + nUpdateCount);
            rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                nVizId = rs.getInt(1);
            }
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while saving dashboard master. Ex" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return nVizId;
    }

    public String createDashboardDetails(Properties objProps, long lDashboardId, long[] visualizationIds, Map<Long, String> widths, Map<Long, String> heights) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        String strStatus = "";
        int nVizId = -1;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("SAVE_DASHBOARD_DET");
            stmt = conn.prepareStatement(query);
            for (int i = 0; i < visualizationIds.length; i++) {
                long visualizationId = visualizationIds[i];
                stmt.setLong(1, lDashboardId);
                stmt.setLong(2, visualizationId);
                stmt.setString(3, widths.get(visualizationId));
                stmt.setString(4, heights.get(visualizationId));
                stmt.addBatch();
            }
            int[] nUpdateCount = stmt.executeBatch();
            logInfo("No.of dashboard details created :: " + Arrays.toString(nUpdateCount));
            strStatus = "SUCCESS";

        } catch (Exception e) {
            e.printStackTrace();
            strStatus = "FAILED";
            logInfo("Exception while saving dashboard master. Ex" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return strStatus;
    }

    public String deleteDashboard(Properties objProps, long lDashboardId, String strJustification) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        String strStatus = "";
        int nVizId = -1;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("DEL_DASHBOARD");
            stmt = conn.prepareStatement(query);
            stmt.setString(1, strJustification);
            stmt.setLong(2, lDashboardId);
            int nUpdateCount = stmt.executeUpdate();
            logInfo("No.of dashboards deleted :: " + nUpdateCount);
            strStatus = "SUCCESS";

        } catch (Exception e) {
            e.printStackTrace();
            strStatus = "FAILED";
            logInfo("Exception while deleting dashboard. Ex" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return strStatus;
    }

    public String updateDashboardMaster(Properties objProps, long lDashboardId, String strJustification) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        String strStatus = "";
        int nVizId = -1;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("UPDATE_DASHBOARD");
            stmt = conn.prepareStatement(query);
            stmt.setString(1, strJustification);
            stmt.setLong(2, lDashboardId);
            int nUpdateCount = stmt.executeUpdate();
            logInfo("No.of dashboards updated:: " + nUpdateCount);
            strStatus = "SUCCESS";

        } catch (Exception e) {
            e.printStackTrace();
            strStatus = "FAILED";
            logInfo("Exception while updating dashboard. Ex" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return strStatus;
    }

    public String deleteDashboardDetails(Properties objProps, long lDashboardId, String strJustification) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        String strStatus = "";
        int nVizId = -1;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("DEL_DASHBOARD_DET");
            stmt = conn.prepareStatement(query);
            stmt.setString(1, strJustification);
            stmt.setLong(2, lDashboardId);
            int nUpdateCount = stmt.executeUpdate();
            logInfo("No.of dashboard details deleted :: " + nUpdateCount);
            strStatus = "SUCCESS";

        } catch (Exception e) {
            e.printStackTrace();
            strStatus = "FAILED";
            logInfo("Exception while deleting dashboard details. Ex" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return strStatus;
    }

//
//    private boolean validateVisualizationQry(Properties objProps, String visualizationQuery, JSONObject root) throws Exception {
//        PreparedStatement stmt = null;
//        ResultSet rs = null;
//        Connection conn = null;
//        try {
//            conn = DBConnectionManager.getDBConnection(objProps);
//            stmt = conn.prepareStatement(visualizationQuery);
//            logInfo("Query::" + visualizationQuery);
//            rs = stmt.executeQuery();
//            boolean isMultiGrp = Utility.convertToChartJson(rs, root);
//            return isMultiGrp;
//        } catch (Exception e) {
//            logInfo("Exception while validating  visualization. Ex" + e);
//            throw e;
//        } finally {
//            DBConnectionManager.closeDBResources(conn, stmt, rs);
//        }
//    }
//
//    private String updateVisualization(Properties objProps, long visualizationId, String visualizationQuery, String supportNotes) {
//        PreparedStatement stmt = null;
//        ResultSet rs = null;
//        Connection conn = null;
//        String strStatus = "";
//        try {
//            conn = DBConnectionManager.getDBConnection(objProps);
//            String query = objProps.getProperty("UPDATE__VISUALIZATION");
//            stmt = conn.prepareStatement(query);
//            stmt.setString(1, visualizationQuery);
//            stmt.setString(2, supportNotes);
//            stmt.setLong(3, visualizationId);
//            int nUpdateCount = stmt.executeUpdate();
//            logInfo("No.of visualizations updated :: " + nUpdateCount);
//            strStatus = "SUCCESS";
//        } catch (Exception e) {
//            strStatus = "FAILED";
//            logInfo("Exception while updating visualization. Ex" + e);
//        } finally {
//            DBConnectionManager.closeDBResources(conn, stmt, rs);
//        }
//        return strStatus;
//    }
    private static final String CLASS_NAME = DashboardDataAccessOperations.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            Utility.logConsole("[" + CLASS_NAME + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }
}
