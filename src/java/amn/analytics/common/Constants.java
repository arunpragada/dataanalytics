package amn.analytics.common;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author nmorla
 */
public class Constants {

    public static final String CORPOIM_TEAM_ROLE = "Corp OIM Support Team";
    public static final String USER_LOGIN_NOT_FOUND_IN_CONTEXT = "USER_LOGIN_NOT_FOUND_IN_CONTEXT";
    public static final String SESSION_USER_DETAILS = "user_details";
    public static final String SESSION_USER_LOGIN = "sso_userlogin";
    public static final String MENU_TYPE_PARENT = "PARENT";
    public static final String MENU_TYPE_LEAF = "LEAF";
    public static final List<String> ALLOWED_MENU_TYPES = new ArrayList<String>();
    public static final String MENU_ITEMS = "MenuItems";
    public static final int MAX_USERS_TO_DISPLAY = 100;
    public static final String COMMON_PROPERTIES_NAME = "COMMON_PROPERTIES";
    public static String DB_SCHEMA = "data_analytics";
    public static int MAX_CONSOLE_LOG_STMT_LENGTH = 1000;
    public static final int DB_INCLAUSE_MAX_SIZE = 1000;
    public static final String SESSION_MENU_ROLE_MAPPINGS = "SESSION_MENU_ROLE_MAPPINGS";
    public static final String DATASET_TITLES = "DATASET_TITLES";
    public static final String DS_SCHEMA = "DS_SCHEMA";

    static {
        ALLOWED_MENU_TYPES.add(MENU_TYPE_LEAF);
        ALLOWED_MENU_TYPES.add(MENU_TYPE_PARENT);
    }
    public static final String STATUS_SUBMITTED = "SUBMITTED";
    public static final String STATUS_COMPLETED = "COMPLETED";
}
