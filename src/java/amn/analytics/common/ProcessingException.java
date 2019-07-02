package amn.analytics.common;

/**
 *
 * @author nmorla
 */
public class ProcessingException extends RuntimeException {

    public ProcessingException(String message, Throwable t) {
        super(message, t);
    }

}
