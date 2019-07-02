package amn.analytics.common;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.CharArrayReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ReadListener;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.WriteListener;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

/**
 * @author nmorla
 */
public class CommonScriptInjectionFilter implements Filter {

    private static final String MODULE_OBJECTS_PATTERN = "function (oj, ko, $, keySet)";
    private static final String REQUIRES_PATTERN = "require([";
    private static final String SCRIPTS_PATHS_PATTERN = "var myPaths = {";
    private static final String MODEL_OBJECTS_ARRAY_PATTERN = "var modelObjects = [];";
    public static final String MODEL_PREFIX = "model";

    private static final boolean debug = false;

    private FilterConfig filterConfig = null;

    public CommonScriptInjectionFilter() {
    }

    private void inspectRequest(RequestWrapper request, ResponseWrapper response)
            throws IOException, ServletException {
        if (debug) {
            log("RequestResponseFilter:DoBeforeProcessing");
        }

    }

    private String removeComments(String s) throws IOException {
        StringBuilder strResponse = new StringBuilder();
        BufferedReader rd = new BufferedReader(new CharArrayReader(s.toCharArray()));
        String line;
        while ((line = rd.readLine()) != null) {
            line = line.trim();
            if (line.startsWith("//") && !line.equalsIgnoreCase("//'use strict';")) {
                continue;
            }
            strResponse.append(System.lineSeparator()).append(line);
        }
        return strResponse.toString();
    }
    int nScannedIndex = 0;

    private String injectScriptIntoFile(RequestWrapper request, ResponseWrapper response)
            throws IOException, ServletException {
        if (debug) {
            log("RequestResponseFilter:DoAfterProcessing");
        }
        List<MenuItem> items = (List<MenuItem>) request.getSession().getAttribute(Constants.MENU_ITEMS);
        if (items == null) {
            System.out.println("[CommonScriptInjectionFilter.injectScriptIntoFile] <warning><warning> User login processed on a different server, Script loading requests processing on different servers. ");
            String strUserSSOLogin = Utility.getUserLoginFromContext(request);
            items = new CommonDAO().getAccessibleMenus(strUserSSOLogin, objProperties);
            request.getSession().setAttribute(Constants.MENU_ITEMS, items);
        }
        String strSciptFileContent = new String(response.getResponseCopy());
        //System.out.println("Before injecting dependencies::" + strSciptFileContent);
//        strSciptFileContent = removeComments(strSciptFileContent);
        if (!strSciptFileContent.isEmpty()) {
            List<String> scriptIds = new ArrayList<String>();
            strSciptFileContent = addScriptPaths(strSciptFileContent, items, scriptIds);
            strSciptFileContent = addRequires(strSciptFileContent, scriptIds);
            strSciptFileContent = addModuleObjects(strSciptFileContent, scriptIds);
            strSciptFileContent = prepareModuleObjects(strSciptFileContent, scriptIds);
        }
        //System.out.println("Response Content:" + strSciptFileContent);
        return strSciptFileContent;
    }

    private String addScriptPaths(String strSciptFileContent, List<MenuItem> items, List<String> scriptIds) throws ServletException {
        int nPathStartIndex = strSciptFileContent.indexOf(SCRIPTS_PATHS_PATTERN);
        if (nPathStartIndex > 0) {
            int nPathEndIndex = strSciptFileContent.indexOf("}", nPathStartIndex);
            nScannedIndex = nPathEndIndex;
            String strPaths = strSciptFileContent.substring(nPathStartIndex, nPathEndIndex);
            String strModifiedPaths = getModifiedScriptPaths(items, scriptIds);
            strModifiedPaths = strPaths + strModifiedPaths;
//            System.out.println("Modified Paths:" + strModifiedPaths);
            strSciptFileContent = strSciptFileContent.replace(strPaths, strModifiedPaths);
            System.out.println("Paths Modified...");
        } else {
            throw new ServletException("Common model is not defined properly. \"" + SCRIPTS_PATHS_PATTERN + "\" not found in model.");
        }
        return strSciptFileContent;
    }

