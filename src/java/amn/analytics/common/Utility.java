package amn.analytics.common;

import com.opencsv.CSVReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Date;
import java.util.Iterator;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.ServletContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.apache.catalina.tribes.util.Arrays;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author nmorla
 */
public class Utility {

    public static final Pattern VALID_EMAIL_ADDRESS_REGEX = Pattern.compile("^[A-Za-z]+[A-Za-z0-9.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$", Pattern.CASE_INSENSITIVE);

    public static boolean isValideEmailAddress(String strEmailAddress) {
        Matcher matcher = VALID_EMAIL_ADDRESS_REGEX.matcher(strEmailAddress);
        return matcher.find();
    }

    public static String getUserLoginFromSession(HttpServletRequest req) {
        String strUserSSOLogin = (String) req.getSession().getAttribute(Constants.SESSION_USER_LOGIN);
        strUserSSOLogin = strUserSSOLogin == null ? "" : strUserSSOLogin.trim();
        if (strUserSSOLogin.isEmpty()) {
            logInfo("<warning><warning> [doGet] SSO user login is not found in session. Again scanning request data. Seems load balancer sent initial request(homepage) to different node where we set all user specific data into session & current request came to this node.");
            strUserSSOLogin = getUserLoginFromContext(req);
        }
        return strUserSSOLogin;
    }

    public static void setUserDataInSession(HttpServletRequest request, String strUserSSOLogin) {
        HttpSession session = request.getSession();
        logInfo("Session Id:" + session.getId());
        synchronized (session) {
            UserBean objBean = (UserBean) session.getAttribute(Constants.SESSION_USER_DETAILS);
            if (objBean == null) {
                CommonDAO objDataAccess = new CommonDAO();
                Properties objProperties = (Properties) request.getSession().getServletContext().getAttribute(Constants.COMMON_PROPERTIES_NAME);
                objBean = objDataAccess.getUserDetails(strUserSSOLogin, objProperties);
                if (objBean != null) {
                    session.setAttribute(Constants.SESSION_USER_DETAILS, objBean);
                }
            }
        }
    }

    public static String getUserLoginFromContext(HttpServletRequest request) {
        String strResourcePath = request.getRequestURI();
        System.out.println("AdminFilter::Requested Resource Path --- :" + strResourcePath);
        String strUserSSOLogin = Constants.USER_LOGIN_NOT_FOUND_IN_CONTEXT;
        Cookie[] ck = request.getCookies();
        System.out.println("================================ Cookies ================================");
        if (ck != null) {
            outer:
            for (Cookie cook : ck) {
                System.out.println("Name:" + cook.getName() + ", Value:" + cook.getValue() + ", Secure:" + cook.getSecure() + ", Domain:" + cook.getDomain() + ", Path:" + cook.getPath());
                if (cook.getName().equals("ORA_UCM_INFO")) {
                    String value = cook.getValue();
                    if (value != null) {
                        String[] tokens = value.split("~");
                        final String EMAIL_PATTERN = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
                        Pattern pattern = Pattern.compile(EMAIL_PATTERN);
                        for (String token : tokens) {
                            Matcher matcher = pattern.matcher(token);
                            if (matcher.matches()) {
                                System.out.println("***********   Filter - User Email From Cookie:" + token + " *********************");
                                strUserSSOLogin = token;
                                break outer;
                            }
                        }
                    }
                }
            }
        } else {
            System.out.println("No cookies");
        }
        if (strUserSSOLogin.equals(Constants.USER_LOGIN_NOT_FOUND_IN_CONTEXT)) {
            String userLogin = request.getHeader("OAM_REMOTE_USER");
            userLogin = userLogin == null ? "" : userLogin.trim();
            if (!userLogin.isEmpty()) {
                System.out.println("***********   Filter - User Email From Header:" + userLogin + " *********************");
                strUserSSOLogin = userLogin;
            }
        }
        strUserSSOLogin = "Guest";
        request.getSession().setAttribute(Constants.SESSION_USER_LOGIN, strUserSSOLogin);
        return strUserSSOLogin;
    }

//    public static JSONArray convert(ResultSet rs) throws SQLException, JSONException {
//        JSONArray json = new JSONArray();
//        ResultSetMetaData rsmd = rs.getMetaData();
//        while (rs.next()) {
//            int numColumns = rsmd.getColumnCount();
//            JSONObject obj = new JSONObject();
//            //String getNextRecord = "";
//            for (int i = 1; i < numColumns + 1; i++) {
//                String column_name = rsmd.getColumnName(i);
//                obj.put(column_name, rs.getString(column_name));
//            }
//            json.put(obj);
//        }
//        return json;
//    }
    public static JSONObject toJSON(Object object) throws JSONException, IllegalAccessException {
        Class c = object.getClass();
        JSONObject jsonObject = new JSONObject();
        for (Field field : c.getDeclaredFields()) {
            field.setAccessible(true);
            String name = field.getName();
            String value = String.valueOf(field.get(object));
            jsonObject.put(name, value);;
        }
        System.out.println(jsonObject.toString());
        return jsonObject;
    }

