package amn.analytics.common;

import java.util.Properties;

/**
 *
 * @author nmorla
 */
public class CustomProperties extends Properties {

    @Override
    public String getProperty(String key) {
        String value = super.getProperty(key);
        if (value != null && value.contains("{DB_SCHEMA}")) {
            value = value.replace("{DB_SCHEMA}", Constants.DB_SCHEMA);
        }
        return value;
    }

    @Override
    public String getProperty(String key, String defaultValue) {
        String value = super.getProperty(key, defaultValue);
        if (value != null && value.contains("{DB_SCHEMA}")) {
            value = value.replace("{DB_SCHEMA}", super.getProperty("DB_SCHEMA"));
        }
        return value;
    }

}