    private String getModifiedScriptPaths(List<MenuItem> items, List<String> scriptIds) {
        //            System.out.println("Paths:" + strPaths);
        StringBuilder strModifiedPaths = new StringBuilder();
        for (MenuItem item : items) {
            String strMenuType = item.getMenuType();
            if (strMenuType.equalsIgnoreCase(Constants.MENU_TYPE_LEAF)) {
                String strMenuModel = item.getModel();
                strMenuModel = strMenuModel == null ? "" : strMenuModel.trim();
                int nExtIndex = strMenuModel.indexOf(".js");
                if (nExtIndex != -1) {
                    strMenuModel = strMenuModel.substring(0, nExtIndex);
                    if (!strMenuModel.startsWith("/")) {
                        strMenuModel = "/" + strMenuModel;
                    }
                    if (!strMenuModel.isEmpty()) {
                        String scriptId = MODEL_PREFIX + String.valueOf(item.getId());
                        scriptIds.add(scriptId);
                        strModifiedPaths.append(",").append(System.lineSeparator());
                        strModifiedPaths.append("'").append(scriptId).append("': '../..").append(strMenuModel).append("'");
                    }
                }
            } else if (!item.getChilds().isEmpty()) {
                String strChildItemsPath = getModifiedScriptPaths(item.getChilds(), scriptIds);
                strModifiedPaths.append(strChildItemsPath);
            }
        }
//        strPaths + ",'addapprovers': '../../apprmodify/js/addapproversmodel'," + System.lineSeparator() + "'modifyapprovers': '../../apprmodify/js/modifyapproversmodel'";
        return strModifiedPaths.toString();
    }

    private String addRequires(String strSciptFileContent, List<String> scriptIds) throws ServletException {
        if (!scriptIds.isEmpty()) {
            int nPathStartIndex = strSciptFileContent.indexOf(REQUIRES_PATTERN, nScannedIndex);
            if (nPathStartIndex > 0) {
                int nPathEndIndex = strSciptFileContent.indexOf("]", nPathStartIndex);
                String strRequires = strSciptFileContent.substring(nPathStartIndex, nPathEndIndex);
                nScannedIndex = nPathEndIndex;
//            System.out.println("Requires:" + strRequires);
                String strRequiresSub1 = strRequires.substring(0, REQUIRES_PATTERN.length());
                String strRequiresSub2 = strRequires.substring(REQUIRES_PATTERN.length());
                StringBuilder strModifiedRequires = new StringBuilder(strRequiresSub1);
                for (String scriptId : scriptIds) {
                    strModifiedRequires.append("'").append(scriptId).append("',");
                }
                strModifiedRequires.append(strRequiresSub2);
//            System.out.println("Modified Requires:" + strModifiedRequires);
                strSciptFileContent = strSciptFileContent.replace(strRequires, strModifiedRequires);
                System.out.println("Requires Modified...");
            } else {
                throw new ServletException("Common model is not defined properly. \"" + REQUIRES_PATTERN + "\" not found in model.");
            }
        }
        return strSciptFileContent;
    }

    private String addModuleObjects(String strSciptFileContent, List<String> scriptIds) throws ServletException {
        int nPathStartIndex = strSciptFileContent.indexOf(MODULE_OBJECTS_PATTERN, nScannedIndex);
        if (nPathStartIndex > 0) {
            int nPathEndIndex = nPathStartIndex + MODULE_OBJECTS_PATTERN.length();
            String strModuleObjects = strSciptFileContent.substring(nPathStartIndex, nPathEndIndex);
            nScannedIndex = nPathEndIndex;
//            System.out.println("Module Objects:" + strModuleObjects);
            String strModulesSub1 = strModuleObjects.substring(0, "function (".length());
            String strModulesSub2 = strModuleObjects.substring("function (".length());
            StringBuilder strModifiedRequires = new StringBuilder(strModulesSub1);
            for (String scriptId : scriptIds) {
                strModifiedRequires.append("").append(scriptId).append(",");
            }
            strModifiedRequires.append(strModulesSub2);
//            System.out.println("Modified Modules:" + strModifiedRequires);
            strSciptFileContent = strSciptFileContent.replace(strModuleObjects, strModifiedRequires);
            System.out.println("Module Objects Modified...");
        } else {
            throw new ServletException("Common model is not defined properly. \"" + MODULE_OBJECTS_PATTERN + "\" not found in model.");
        }
        return strSciptFileContent;
    }