    public static JSONArray convert(ResultSet rs) throws SQLException, JSONException {
        JSONArray json = new JSONArray();
        ResultSetMetaData rsmd = rs.getMetaData();
        while (rs.next()) {
            int numColumns = rsmd.getColumnCount();
            JSONObject obj = new JSONObject();
            //String getNextRecord = "";
            for (int i = 1; i < numColumns + 1; i++) {
                String column_name = rsmd.getColumnName(i);
                int nColumnType = rsmd.getColumnType(i);
                if (Types.TIMESTAMP == nColumnType) {
                    obj.put(column_name.toLowerCase(), rs.getTimestamp(column_name));
                } else if (Types.INTEGER == nColumnType) {
                    obj.put(column_name.toLowerCase(), rs.getLong(column_name));
                } else {
                    obj.put(column_name.toLowerCase(), rs.getString(column_name));
                }
            }
            json.put(obj);
        }
        return json;
    }

    public static JSONArray dashboardConvert(ResultSet rs) throws Exception {
        boolean isSingleValued = false;
        JSONArray json = new JSONArray();
        ResultSetMetaData rsmd = rs.getMetaData();
        int numColumns = rsmd.getColumnCount();
        while (rs.next()) {
            JSONObject obj = new JSONObject();
            //String getNextRecord = "";
            for (int i = 1; i < numColumns + 1; i++) {
                String column_name = rsmd.getColumnName(i);
                int nColumnType = rsmd.getColumnType(i);
                if (Types.TIMESTAMP == nColumnType) {
                    obj.put(column_name.toLowerCase(), rs.getTimestamp(column_name));
                } else if (Types.INTEGER == nColumnType) {
                    obj.put(column_name.toLowerCase(), rs.getLong(column_name));
                } else {
                    String strColData = rs.getString(column_name);
                    obj.put(column_name.toLowerCase(), strColData);
                    if (column_name.toLowerCase().equalsIgnoreCase("visualization_type") && (strColData.equalsIgnoreCase("guagechart"))) {
                        isSingleValued = true;
                    }
                    if (column_name.toLowerCase().equalsIgnoreCase("result_path")) {
//                        logInfo("result_path:: processing");
                        if (isSingleValued) {
                            obj.put("singlevalue", getSingleValue(strColData));
                        } else {
                            JSONObject data = new JSONObject();
                            JSONObject series = new JSONObject();
                            JSONArray groups = new JSONArray();
                            boolean isMuilti = convertToChartJson(strColData, data);
//                        logInfo("Root Object is prepared::" + data);
                            mergeChartJson(data, series, groups, isMuilti);
                            obj.put("series", series);
                            obj.put("groups", groups);
                            logInfo("Series & Groups are prepared::" + series + ", " + groups);
                        }
                    } else {
//                        logInfo("Not result_path");
                    }
                }
            }
            json.put(obj);
        }
        return json;
    }

