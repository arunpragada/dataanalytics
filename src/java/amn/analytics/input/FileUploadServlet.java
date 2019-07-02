package amn.analytics.input;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.LineIterator;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.json.JSONObject;

/**
 *
 * @author nmorla
 */
@MultipartConfig(fileSizeThreshold = 20 * 1024 * 1024,
        maxFileSize = 1024 * 1024 * 500,
        maxRequestSize = 1024 * 1024 * 500 * 5)
public class FileUploadServlet extends HttpServlet {

    private String pattern = "yyyyMMddHHmmss";
    private SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);
    private String strDefaultFileName;
    private String strDatasetUploadPath;
    private String strControlFileUploadPath;
    private Properties objProperties = null;
    private static final String PROPERTIES_NAME = "DATASET_PROPERTIES";
    private static final String fileName = "input/appParameters.properties";

    @Override
    public void init() throws ServletException {
        try {
            super.init();
            ServletConfig config = getServletConfig();
            strDefaultFileName = config.getInitParameter("file_default_name");
            strDatasetUploadPath = config.getInitParameter("dataset_upload_directory");
            strControlFileUploadPath = config.getInitParameter("controlfile_upload_directory");
            objProperties = (Properties) getServletContext().getAttribute(PROPERTIES_NAME);
            if (objProperties == null || objProperties.isEmpty()) {
                objProperties = amn.analytics.common.Utility.readProperties(getServletContext(), fileName);
                getServletContext().setAttribute(PROPERTIES_NAME, objProperties);
                String strMaxRows = config.getInitParameter("MAX_RECORDS_TO_DISPLAY");
                strMaxRows = strMaxRows == null ? "" : strMaxRows.trim();
                logInfo("<warning><warning> Application-Properties not found in ServletContext. Seems load balancer sent first request to another node where Application-Properties are read and kept in context. Now Application-Properties read and kept in context");
            }
        } catch (Exception e) {

        }
    }

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
        logMessage("File upload servlet::entering");
        try (PrintWriter out = response.getWriter()) {
//            String uploadPath = getServletContext().getRealPath("") + File.separator + Constants.UPLOAD_DIRECTORY;

            logMessage("Upload Directory:" + strDatasetUploadPath);
            File uploadDir = new File(strDatasetUploadPath);
            if (!uploadDir.exists()) {
                logMessage("Creating upload directory");
                uploadDir.mkdir();
            }
            File controlDir = new File(strControlFileUploadPath);
            if (!controlDir.exists()) {
                logMessage("Creating control files directory");
                controlDir.mkdir();
            }
            DatasetBean bean = new DatasetBean();
            String strControlFile = "";
            String strDataFile = "";
            String strJustification = request.getParameter("justification");
            String strDatasetTitle = request.getParameter("title");
            for (Part part : request.getParts()) {
                String fileName = getFileName(part);
                logMessage("Part Name::" + part.getName() + ", " + part.getSubmittedFileName() + ", " + part.getHeaderNames());
                if (part.getName().equals("data_file")) {
                    bean.setDatasetFileName(fileName);
                    bean.setDatasetPath(strDatasetUploadPath);
                    logMessage("Writing dataset part to:" + strDatasetUploadPath + File.separator + fileName);
                    part.write(strDatasetUploadPath + File.separator + fileName);
                    strDataFile = strDatasetUploadPath + File.separator + fileName;
                } else if (part.getName().equals("control_file")) {
                    bean.setControlFileName(fileName);
                    bean.setControlFilePath(strControlFileUploadPath);
                    logMessage("Writing control file part to:" + strControlFileUploadPath + File.separator + fileName);
                    part.write(strControlFileUploadPath + File.separator + fileName);
                    strControlFile = strControlFileUploadPath + File.separator + fileName;
                }

            }
            bean.setStatus(amn.analytics.common.Constants.STATUS_SUBMITTED);
            DatasetDataAccessOperations objDAO = new DatasetDataAccessOperations();
            bean.setSupportnotes(strJustification);
            bean.setTitle(strDatasetTitle);
            int insId = objDAO.uploadDataset(bean, objProperties);
            bean.setId(insId);
            if (!strControlFile.equalsIgnoreCase("")) {
                Workbook workbook = WorkbookFactory.create(new File(strControlFile));
                // Retrieving the number of sheets in the Workbook
                Sheet sheet = workbook.getSheetAt(0);

                // Create a DataFormatter to format and get each cell's value as String
                DataFormatter dataFormatter = new DataFormatter();
                System.out.println("Workbook has " + workbook.getNumberOfSheets() + " Sheets : ");
                System.out.println("\n\nIterating over Rows and Columns using Iterator\n");
                Iterator<Row> rowIterator = sheet.rowIterator();
                List<DatasetSchemaBean> dsList = new ArrayList<DatasetSchemaBean>();
                int rowCount = 1;
                boolean isValid = true;
                Set validDtypes = getValidDataTypes();

                while (rowIterator.hasNext()) {
                    Row row = rowIterator.next();
                    // Now let's iterate over the columns of the current row
                    Iterator<Cell> cellIterator = row.cellIterator();
                    DatasetSchemaBean dsSchemaBean = new DatasetSchemaBean();
                    dsSchemaBean.setDatasetId(insId);
                    dsSchemaBean.setColOrder(rowCount);
                    int i = 1;
                    while (cellIterator.hasNext()) {
                        Cell cell = cellIterator.next();
                        String cellValue = dataFormatter.formatCellValue(cell);

                        if (i == 1) {
                            dsSchemaBean.setColName(cellValue);
                        } else if (i == 2) {
                            dsSchemaBean.setColDataType(cellValue);
                            if (!validDtypes.contains(cellValue)) {
                                isValid = false;
                            }
                        } else if (i == 3) {
                            dsSchemaBean.setColDefaultVal(cellValue);
                        } else if (i == 4) {
                            dsSchemaBean.setColMandatory(cellValue);
                        }
                        System.out.print(cellValue + "\t");

                        i++;
                    }
                    dsList.add(dsSchemaBean);
                    rowCount++;
                    System.out.println();
                }
                if (dsList.size() > 0 && isValid) {
                    objDAO.uploadDatasetSchema(dsList, objProperties);
                    insertDatasetRecords(strDataFile, dsList, objDAO, insId, objProperties);
                } else if (!isValid) {
                    objDAO.deleteUploadDataset(insId, objProperties);
                    out.print("{\"status\":\"500\",\"message\":\"Meta File Validation Failed.\"}");
                    return;
                }
            }

            JSONObject json = amn.analytics.common.Utility.toJSON(bean);
            //  out.print("{\"status\":\"202\",\"item\":" +json+ "}");
            out.print(json);
            // response.setStatus(HttpServletResponse.SC_ACCEPTED);
            // String strResponse = "{\"item\":" + json + "}";
            //      response.getWriter().write(strResponse);
        } catch (Exception e) {
            response.getWriter().println("{\"status\":\"500\",\"message\":\"File Upload Failed.\"}");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            logMessage("Exception while uploading file. " + e);
            e.printStackTrace();
        }
    }

    private Set getValidDataTypes() {
        Set<String> vdt = new HashSet<String>();
        vdt.add("int");
        vdt.add("string");
        vdt.add("long");
        vdt.add("timestamp");
        vdt.add("double");
        return vdt;
    }

    private void insertDatasetRecords(String fileName, List<DatasetSchemaBean> dsList, DatasetDataAccessOperations objDAO, int insId, Properties objProperties) throws IOException {
        int i = 0;
        LineIterator it = FileUtils.lineIterator(new File(fileName), "UTF-8");
        List<String> dataList = new ArrayList<String>();
        try {
            while (it.hasNext()) {
                String line = it.nextLine();
                System.out.println("Line in file is " + line);
                i++;
                if (i > 1) {
                    dataList.add(line);
                }
                if (i == 101) {
                    break;
                }
            }
            objDAO.insertDatasetSampleRecords(dsList, dataList, insId, objProperties);
        } finally {
            LineIterator.closeQuietly(it);
        }

    }

    private String getFileName(Part part) {
        String fileName = "";
        for (String content : part.getHeader("content-disposition").split(";")) {
            if (content.trim().startsWith("filename")) {
                fileName = content.substring(content.indexOf("=") + 2, content.length() - 1);
                return appendDate(fileName);
            }
        }
        fileName = strDefaultFileName;
        return appendDate(fileName);
    }

    private String appendDate(String fileName) {
        logMessage("filename ;;; " + fileName);
        String[] arr = fileName.split("[.]");
        String strExt = arr[arr.length - 1];
        String strBaseName = "";
        for (int i = 0; i < arr.length - 1; i++) {
            strBaseName = strBaseName.concat(arr[i]);
        }
        fileName = strBaseName + "_" + simpleDateFormat.format(new Date()) + "." + strExt;
        return fileName;
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

    private static final String CLASS_NAME = FileUploadServlet.class.getSimpleName();

    private static void logMessage(Object obj) {
        System.out.println("[" + CLASS_NAME + "] <" + new Date() + "> <1.0> " + obj);
    }

    private static void logInfo(Object obj) {
        if (obj != null) {
            System.out.println("[" + CLASS_NAME + "][1.0]<" + new Date() + "> " + obj.toString());
        }
    }

}
