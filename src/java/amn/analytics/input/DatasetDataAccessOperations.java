package amn.analytics.input;

import amn.analytics.common.DBConnectionManager;
import amn.analytics.common.DataAccessException;
import amn.analytics.common.ProcessingException;
import amn.analytics.common.Utility;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author nmorla
 */
public class DatasetDataAccessOperations {

    public JSONArray getAllDatasetsDetails(Properties objProps) {
        DatasetBean objBean = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_ACTIVE_DATA_SETS");
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

    public JSONArray getDatasetDetails(Properties objProps, long lDatasetId) {
        DatasetBean objBean = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_DATASET_DETAILS");
            stmt = conn.prepareStatement(query);
            stmt.setLong(1, lDatasetId);
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
            logInfo("Exception while retriving schema details for dataset:" + lDatasetId);
            throw new ProcessingException("Exception while retriving schema details for dataset:" + lDatasetId, e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objArray;
    }

    public JSONArray getDatasetSamples(Properties objProps, long lDatasetId, JSONArray schema) {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        JSONArray objArray;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("GET_DATASET_SAMPLEDATA");
            query = query.replace("$table", "ds_" + lDatasetId);
            logInfo("query:" + query);
            stmt = conn.prepareStatement(query);
            rs = stmt.executeQuery();
            objArray = Utility.convert(rs);
            schema.put(Utility.convert(rs.getMetaData()));
            logInfo("Dataset JSON ::" + objArray);
        } catch (DataAccessException ex) {
            throw ex;
        } catch (ProcessingException ex) {
            throw ex;
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while retriving schema details for dataset:" + lDatasetId);
            throw new ProcessingException("Exception while retriving schema details for dataset:" + lDatasetId, e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objArray;
    }

    public String deleteDataset(Properties objProps, List<Long> lDatasetIds, String strJustification) {
        String strStatus = "";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            //TO Do: DAO logic to delete a dataset which are identified by given dataset_master_id's. Please do update expiration_date and updated_by columns. Append supportnotes column with new justification. Don't delete record from table.
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("DELETE_DATA_SETS");
            String strDatasetIds = convertToString(lDatasetIds, false);
            query = query.replace(":DATA_SETS", strDatasetIds);
            logInfo("query:" + query);
            stmt = conn.prepareStatement(query);
            stmt.setString(1, strJustification);
            int updateCount = stmt.executeUpdate();
            logInfo("No.of deleted datasets..." + updateCount);
            strStatus = "SUCCESS";
        } catch (Exception e) {
            strStatus = "FAILED";
            e.printStackTrace();
            logInfo("Exception while deleting dataset. Ex:" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, null);
        }
        return strStatus;
    }

    private String convertToString(Collection col, boolean enclose) {
        StringBuilder builder = new StringBuilder();
        for (Iterator iterator = col.iterator(); iterator.hasNext();) {
            Object next = iterator.next();
            if (builder.length() > 0) {
                builder.append(",");
            }
            if (enclose) {
                builder.append("'").append(next).append("'");
            } else {
                builder.append(next);
            }
        }
        return builder.toString();
    }

    public int uploadDataset(DatasetBean bean, Properties objProps) {
        String strStatus = "";
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        int id = -1;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("INSERT_DATA_SET");
            pstmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            pstmt.setString(1, bean.getDatasetFileName());
            pstmt.setString(2, bean.getDatasetPath());
            pstmt.setString(3, bean.getControlFileName());
            pstmt.setString(4, bean.getControlFilePath());
            pstmt.setString(5, amn.analytics.common.Constants.STATUS_SUBMITTED);
            pstmt.setString(6, bean.getSupportnotes());
            pstmt.setString(7, bean.getTitle());
            logInfo("query:" + query);
            pstmt.executeUpdate();
            rs = pstmt.getGeneratedKeys();
            if (rs.next()) {
                id = rs.getInt(1);
            }
            //TO Do: DAO logic to insert a dataset in dataset_master. Pass prepared statement args so 
            strStatus = "SUCCESS";
        } catch (Exception e) {
            strStatus = "FAILED";
            e.printStackTrace();
            logInfo("Exception while creating dataset. Ex:" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, pstmt, rs);
        }
        return id;
    }

    public int uploadDatasetSchema(List<DatasetSchemaBean> dsList, Properties objProps) {
        String strStatus = "";
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        int id = -1;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("INSERT_DATA_SET_SCHEMA");
            pstmt = conn.prepareStatement(query);
            for (DatasetSchemaBean bean : dsList) {
                pstmt.setInt(1, bean.getDatasetId());
                pstmt.setInt(2, bean.getColOrder());
                pstmt.setString(3, bean.getColName());
                pstmt.setString(4, bean.getColDataType());
                pstmt.setString(5, bean.getColDefaultVal());
                pstmt.setString(6, bean.getColMandatory());
                logInfo("query:" + query);
                pstmt.executeUpdate();
            }
            // rs = pstmt.getGeneratedKeys();

            //TO Do: DAO logic to insert a dataset in dataset_master. Pass prepared statement args so 
            strStatus = "SUCCESS";
        } catch (Exception e) {
            strStatus = "FAILED";
            e.printStackTrace();
            logInfo("Exception while creating dataset. Ex:" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, pstmt, rs);
        }
        return id;
    }