    public static boolean convertToChartJson(ResultSet rs, JSONObject root) throws SQLException, JSONException {
        boolean isMultiGrp = false;
        ResultSetMetaData rsmd = rs.getMetaData();
        int columnCount = rsmd.getColumnCount();
        if (columnCount == 3) {
            isMultiGrp = true;
            while (rs.next()) {
                JSONObject obj = null;
                String grpCol2 = rs.getString(3);
                grpCol2 = grpCol2 == null ? "" : grpCol2.trim();
                if (root.has(grpCol2)) {
                    obj = root.getJSONObject(grpCol2);
                } else {
                    obj = new JSONObject();
                    root.put(grpCol2, obj);
                }
                String grpCol1 = rs.getString(2);
                grpCol1 = grpCol1 == null ? "" : grpCol1.trim();
                JSONArray objAggValues = null;
                if (obj.has(grpCol1)) {
                    objAggValues = obj.getJSONArray(grpCol1);
                } else {
                    objAggValues = new JSONArray();
                    obj.put(grpCol1, objAggValues);
                }
                objAggValues.put(rs.getInt(1));
            }
        } else if (columnCount == 2) {
            while (rs.next()) {
                String grpCol = rs.getString(2);
                grpCol = grpCol == null ? "" : grpCol.trim();
                JSONArray objAggValues = null;
                if (root.has(grpCol)) {
                    objAggValues = root.getJSONArray(grpCol);
                } else {
                    objAggValues = new JSONArray();
                    root.put(grpCol, objAggValues);
                }
                objAggValues.put(rs.getInt(1));
            }
        } else if (columnCount == 1) {
            if (rs.next()) {
                root.put("singlevalue", rs.getInt(1));
            }
        }
        return isMultiGrp;
    }

    public static boolean convertToChartJson(String strFilePath, JSONObject root) throws IOException, JSONException {
        boolean isMultiGrp = false;
        CSVReader reader = null;
        System.out.println("File Path "+strFilePath);
        reader = new CSVReader(new FileReader(strFilePath));
        String[] line;
        if ((line = reader.readNext()) != null) {
            logInfo("Convert CVS File: header line:" + Arrays.toString(line));
            int columnCount = line.length;
            if (columnCount == 3) {
                isMultiGrp = true;
                while ((line = reader.readNext()) != null) {
                    JSONObject obj = null;
                    String grpCol2 = line[2];
                    grpCol2 = grpCol2 == null ? "" : grpCol2.trim();
//                    System.out.print(grpCol2 + " -->");
                    if (grpCol2.startsWith("'")) {
                        grpCol2 = grpCol2.replace("'", "");
                    }
//                    System.out.println(grpCol2);
                    if (root.has(grpCol2)) {
                        obj = root.getJSONObject(grpCol2);
                    } else {
                        obj = new JSONObject();
                        root.put(grpCol2, obj);
                    }
                    String grpCol1 = line[1];
                    grpCol1 = grpCol1 == null ? "" : grpCol1.trim();
//                    System.out.print(grpCol1 + " --> ");
                    if (grpCol1.startsWith("'")) {
                        grpCol1 = grpCol1.replace("'", "");
                    }
//                    System.out.println(grpCol1);
                    grpCol1 = grpCol1 == null ? "" : grpCol1.trim();
                    JSONArray objAggValues = null;
                    if (obj.has(grpCol1)) {
                        objAggValues = obj.getJSONArray(grpCol1);
                    } else {
                        objAggValues = new JSONArray();
                        obj.put(grpCol1, objAggValues);
                    }
                    String aggValue = line[0];
                    try {
                        if (aggValue.startsWith("\"")) {
                            aggValue = aggValue.replace("\"", "");
                        }
                        if (aggValue.startsWith("'")) {
                            aggValue = aggValue.replace("'", "");
                        }
                        objAggValues.put(Long.parseLong(aggValue));
                    } catch (Exception e) {
                        objAggValues.put(aggValue);
                    }
                }
            } else {
                while ((line = reader.readNext()) != null) {
                    String grpCol = line[1];
                    grpCol = grpCol == null ? "" : grpCol.trim();
//                    System.out.print(grpCol + " --> ");
                    if (grpCol.startsWith("'")) {
                        grpCol = grpCol.replace("'", "");
                    }
//                    System.out.println(grpCol);
//                    grpCol = grpCol == null ? "" : grpCol.trim();
                    JSONArray objAggValues = null;
                    if (root.has(grpCol)) {
                        objAggValues = root.getJSONArray(grpCol);
                    } else {
                        objAggValues = new JSONArray();
                        root.put(grpCol, objAggValues);
                    }
                    String aggValue = line[0];
                    try {

                        if (aggValue.startsWith("\"")) {
                            aggValue = aggValue.replace("\"", "");
                        }
                        if (aggValue.startsWith("'")) {
                            aggValue = aggValue.replace("'", "");
                        }
                        objAggValues.put(Long.parseLong(aggValue));
                    } catch (Exception e) {
                        objAggValues.put(aggValue);
                    }
                }
            }
        }
        return isMultiGrp;
    }

