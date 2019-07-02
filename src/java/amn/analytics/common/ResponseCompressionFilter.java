package amn.analytics.common;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.zip.GZIPOutputStream;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.WriteListener;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

/**
 *
 * @author nmorla
 */
public class ResponseCompressionFilter implements Filter {

    private static final boolean debug = true;

    // The filter configuration object we are associated with.  If
    // this value is null, this filter instance is not currently
    // configured. 
    private FilterConfig filterConfig = null;

    public ResponseCompressionFilter() {
    }

    /**
     *
     * @param request The servlet request we are processing
     * @param response The servlet response we are creating
     * @param chain The filter chain we are processing
     *
     * @exception IOException if an input/output error occurs
     * @exception ServletException if a servlet error occurs
     */
    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        Throwable problem = null;
        try {
            if (acceptsGZipEncoding(httpRequest)) {
                httpResponse.addHeader("Content-Encoding", "gzip");
                GZipServletResponseWrapper gzipResponse = new GZipServletResponseWrapper(httpResponse);
                chain.doFilter(request, gzipResponse);
                gzipResponse.flushBuffer();
                gzipResponse.close();
                chain.doFilter(request, response);
            } else {
                chain.doFilter(request, response);
            }
        } catch (Throwable t) {
            problem = t;
            t.printStackTrace();
        }

        if (problem != null) {
            if (problem instanceof ServletException) {
                throw (ServletException) problem;
            }
            if (problem instanceof IOException) {
                throw (IOException) problem;
            }
            sendProcessingError(problem, response);
        }
    }

    /**
     * Return the filter configuration object for this filter.
     */
    public FilterConfig getFilterConfig() {
        return (this.filterConfig);
    }

    /**
     * Set the filter configuration object for this filter.
     *
     * @param filterConfig The filter configuration object
     */
    public void setFilterConfig(FilterConfig filterConfig) {
        this.filterConfig = filterConfig;
    }

    /**
     * Destroy method for this filter
     */
    public void destroy() {
    }

    /**
     * Init method for this filter
     */
    public void init(FilterConfig filterConfig) {
        this.filterConfig = filterConfig;
        if (filterConfig != null) {
            if (debug) {
                log("ResponseCompressionFilter:Initializing filter");
            }
        }
    }

    /**
     * Return a String representation of this object.
     */
    @Override
    public String toString() {
        if (filterConfig == null) {
            return ("ResponseCompressionFilter()");
        }
        StringBuffer sb = new StringBuffer("ResponseCompressionFilter(");
        sb.append(filterConfig);
        sb.append(")");
        return (sb.toString());
    }

    private void sendProcessingError(Throwable t, ServletResponse response) {
        String stackTrace = getStackTrace(t);

        if (stackTrace != null && !stackTrace.equals("")) {
            try {
                response.setContentType("text/html");
                PrintStream ps = new PrintStream(response.getOutputStream());
                PrintWriter pw = new PrintWriter(ps);
                pw.print("<html>\n<head>\n<title>Error</title>\n</head>\n<body>\n"); //NOI18N

                // PENDING! Localize this for next official release
                pw.print("<h1>The resource did not process correctly</h1>\n<pre>\n");
                pw.print(stackTrace);
                pw.print("</pre></body>\n</html>"); //NOI18N
                pw.close();
                ps.close();
                response.getOutputStream().close();
            } catch (Exception ex) {
            }
        } else {
            try {
                PrintStream ps = new PrintStream(response.getOutputStream());
                t.printStackTrace(ps);
                ps.close();
                response.getOutputStream().close();
            } catch (Exception ex) {
            }
        }
    }

    private boolean acceptsGZipEncoding(HttpServletRequest httpRequest) {
        String acceptEncoding
                = httpRequest.getHeader("Accept-Encoding");

        return acceptEncoding != null
                && acceptEncoding.indexOf("gzip") != -1;
    }

    public static String getStackTrace(Throwable t) {
        String stackTrace = null;
        try {
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            t.printStackTrace(pw);
            pw.close();
            sw.close();
            stackTrace = sw.getBuffer().toString();
        } catch (Exception ex) {
        }
        return stackTrace;
    }

    public void log(String msg) {
        filterConfig.getServletContext().log(msg);
    }

}

class GZipServletResponseWrapper extends HttpServletResponseWrapper {

    private GZipServletOutputStream gzipOutputStream = null;
    private PrintWriter printWriter = null;

    public GZipServletResponseWrapper(HttpServletResponse response)
            throws IOException {
        super(response);
    }

    public void close() throws IOException {

        //PrintWriter.close does not throw exceptions.
        //Hence no try-catch block.
        if (this.printWriter != null) {
            this.printWriter.close();
        }

        if (this.gzipOutputStream != null) {
            this.gzipOutputStream.close();
        }
    }

    /**
     * Flush OutputStream or PrintWriter
     *
     * @throws IOException
     */
    @Override
    public void flushBuffer() throws IOException {

        //PrintWriter.flush() does not throw exception
        if (this.printWriter != null) {
            this.printWriter.flush();
        }

        IOException exception1 = null;
        try {
            if (this.gzipOutputStream != null) {
                this.gzipOutputStream.flush();
            }
        } catch (IOException e) {
            exception1 = e;
        }

        IOException exception2 = null;
        try {
            super.flushBuffer();
        } catch (IOException e) {
            exception2 = e;
        }

        if (exception1 != null) {
            throw exception1;
        }
        if (exception2 != null) {
            throw exception2;
        }
    }

    @Override
    public ServletOutputStream getOutputStream() throws IOException {
        if (this.printWriter != null) {
            throw new IllegalStateException(
                    "PrintWriter obtained already - cannot get OutputStream");
        }
        if (this.gzipOutputStream == null) {
            this.gzipOutputStream = new GZipServletOutputStream(getResponse().getOutputStream());
        }
        return this.gzipOutputStream;
    }

    @Override
    public PrintWriter getWriter() throws IOException {
        if (this.printWriter == null && this.gzipOutputStream != null) {
            throw new IllegalStateException(
                    "OutputStream obtained already - cannot get PrintWriter");
        }
        if (this.printWriter == null) {
            this.gzipOutputStream = new GZipServletOutputStream(getResponse().getOutputStream());
            this.printWriter = new PrintWriter(new OutputStreamWriter(this.gzipOutputStream, getResponse().getCharacterEncoding()));
        }
        return this.printWriter;
    }

    @Override
    public void setContentLength(int len) {
        //ignore, since content length of zipped content
        //does not match content length of unzipped content.
    }
}

class GZipServletOutputStream extends ServletOutputStream {

    private GZIPOutputStream gzipOutputStream = null;

    public GZipServletOutputStream(OutputStream output)
            throws IOException {
        super();
        this.gzipOutputStream = new GZIPOutputStream(output);
    }

    @Override
    public void close() throws IOException {
        this.gzipOutputStream.close();
    }

    @Override
    public void flush() throws IOException {
        this.gzipOutputStream.flush();
    }

    @Override
    public void write(byte b[]) throws IOException {
        this.gzipOutputStream.write(b);
    }

    @Override
    public void write(byte b[], int off, int len) throws IOException {
        this.gzipOutputStream.write(b, off, len);
    }

    @Override
    public void write(int b) throws IOException {
        this.gzipOutputStream.write(b);
    }

    @Override
    public boolean isReady() {
        return true;
    }

    @Override
    public void setWriteListener(WriteListener writeListener) {

    }

}