    public int deleteUploadDataset(int id, Properties objProps) {

        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("DELETE_DATA_SET");
            pstmt = conn.prepareStatement("delete from datasets_master where datasets_master_id = ?");
            pstmt.setInt(1, id);
            logInfo("query:" + query);
            pstmt.executeUpdate();

        } catch (Exception e) {

            e.printStackTrace();
            logInfo("Exception while creating dataset. Ex:" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, pstmt, rs);
        }
        return id;
    }

//    public void insertDatasetSampleRecords(List<DatasetSchemaBean> dsList, List<String> dataList, int insId, Properties objProps) {
//
//        StringBuilder sb = new StringBuilder();
//        String strTableName = "data_analytics.ds_" + insId;
//        sb.append("create table data_analytics.ds_" + insId + "(");
//        //create the table
//        String[] dataTypeArr = new String[dsList.size()];
//        int c = 0;
//        for (DatasetSchemaBean bean : dsList) {
//            dataTypeArr[c++] = bean.getColDataType();
//            if (bean.getColDataType().equalsIgnoreCase("string")) {
//                bean.setColDataType("varchar(100)");
//            }
//            sb.append(bean.getColName() + " " + bean.getColDataType() + ",");
//        }
//        System.out.println("Data type Arr " + dataTypeArr);
//        sb.setLength(sb.length() - 1);
//        sb.append(")");
//        Connection conn = null;
//        PreparedStatement pstmt = null;
//        ResultSet rs = null;
//        try {
//            conn = DBConnectionManager.getDBConnection(objProps);
//            String query = sb.toString();
//            pstmt = conn.prepareStatement(query);
//            logInfo("query:" + query);
//            pstmt.executeUpdate();
//            String params = getQueryParams(dsList.size());
//            query = "insert into " + strTableName + " values(" + params + ")";
//            System.out.println("Query befor " + query);
//            pstmt = conn.prepareStatement(query);
//            for (String data : dataList) {
//                System.out.println("Data Line is " + data);
//                String dataArr[] = data.split("\\,", -1);
//                System.out.println("Len is " + dataArr.length);
//                for (int i = 1; i <= dataArr.length; i++) {
//                    //System.out.println("DT "+dataTypeArr[i]);
//                    if (dataTypeArr[i - 1].equalsIgnoreCase("string")) {
//                        pstmt.setString(i, dataArr[i - 1]);
//                    } else if (dataTypeArr[i - 1].equalsIgnoreCase("int")) {
//                        pstmt.setInt(i, Integer.parseInt(dataArr[i - 1]));
//                    }
//                }
//                logInfo("query:" + query);
//                pstmt.executeUpdate();
//            }
//
//        } catch (Exception e) {
//
//            e.printStackTrace();
//            logInfo("Exception while creating dataset. Ex:" + e);
//        } finally {
//            DBConnectionManager.closeDBResources(conn, pstmt, rs);
//        }
//
//    }
    public void insertDatasetSampleRecords(List<DatasetSchemaBean> dsList, List<String> dataList, int insId, Properties objProps) {

        StringBuilder sb = new StringBuilder();
        String strTableName = "data_analytics.ds_" + insId;
        sb.append("create table data_analytics.ds_" + insId + "(idamn INT(11) NOT NULL AUTO_INCREMENT,");
        //create the table
        String[] dataTypeArr = new String[dsList.size()];
        int c = 0;
        StringBuilder sbCols = new StringBuilder();
        for (DatasetSchemaBean bean : dsList) {
            dataTypeArr[c++] = bean.getColDataType();
            sbCols.append(bean.getColName() + ",");
            if (bean.getColDataType().equalsIgnoreCase("string")) {
                bean.setColDataType("varchar(100)");
            }
            sb.append(bean.getColName() + " " + bean.getColDataType() + ",");
        }
        System.out.println("Data type Arr " + dataTypeArr);
        sbCols.setLength(sbCols.length() - 1);
        sb.append(" PRIMARY KEY (idamn))");
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = sb.toString();
            pstmt = conn.prepareStatement(query);
            logInfo("query:" + query);
            pstmt.executeUpdate();
            String params = getQueryParams(dsList.size());
            query = "insert into " + strTableName + "(" + sbCols.toString() + ") values(" + params + ")";
            System.out.println("Query befor " + query);
            pstmt = conn.prepareStatement(query);
            for (String data : dataList) {
                System.out.println("Data Line is " + data);
                String dataArr[] = data.split("\\,", -1);
                System.out.println("Len is " + dataArr.length);
                for (int i = 1; i <= dataArr.length; i++) {
                    //System.out.println("DT "+dataTypeArr[i]);
                    if (dataTypeArr[i - 1].equalsIgnoreCase("string")) {
                        pstmt.setString(i, dataArr[i - 1]);
                    } else if (dataTypeArr[i - 1].equalsIgnoreCase("int")) {
                        pstmt.setInt(i, Integer.parseInt(dataArr[i - 1]));
                    }else if (dataTypeArr[i - 1].equalsIgnoreCase("double")){
                        pstmt.setDouble(i, Double.parseDouble(dataArr[i - 1]));
                    }else if (dataTypeArr[i - 1].equalsIgnoreCase("timestamp")){
                        SimpleDateFormat df=new SimpleDateFormat("yyyy/MM/dd hh:mm:ss");
                        Date strToDate = df.parse(dataArr[i - 1]);
                        pstmt.setTimestamp(i, new java.sql.Timestamp(strToDate.getTime()));
                    }
                }
                logInfo("query:" + query);
                pstmt.executeUpdate();
            }

        } catch (Exception e) {

            e.printStackTrace();
            logInfo("Exception while creating dataset. Ex:" + e);
        } finally {
            DBConnectionManager.closeDBResources(conn, pstmt, rs);
        }

    }

    private String getQueryParams(int n) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= n; i++) {
            sb.append("?,");
        }
        sb.setLength(sb.length() - 1);
        return sb.toString();
    }

    public JSONObject convert(DatasetBean bean) throws SQLException, JSONException {
        JSONObject obj = new JSONObject();
        obj.put("datasets_master_id", bean.getId());
        obj.put("dataset_file_name", bean.getDatasetFileName());
        obj.put("dataset_path", bean.getDatasetPath());
        obj.put("hdfs_path", bean.getHdfsPath());
        obj.put("dataset_status", bean.getStatus());
        obj.put("support_notes", bean.getSupportnotes());
        obj.put("control_file_name", bean.getControlFileName());
        obj.put("control_file_path", bean.getControlFilePath());
        return obj;
    }

    private static final String CLASS_NAME = DatasetDataAccessOperations.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            Utility.logConsole("[" + CLASS_NAME + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }
}
