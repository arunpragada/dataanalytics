package amn.analytics.superadmin;

import java.util.Date;
import amn.analytics.common.Utility;

/**
 *
 * @author nmorla
 */
public class SuperAdminDAO {

    private static final String CLASS_NAME = SuperAdminDAO.class.getSimpleName();

    private static void logInfo(Object obj) {
        if (obj != null) {
            Utility.logConsole("[" + CLASS_NAME + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }

}