    private String prepareModuleObjects(String strSciptFileContent, List<String> scriptIds) throws ServletException {
        int nPathStartIndex = strSciptFileContent.indexOf(MODEL_OBJECTS_ARRAY_PATTERN, nScannedIndex);
        if (nPathStartIndex > 0) {
            int nPathEndIndex = nPathStartIndex + MODEL_OBJECTS_ARRAY_PATTERN.length();
            String strModuleObjects = strSciptFileContent.substring(nPathStartIndex, nPathEndIndex + 1);
            nScannedIndex = nPathEndIndex;
//            System.out.println("Module Array Argument:" + strModuleObjects);
            StringBuilder strModifiedRequires = new StringBuilder("var modelObjects={");

            for (Iterator<String> it = scriptIds.iterator(); it.hasNext();) {
                String scriptId = it.next();
                String strViewPageId = scriptId.replaceFirst(MODEL_PREFIX, "");
                strModifiedRequires.append("'menuId").append(strViewPageId).append("':").append(scriptId).append("");
                if (it.hasNext()) {
                    strModifiedRequires.append(",");
                }
            }
            strModifiedRequires.append("};");
//            System.out.println("Modified Module Array Argument:" + strModuleObjects);
            strSciptFileContent = strSciptFileContent.replace(strModuleObjects, strModifiedRequires);
            System.out.println("Module Array Arguments Modified...");
        } else {
            throw new ServletException("Common model is not defined properly. \"" + MODEL_OBJECTS_ARRAY_PATTERN + "\" not found in model.");
        }
        return strSciptFileContent;
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
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain)
            throws IOException, ServletException {

        RequestWrapper wrappedRequest = new RequestWrapper((HttpServletRequest) request);
        ResponseWrapper wrappedResponse = new ResponseWrapper((HttpServletResponse) response);
        inspectRequest(wrappedRequest, wrappedResponse);

        Throwable problem = null;
//        System.out.println("Before invoking script file :: " + new String(wrappedResponse.getResponseCopy()));

        try {
            chain.doFilter(wrappedRequest, wrappedResponse);
        } catch (Throwable t) {
            // If an exception is thrown somewhere down the filter chain,
            // we still want to execute our after processing, and then
            // rethrow the problem after that.
            problem = t;
            t.printStackTrace();
        }
        String strModifiedScript = injectScriptIntoFile(wrappedRequest, wrappedResponse);
//        String strModifiedScript = new String(wrappedResponse.getResponseCopy());
        String strFinalResponse = new String(strModifiedScript.getBytes(), "ISO-8859-1");
////        response.getOutputStream().write("Start of the line".getBytes());
        byte[] bytes = strFinalResponse.getBytes();
//        ((HttpServletResponse) response).setHeader("Content-Type", "text/javascript");

        response.resetBuffer();
        response.getOutputStream().write(bytes);
        response.getOutputStream().flush();
////        System.out.println("ISO::" + strFinalResponse);
//        response.setContentLength(strFinalResponse.length());
        if (problem != null) {
            if (problem instanceof ServletException) {
                throw (ServletException) problem;
            }
            if (problem instanceof IOException) {
                throw (IOException) problem;
            }
            sendProcessingError(problem, response);
        }
        System.out.println("End of CommonScriptInjectionFilter.doFilter");
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
    private Properties objProperties;
    private String fileName = "common/appParameters.properties";

    /**
     * Init method for this filter
     */
    public void init(FilterConfig filterConfig) throws ServletException {
        this.filterConfig = filterConfig;
        if (filterConfig != null) {
            if (debug) {
                log("RequestResponseFilter: Initializing filter");
            }
            try {
                objProperties = (Properties) filterConfig.getServletContext().getAttribute(Constants.COMMON_PROPERTIES_NAME);
                if (objProperties == null || objProperties.isEmpty()) {
                    objProperties = Utility.readProperties(filterConfig.getServletContext(), fileName);
                    filterConfig.getServletContext().setAttribute(Constants.COMMON_PROPERTIES_NAME, objProperties);
                }
            } catch (Exception ex) {
                throw new ServletException("Couldn't load application properties.", ex);
            }
        }
    }

    /**
     * Return a String representation of this object.
     */
    @Override
    public String toString() {
        if (filterConfig == null) {
            return ("RequestResponseFilter()");
        }
        StringBuffer sb = new StringBuffer("RequestResponseFilter(");
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

    /**
     * This request wrapper class extends the support class
     * HttpServletRequestWrapper, which implements all the methods in the
     * HttpServletRequest interface, as delegations to the wrapped request. You
     * only need to override the methods that you need to change. You can get
     * access to the wrapped request using the method getRequest()
     */
    class RequestWrapper extends HttpServletRequestWrapper {

        private final String requestBody;

        public RequestWrapper(HttpServletRequest request) {
            super(request);
            StringBuilder stringBuilder = new StringBuilder();
            BufferedReader bufferedReader = null;

            try {
                InputStream inputStream = request.getInputStream();

                if (inputStream != null) {
                    bufferedReader = new BufferedReader(new InputStreamReader(inputStream));

                    char[] charBuffer = new char[128];
                    int bytesRead = -1;

                    while ((bytesRead = bufferedReader.read(charBuffer)) > 0) {
                        stringBuilder.append(charBuffer, 0, bytesRead);
                    }
                } else {
                    stringBuilder.append("");
                }
            } catch (IOException ex) {
                System.out.println("Error reading the request body...");
            } finally {
                if (bufferedReader != null) {
                    try {
                        bufferedReader.close();
                    } catch (IOException ex) {
                        System.out.println("Error closing bufferedReader...");
                    }
                }
            }

            requestBody = stringBuilder.toString();
        }

        protected Hashtable localParams = null;

        public void setParameter(String name, String[] values) {
            if (debug) {
                System.out.println("RequestResponseFilter::setParameter(" + name + "=" + values + ")" + " localParams = " + localParams);
            }

            if (localParams == null) {
                localParams = new Hashtable();
                // Copy the parameters from the underlying request.
                Map wrappedParams = getRequest().getParameterMap();
                Set keySet = wrappedParams.keySet();
                for (Iterator it = keySet.iterator(); it.hasNext();) {
                    Object key = it.next();
                    Object value = wrappedParams.get(key);
                    localParams.put(key, value);
                }
            }
            localParams.put(name, values);
        }

        @Override
        public ServletInputStream getInputStream() throws IOException {
            final ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(requestBody.getBytes());

            ServletInputStream inputStream = new ServletInputStream() {
                @Override
                public int read() throws IOException {
                    return byteArrayInputStream.read();
                }

                @Override
                public void setReadListener(ReadListener listener) {
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public boolean isFinished() {
                    return false;
                }

            };

            return inputStream;
        }

        @Override
        public String getParameter(String name) {
            if (debug) {
                System.out.println("RequestResponseFilter::getParameter(" + name + ") localParams = " + localParams);
            }
            if (localParams == null) {
                return getRequest().getParameter(name);
            }
            Object val = localParams.get(name);
            if (val instanceof String) {
                return (String) val;
            }
            if (val instanceof String[]) {
                String[] values = (String[]) val;
                return values[0];
            }
            return (val == null ? null : val.toString());
        }

        @Override
        public String[] getParameterValues(String name) {
            if (debug) {
                System.out.println("RequestResponseFilter::getParameterValues(" + name + ") localParams = " + localParams);
            }
            if (localParams == null) {
                return getRequest().getParameterValues(name);
            }
            return (String[]) localParams.get(name);
        }

        @Override
        public Enumeration getParameterNames() {
            if (debug) {
                System.out.println("RequestResponseFilter::getParameterNames() localParams = " + localParams);
            }
            if (localParams == null) {
                return getRequest().getParameterNames();
            }
            return localParams.keys();
        }

        @Override
        public Map getParameterMap() {
            if (debug) {
                System.out.println("RequestResponseFilter::getParameterMap() localParams = " + localParams);
            }
            if (localParams == null) {
                return getRequest().getParameterMap();
            }
            return localParams;
        }
    }

    /**
     * This response wrapper class extends the support class
     * HttpServletResponseWrapper, which implements all the methods in the
     * HttpServletResponse interface, as delegations to the wrapped response.
     * You only need to override the methods that you need to change. You can
     * get access to the wrapped response using the method getResponse()
     */
    class ResponseWrapper extends HttpServletResponseWrapper {

        private ServletOutputStream outputStream;
        private PrintWriter writer;
        private CustomServletOutputStream copier;

        public ResponseWrapper(HttpServletResponse response) {
            super(response);
        }

        // You might, for example, wish to know what cookies were set on the response
        // as it went throught the filter chain. Since HttpServletRequest doesn't
        // have a get cookies method, we will need to store them locally as they
        // are being set.
        /*
	protected Vector cookies = null;
	
	// Create a new method that doesn't exist in HttpServletResponse
	public Enumeration getCookies() {
		if (cookies == null)
		    cookies = new Vector();
		return cookies.elements();
	}
	
	// Override this method from HttpServletResponse to keep track
	// of cookies locally as well as in the wrapped response.
	public void addCookie (Cookie cookie) {
		if (cookies == null)
		    cookies = new Vector();
		cookies.add(cookie);
		((HttpServletResponse)getResponse()).addCookie(cookie);
	}
         */
        @Override
        public ServletOutputStream getOutputStream() throws IOException {
            if (writer != null) {
                throw new IllegalStateException("getWriter() has already been called on this response.");
            }

            if (outputStream == null) {
                outputStream = getResponse().getOutputStream();
                copier = new CustomServletOutputStream(outputStream);
            }

            return copier;
        }

        @Override
        public PrintWriter getWriter() throws IOException {
            if (outputStream != null) {
                throw new IllegalStateException("getOutputStream() has already been called on this response.");
            }

            if (writer == null) {
                copier = new CustomServletOutputStream(getResponse().getOutputStream());
                writer = new PrintWriter(new OutputStreamWriter(copier, getResponse().getCharacterEncoding()), true);
            }

            return writer;
        }

        @Override
        public void flushBuffer() throws IOException {
            if (writer != null) {
                writer.flush();
            } else if (outputStream != null) {
                copier.flush();
            }
        }

        public byte[] getResponseCopy() {
            if (copier != null) {
                return copier.getResponseCopy();
            } else {
                return new byte[0];
            }
        }

        @Override
        public void setContentLength(int len) {
//            super.setContentLength(len); //To change body of generated methods, choose Tools | Templates.
        }

    }

    /**
     * Utility class to copy the response from servet output stream to cache
     * without disturbing actual behaviour of servlet request/response cycle. So
     * that we can use this cached response for logging....
     */
    class CustomServletOutputStream extends ServletOutputStream {

        private OutputStream outputStream;
        private ByteArrayOutputStream byteArrayOutputStream;

        public CustomServletOutputStream(OutputStream outputStream) {
            this.outputStream = outputStream;
            this.byteArrayOutputStream = new ByteArrayOutputStream(1024);
        }

        @Override
        public void print(String s) throws IOException {
//            super.print(s);
            byteArrayOutputStream.write(s.getBytes());
//            outputStream.write(s.getBytes());
        }

        @Override
        public void print(char s) throws IOException {
//            super.print(s);
            byteArrayOutputStream.write(s);
//            outputStream.write(s);
        }

        @Override
        public void write(int b) throws IOException {
//            outputStream.write(b);
            byteArrayOutputStream.write(b);
//            System.out.println("========================print int=================================");
//            Throwable t = new Throwable();
//            StackTraceElement[] ele = t.getStackTrace();
//            for (StackTraceElement stackTraceElement : ele) {
//                System.out.println("" + stackTraceElement.getClassName() + "<=>" + stackTraceElement.getMethodName() + "<=>" + stackTraceElement.getLineNumber());
//            }
//            System.out.println("=========================================================");
        }

        public byte[] getResponseCopy() {
            return byteArrayOutputStream.toByteArray();
        }

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setWriteListener(WriteListener writeListener) {

        }

    }
}
