/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package amn.analytics.input;

/**
 *
 * @author pc
 */
public class DatasetSchemaBean {
    
    int colOrder;
    int datasetId;
    String colName;
    String colDataType;
    String colDefaultVal;
    String colMandatory;

    public int getDatasetId() {
        return datasetId;
    }

    public void setDatasetId(int datasetId) {
        this.datasetId = datasetId;
    }

    
    public int getColOrder() {
        return colOrder;
    }

    public void setColOrder(int colOrder) {
        this.colOrder = colOrder;
    }

    public String getColName() {
        return colName;
    }

    public void setColName(String colName) {
        this.colName = colName;
    }

    public String getColDataType() {
        return colDataType;
    }

    public void setColDataType(String colDataType) {
        this.colDataType = colDataType;
    }

    public String getColDefaultVal() {
        return colDefaultVal;
    }

    public void setColDefaultVal(String colDefaultVal) {
        this.colDefaultVal = colDefaultVal;
    }

    public String getColMandatory() {
        return colMandatory;
    }

    public void setColMandatory(String colMandatory) {
        this.colMandatory = colMandatory;
    }
    
    
    
}
