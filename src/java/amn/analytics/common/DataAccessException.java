package amn.analytics.common;

/**
 *
 * @author nmorla
 */
public class DataAccessException extends RuntimeException {

    private int errorCode;
    private String errorMessage;

    public DataAccessException(int errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.errorMessage = message;
    }

    public DataAccessException(int errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.errorMessage = message;
    }

}
