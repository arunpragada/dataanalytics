package amn.analytics.input;

/**
 *
 * @author nmorla
 */
public class DatasetBean {

    private String datasetFileName;
    private long id;
    private String datasetPath;
    private String hdfsPath;
    private String status;
    private String supportnotes;
    private String controlFileName;
    private String controlFilePath;
    private String title;

    public String getControlFileName() {
        return controlFileName;
    }

    public void setControlFileName(String controlFileName) {
        this.controlFileName = controlFileName;
    }

    public String getControlFilePath() {
        return controlFilePath;
    }

    public void setControlFilePath(String controlFilePath) {
        this.controlFilePath = controlFilePath;
    }

    public String getDatasetFileName() {
        return datasetFileName;
    }

    public void setDatasetFileName(String datasetFileName) {
        this.datasetFileName = datasetFileName;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getDatasetPath() {
        return datasetPath;
    }

    public void setDatasetPath(String datasetPath) {
        this.datasetPath = datasetPath;
    }

    public String getHdfsPath() {
        return hdfsPath;
    }

    public void setHdfsPath(String hdfsPath) {
        this.hdfsPath = hdfsPath;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSupportnotes() {
        return supportnotes;
    }

    public void setSupportnotes(String supportnotes) {
        this.supportnotes = supportnotes;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @Override
    public String toString() {
        return "{Title:" + getTitle() + ",FileName:" + getDatasetFileName() + ", Edge Node Path:" + getDatasetPath() + ", HDFS Path:" + getHdfsPath() + ", Status:" + getStatus() + "}";
    }

}
