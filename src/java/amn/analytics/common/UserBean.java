package amn.analytics.common;

import java.io.Serializable;

/**
 * This class should be serializable as we keep it in session.
 * @author nmorla
 */
public class UserBean implements Serializable {

    private String userLogin;
    private String userKey;
    private boolean adminUser;

    public String getUserLogin() {
        return userLogin;
    }

    public void setUserLogin(String userLogin) {
        this.userLogin = userLogin;
    }

    public String getUserKey() {
        return userKey;
    }

    public void setUserKey(String userKey) {
        this.userKey = userKey;
    }

    public boolean isAdminUser() {
        return adminUser;
    }

    public void setAdminUser(boolean adminUser) {
        this.adminUser = adminUser;
    }

    @Override
    public String toString() {
        return "{User Login:" + getUserLogin() + ", User Key:" + getUserKey() + ", Admin User:" + isAdminUser() + "}";
    }

}
