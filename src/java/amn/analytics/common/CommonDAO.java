package amn.analytics.common;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author nmorla
 */
public class CommonDAO {

    public UserBean getUserDetails(String strUserLogin, Properties objProps) {
        UserBean objBean = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        strUserLogin = strUserLogin.toUpperCase();
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("Q_verifyOIMAdminUser");
            stmt = conn.prepareStatement(query);
            logInfo("query:" + query);
            stmt.setString(1, strUserLogin);
            rs = stmt.executeQuery();
            if (rs.next()) {
                String strUserKey = rs.getString("usr_key");
                String strAdminUser = rs.getString("admin_user");
                strAdminUser = strAdminUser == null ? "" : strAdminUser.trim();
                objBean = new UserBean();
                objBean.setUserKey(strUserKey);
                objBean.setUserLogin(strUserLogin);
                objBean.setAdminUser(strAdminUser.equals("true"));
                logInfo("User Details: " + objBean);
            }
        } catch (DataAccessException ex) {
            throw ex;
        } catch (ProcessingException ex) {
            throw ex;
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception in verifying if logged user is OIM Support Team Memebr");
            throw new ProcessingException("Unknown eror while verifying if logged user is OIM Support Team Memebr", e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objBean;
    }

    public JSONArray getMenuRoleMappings(Properties objProps) {
        JSONArray objResponse = new JSONArray();
        long lStartTime = System.nanoTime();
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("Q_get_menu_role_mappings");
            stmt = conn.prepareStatement(query);
            logInfo("query:" + query);
            rs = stmt.executeQuery();
            while (rs.next()) {
                String strMenuLabel = rs.getString("menu_label");
                strMenuLabel = strMenuLabel == null ? "" : strMenuLabel.trim();
                String strParentMenu = rs.getString("parent");
                strParentMenu = strParentMenu == null ? "" : strParentMenu.trim();
                String strRoles = rs.getString("ROLES");
                strRoles = strRoles == null ? "" : strRoles.trim();
                JSONObject obj = new JSONObject();
                obj.put("MenuLabel", strMenuLabel);
                obj.put("ParentMenu", strParentMenu);
                obj.put("RolesMapped", strRoles);
                objResponse.put(obj);
            }
            long lEndTime = System.nanoTime();
            logInfo("Time taken to query menu-rolemappings::" + (lEndTime - lStartTime) / 1000000);
        } catch (DataAccessException ex) {
            throw ex;
        } catch (SQLException e) {
            e.printStackTrace();
            logInfo("Exception while  retrieving menu role-mappings from DB. " + e);
            throw new DataAccessException(e.getErrorCode(), "Unable to fetch menu role-mappings.", e);
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while  retrieving menu role-mappings from DB. " + e);
            throw new ProcessingException("Unable to fetch menu role-mappings.", e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return objResponse;
    }

    public List<MenuItem> getAccessibleMenus(String strUserLogin, Properties objProps) {
        long lStartTime = System.nanoTime();
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Connection conn = null;
        List<MenuItem> menus = new ArrayList<MenuItem>();
        List<MenuItem> objChildMenus = new ArrayList<MenuItem>();
        try {
            conn = DBConnectionManager.getDBConnection(objProps);
            String query = objProps.getProperty("Q_get_allowed_menus");
            stmt = conn.prepareStatement(query);
            logInfo("query:" + query);
            stmt.setString(1, strUserLogin);
            rs = stmt.executeQuery();
            while (rs.next()) {
                long lMenuId = rs.getLong("menu_id");
                String strMenuLabel = rs.getString("menu_label");
                strMenuLabel = strMenuLabel == null ? "" : strMenuLabel.trim();
                String strModelPath = rs.getString("menu_model_path");
                strModelPath = strModelPath == null ? "" : strModelPath.trim();
                String strViewPath = rs.getString("menu_view_path");
                strViewPath = strViewPath == null ? "" : strViewPath.trim();
                String strStylePath = rs.getString("menu_style_path");
                strStylePath = strStylePath == null ? "" : strStylePath.trim();
                String strMenuIcon = rs.getString("menu_icon");
                strMenuIcon = strMenuIcon == null ? "" : strMenuIcon.trim();
                String strMenuType = rs.getString("menu_type");
                strMenuType = strMenuType == null ? "" : strMenuType.trim().toUpperCase();
                Long objParentMenu = rs.getLong("parent_menu");
                long lParentMenu = (objParentMenu == null) ? -1 : (objParentMenu == 0 ? -1 : objParentMenu);
                Long objMenuOrder = rs.getLong("menu_order");
                long lMenuOrder = (objMenuOrder == null) ? -1 : objMenuOrder;
                if (lMenuOrder != -1 && Constants.ALLOWED_MENU_TYPES.contains(strMenuType)) {
                    MenuItem objMenu = new MenuItem();
                    objMenu.setId(lMenuId);
                    objMenu.setDisplayName(strMenuLabel);
                    objMenu.setModel(strModelPath);
                    objMenu.setView(strViewPath);
                    objMenu.setStyle(strStylePath);
                    objMenu.setMenuOrder(lMenuOrder);
                    objMenu.setParentMenu(lParentMenu);
                    objMenu.setMenuType(strMenuType);
                    objMenu.setIcon(strMenuIcon);
                    if (lParentMenu == -1) {
                        objMenu.setMenuDepth(1);
                        menus.add(objMenu);
                    } else {
                        objChildMenus.add(objMenu);
                    }
                } else {
                    logInfo("Invalid menu configuration for ID[" + lMenuId + "], Either menu_order or menu_type is configured wrongly. "
                            + "Order should be a valid unique number[Given:" + lMenuOrder + "], Menu type should be in " + Constants.ALLOWED_MENU_TYPES + " [Given:" + strMenuType + "]");
                }
            }
            logInfo("Total Accessible Menus Before Filtering::" + (menus.size() + objChildMenus.size()));
            long lEndTime = System.nanoTime();
            logInfo("Time taken to query menus::" + (lEndTime - lStartTime) / 1000000);
            Collections.sort(menus, new MenuComparator());
            Collections.sort(objChildMenus, new MenuComparator());
            mapOrphanedChildrenToParent(menus, objChildMenus, 0);
            removeOrphanedParents(menus);
        } catch (DataAccessException ex) {
            throw ex;
        } catch (SQLException e) {
            e.printStackTrace();
            logInfo("Exception while  retrieving user accessible menus from DB. " + e);
            throw new DataAccessException(e.getErrorCode(), "Unable to fetch user accessible menus.", e);
        } catch (Exception e) {
            e.printStackTrace();
            logInfo("Exception while  retrieving user accessible menus from DB. " + e);
            throw new ProcessingException("Unable to fetch user accessible menus.", e);
        } finally {
            DBConnectionManager.closeDBResources(conn, stmt, rs);
        }
        return menus;
    }

    private static final long MAX_MENU_DEPTH = 5;
    private static final int FIRST_CHILD_DEPTH = 2;

    private void mapOrphanedChildrenToParent(List<MenuItem> menus, List<MenuItem> objChildMenus, int nCurrentIteration) {
        for (Iterator<MenuItem> it = objChildMenus.iterator(); it.hasNext();) {
            MenuItem objChildMenu = it.next();
            boolean isMapped = mapParentMenu(menus, objChildMenu, FIRST_CHILD_DEPTH);
            if (isMapped) {
                it.remove();
            }
        }
        if (!objChildMenus.isEmpty()) {
            if (MAX_MENU_DEPTH > nCurrentIteration) {
                logInfo("Few child menus are not mapped to their parents. Scanning level" + nCurrentIteration + " parents. Orphaned Childs:" + objChildMenus);
                mapOrphanedChildrenToParent(menus, objChildMenus, ++nCurrentIteration);
            } else {
                logInfo("<ERROR><ERROR> Few child menus are not mapped to their parents though we scanned " + nCurrentIteration + " levels. Ignoring orphaned childs:" + objChildMenus);
            }
        }
    }

    private boolean mapParentMenu(List<MenuItem> menus, MenuItem objChild, int depth) {
        for (Iterator<MenuItem> it = menus.iterator(); it.hasNext();) {
            MenuItem objMenu = it.next();
            if (objChild.getParentMenu() == objMenu.getId()) {
                objChild.setMenuDepth(depth);
                objMenu.addChild(objChild);
                return true;
            } else if (mapParentMenu(objMenu.getChilds(), objChild, (++depth))) {
                return true;
            }
        }
        return false;
    }

    static class MenuComparator implements Comparator<MenuItem> {

        @Override
        public int compare(MenuItem o1, MenuItem o2) {
            return (o1.getMenuOrder() > o2.getMenuOrder()) ? 1 : -1;
        }

    }

    private void removeOrphanedParents(List<MenuItem> items) {
        for (Iterator<MenuItem> iterator = items.iterator(); iterator.hasNext();) {
            MenuItem item = iterator.next();
            if (item.getMenuType().equalsIgnoreCase(Constants.MENU_TYPE_PARENT)) {
                if (item.getChilds().isEmpty()) {
                    logInfo("Removing menu item " + item + ", Because it doesn't have any child.");
                    iterator.remove();
                } else {
                    removeOrphanedParents(item.getChilds());
                }
            }
        }
    }

    private static final String CLASS_NAME = CommonDAO.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            Utility.logConsole("[" + CLASS_NAME + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }

}
