package amn.analytics.common;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author nmorla
 */
public class ExceptionHandler extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        System.out.println("I am in exception handler.");
        try {
            PrintWriter out = response.getWriter();
            // Analyze the servlet exception
            Throwable objActualException = (Throwable) request.getAttribute("javax.servlet.error.exception");
            Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
            String sourceOfException = (String) request.getAttribute("javax.servlet.error.servlet_name");
            if (sourceOfException == null) {
                sourceOfException = "Unknown Source";
            }
            String requestUri = (String) request.getAttribute("javax.servlet.error.request_uri");
            if (requestUri == null) {
                requestUri = "Unknown";
            }
//            String strContentType = request.getContentType();
            String strContentType = request.getHeader("Accept");
            strContentType = strContentType == null ? "" : strContentType.trim();
//            response.setContentType("text/html");
            if (statusCode == 404) {
                System.out.println("Requested resource is not found:" + requestUri + ", Source of exception:" + sourceOfException);
                request.setAttribute("errorInProcessing", "true");
//                request.setAttribute("javax.servlet.error.status_code", "404");
                request.getRequestDispatcher("/").forward(request, response);
            } else if (statusCode != 500) {
                if (strContentType.toUpperCase().contains("JSON")) {
                    out.write("{\"Status Code\":\"" + statusCode + "\"}");
                    response.setContentType("application/json");
                } else {
                    out.write("<h3>Error Details</h3>");
                    out.write("<strong>Status Code</strong>:" + statusCode + "<br>");
                    out.write("<strong>Requested URI</strong>:" + requestUri);
                }
            } else if (statusCode == 500) {
                System.out.println("Internal server error while processing resource:" + requestUri + ", Source of exception:" + sourceOfException);
                if (strContentType.toUpperCase().contains("JSON")) {
                    out.write("{\"Status Code\":\"" + statusCode + "\",\"Root Cause\":\"" + objActualException.getMessage() + "\"}");
                    response.setContentType("application/json");
                } else {
                    out.write("<h3>Exception Details</h3>");
                    out.write("<ul><li>Servlet Name:" + sourceOfException + "</li>");
                    out.write("<li>Exception Name:" + objActualException.getClass().getName() + "</li>");
                    out.write("<li>Requested URI:" + requestUri + "</li>");
                    out.write("<li>Exception Message:" + objActualException.getMessage() + "</li>");
                    out.write("</ul>");
                    request.setAttribute("5XX_ERROR_MSG", objActualException.getMessage());
                }
            }
            out.flush();
        } catch (Exception ex) {
            ex.printStackTrace();
        }

    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
