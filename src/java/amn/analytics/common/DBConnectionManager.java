package amn.analytics.common;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Date;

import java.util.Properties;
import javax.sql.DataSource;
import org.apache.commons.dbcp2.BasicDataSource;

/**
 *
 * @author nmallela
 */
public class DBConnectionManager {

    private static final DBConnectionManager THIS_INSTANCE = new DBConnectionManager();
    private boolean isSetupCompleted = false;

    private DBConnectionManager() {
        super();
    }

    private static final String DRIVER = "Driver";
    private static final String JDBC_URL = "JDBC_URL";
    private static final String PASSWORD = "Password";
    private static final String USERNAME = "UserName";
    private DataSource dataSource;
    private int openConnCount = 0;
    private int closeConnCount = 0;

    public static void setup(Properties prop) {
//        if (prop.getProperty("data_source_to_use").equals("WLS")) {
//            THIS_INSTANCE.loadWSDataSource(prop);
//        } else {
        THIS_INSTANCE.loadDBCPDataSource(prop);
//        }
    }

    public static void destroy() {
        THIS_INSTANCE.isSetupCompleted = false;
        THIS_INSTANCE.openConnCount = 0;
        THIS_INSTANCE.closeConnCount = 0;
        try {
            if (THIS_INSTANCE.dataSource instanceof BasicDataSource) {
                ((BasicDataSource) THIS_INSTANCE.dataSource).close();
            }
        } catch (Exception e) {
        }
        THIS_INSTANCE.dataSource = null;
        logInfo("[DBConnectionManager.destroy] Connection pooling is destroyed.");
    }

    public int getCloseConnCount() {
        return closeConnCount;
    }

    public int getOpenConnCount() {
        return openConnCount;
    }

    private void incrementOpenConnCount() {
        openConnCount++;
    }

    private void incrementCloseConnCount() {
        closeConnCount++;
    }

    public static Connection getDBConnection(Properties prop) {
        logInfo("[DBConnectionManager.getDBConnection] Barrowing DB connection from DS... ");
        long lStartTime = System.nanoTime();
        try {
            if (!THIS_INSTANCE.isSetupCompleted) {
                throw new ProcessingException("Connection pooling is not setup properly. Please contact administrator.", null);
            }
            THIS_INSTANCE.incrementOpenConnCount();
            if (prop != null && prop.containsKey("isTestDB") && prop.getProperty("isTestDB").equalsIgnoreCase("true")) {
                try {
                    logInfo("Creating data base connection &  returning.");
                    Class.forName("com.mysql.jdbc.Driver");
                    return DriverManager.getConnection("jdbc:mysql://localhost:3306/data_analytics", "root", "123456");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            logInfo("Getting data base connection from pool.");
            Connection connection = THIS_INSTANCE.dataSource.getConnection();
            long lEndTime = System.nanoTime();
            logInfo("[DBConnectionManager.getDBConnection] Time taken to get  connection from DS... " + (lEndTime - lStartTime) / 1000000);
            return connection;
        } catch (SQLException exp) {
            exp.printStackTrace();
            throw new DataAccessException(exp.getErrorCode(), "Unable to establish database connectivity. Please contact administrator.", exp);
        }
    }

    public static void testDataSource() {
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        try {
            conn = getDBConnection(null);
            stmt = conn.createStatement();
            rs = stmt.executeQuery("select 1 from dual");
            if (rs.next()) {
                logInfo("[DBConnectionManager.testDataSource] Test Result:" + rs.getString(1));
            }
        } catch (Exception e) {
            throw new DataAccessException(1000, "Exception occured while testing connection pool configuration.", e);
        } finally {
            closeDBResources(conn, stmt, rs);
        }
    }

    public void resetResources() {
        destroy();
    }

    private void loadDBCPDataSource(Properties prop) throws DataAccessException {
        try {
            dataSource = new BasicDataSource();
            String strDBUser = prop.getProperty(USERNAME);
            String strDBPassword = prop.getProperty(PASSWORD);
            String url = prop.getProperty(JDBC_URL);
            String driver = prop.getProperty(DRIVER);
            ((BasicDataSource) dataSource).setDriverClassName(driver);
            ((BasicDataSource) dataSource).setInitialSize(10);
            ((BasicDataSource) dataSource).setMaxWaitMillis(10 * 1000);
            ((BasicDataSource) dataSource).setMaxIdle(4);
            ((BasicDataSource) dataSource).setUrl(url);
            ((BasicDataSource) dataSource).setUsername(strDBUser);
            ((BasicDataSource) dataSource).setPassword(strDBPassword);
            ((BasicDataSource) dataSource).setTestWhileIdle(true);
            ((BasicDataSource) dataSource).setTimeBetweenEvictionRunsMillis(1000 * 600);
            ((BasicDataSource) dataSource).setValidationQuery("select 1 from dual");
            ((BasicDataSource) dataSource).addConnectionProperty("autoReconnect", "true");
            THIS_INSTANCE.isSetupCompleted = true;
            logInfo("[DBConnectionManager.loadDBCPDataSource] Connection pooling is configured.");
        } catch (Exception exp) {
            exp.printStackTrace(System.out);
            logInfo("[DBConnectionManager.loadDBCPDataSource] Exception is occured while creating Commons DataSource object by loading environment,Exception=" + exp);
            throw new DataAccessException(1000, "Unable establish setup datasource. Please contact administrator.", exp);
        }
    }

//    public static Connection getDBConnection(Properties prop) {
//        long lStartTime = System.nanoTime();
//        Connection conn = null;
//        Properties props = new Properties();
//        props.setProperty("user", prop.getProperty(USERNAME));
//        props.setProperty("password", prop.getProperty(PASSWORD));
//        String url = prop.getProperty(JDBC_URL);
//        String driver = prop.getProperty(DRIVER);
//        try {
//            Class.forName(driver);
//            conn = DriverManager.getConnection(url, props);
//            DatabaseMetaData meta = conn.getMetaData();
//            logInfo("JDBC Version::" + meta.getDriverVersion() + ", DB Server Version:" + meta.getDatabaseProductVersion());
//        } catch (SQLException e) {
//            e.printStackTrace();
//            throw new DataAccessException(e.getErrorCode(), "Unable establish database connectivity. Please contact administrator.", e);
//        } catch (ClassNotFoundException e) {
//            e.printStackTrace();
//            throw new ProcessingException("Unable establish database connectivity because of incorrect configuration.", e);
//        }
//        long lEndTime = System.nanoTime();
//        logInfo("Time taken to create connection ... " + (lEndTime - lStartTime) / 1000000);
//        return conn;
//    }
    public static void close(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
                THIS_INSTANCE.incrementCloseConnCount();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public static void close(ResultSet rs) {
        if (rs != null) {
            try {
                rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public static void close(Statement stmt) {
        if (stmt != null) {
            try {
                stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public static void closeDBResources(Connection conn, Statement stmt, ResultSet rs) {
        logInfo("[DBConnectionManager.closeDBResources] Closing DB resources: rs[" + rs + "], stmt[" + stmt + "], conn[" + conn + "]");
        if (rs != null) {
            try {
                rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        if (stmt != null) {
            try {
                stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        if (conn != null) {
            try {
                conn.close();
                THIS_INSTANCE.incrementCloseConnCount();
                logInfo("[DBConnectionManager.closeDBResources] Opened Connections:" + THIS_INSTANCE.getOpenConnCount() + ", Closed Connections:" + THIS_INSTANCE.getCloseConnCount());
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    private static final String strClassName = DBConnectionManager.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            Utility.logConsole("[" + strClassName + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }

}