    public static long getSingleValue(String strFilePath) throws Exception {
        CSVReader reader = null;
        reader = new CSVReader(new FileReader(strFilePath));
        String[] line;
        if ((line = reader.readNext()) != null) {
            logInfo("Convert CVS File: header line:" + Arrays.toString(line));
            int columnCount = line.length;
            if (columnCount == 3) {
                throw new Exception("Single value is expected in result path. But actual values columns : " + columnCount);
            }
            if ((line = reader.readNext()) != null) {
                String aggValue = line[0];
                try {
                    if (aggValue.startsWith("\"")) {
                        aggValue = aggValue.replace("\"", "");
                    }
                    if (aggValue.startsWith("'")) {
                        aggValue = aggValue.replace("'", "");
                    }
                    return Long.parseLong(aggValue);
                } catch (Exception e) {
                    logInfo("Exception while retrieving single value data from result path. Ex:" + e);
                    return 0;
                }
            }
        } else {
            logInfo("Empty result file:" + strFilePath);
            return 0;
        }
        return 0;
    }

    public static void mergeChartJson(JSONObject source, JSONObject series, JSONArray groups, boolean isMultiGroup) throws Exception {
        logInfo("source::" + source);
        Iterator<String> e = source.keys();
        int totalGroups = source.length();
        if (isMultiGroup) {
            int nProcessingGrp = 0;
            while (e.hasNext()) {
                String key = e.next();
                JSONObject values = source.getJSONObject(key);
                if (key.startsWith("'")) {
                    key = key.replace("'", "");
                }
                groups.put(key);
                Iterator<String> aggKeys = values.keys();
                while (aggKeys.hasNext()) {
                    String aggK = aggKeys.next();
                    JSONArray array = null;
                    if (series.has(aggK)) {
                        array = series.getJSONArray(aggK);
                    } else {
                        array = new JSONArray();
                        fillZeros(array, totalGroups);
                        series.put(aggK, array);
                    }
                    array.put(nProcessingGrp, values.getJSONArray(aggK).get(0));
                }
                ++nProcessingGrp;
            }
        } else {
            while (e.hasNext()) {
                String key = e.next();
                series.put(key, source.getJSONArray(key));
            }
            groups.put("Group1");
        }
        logInfo("Series:" + series + ", Groups:" + groups);
    }

    public static void main(String[] args) throws JSONException {
        JSONArray array = new JSONArray();
        array.put(1, "A2");
        System.out.println(array);
        String str = "'d'";
        if (str.startsWith("'")) {
            str = str.replace("'", "");
        }
        System.out.println(str);
    }

    private static void fillZeros(JSONArray array, int count) {
        for (int i = 0; i < count; i++) {
            array.put(0);
        }
    }

    public static JSONArray convert(ResultSetMetaData rsmd) throws SQLException, JSONException {

        JSONArray json = new JSONArray();
        int numColumns = rsmd.getColumnCount();
        //String getNextRecord = "";
        for (int i = 1; i < numColumns + 1; i++) {
            String column_name = rsmd.getColumnName(i);
            int nColumnType = rsmd.getColumnType(i);
            JSONObject obj = new JSONObject();
            obj.put("column_name", column_name.toLowerCase());
            obj.put("column_type", nColumnType);
            json.put(obj);
        }
        return json;
    }

    public static Properties readProperties(ServletContext sc, String fileName) throws Exception {
        Properties objProperties = new CustomProperties();
        try {
            InputStream input = sc.getResourceAsStream(fileName);
            objProperties.load(input);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return objProperties;
    }

    private static final String strClassName = Utility.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            String strConsoleLog = obj.toString();
            if (strConsoleLog != null && strConsoleLog.length() > Constants.MAX_CONSOLE_LOG_STMT_LENGTH) {
                strConsoleLog = strConsoleLog.substring(0, Constants.MAX_CONSOLE_LOG_STMT_LENGTH);
                strConsoleLog = strConsoleLog + "[...]";
            }
            System.out.println("[" + strClassName + "][1.0]<" + new Date() + "> " + strConsoleLog);
        }
    }

    public static void logConsole(String message) {
        if (message != null && message.length() > Constants.MAX_CONSOLE_LOG_STMT_LENGTH) {
            message = message.substring(0, Constants.MAX_CONSOLE_LOG_STMT_LENGTH);
            message = message + "[...]";
        }
        System.out.println(message);
    }
}
