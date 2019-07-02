package amn.analytics.common;

import java.io.Serializable;
import java.util.ArrayList;

/**
 *
 * @author nmorla
 */
public class MenuItem implements Serializable {

    private long id;
    private String displayName;
    private ArrayList<MenuItem> childs = new ArrayList<MenuItem>();
    private String model;
    private String view;
    private String style;
    private String menuType;
    private int menuDepth;
    private long menuOrder;
    private long parentMenu;
    private String icon;
    private boolean containsChild;

    public long getId() {
        return id;
    }

    public void addChild(MenuItem item) {
        childs.add(item);
    }

    public void setId(long id) {
        this.id = id;
    }

    public boolean isContainsChild() {
        return childs.size() > 0;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public ArrayList<MenuItem> getChilds() {
        return childs;
    }

    public void setChilds(ArrayList<MenuItem> childs) {
        this.childs = childs;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getView() {
        return view;
    }

    public void setView(String view) {
        this.view = view;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

    public long getMenuOrder() {
        return menuOrder;
    }

    public void setMenuOrder(long menuOrder) {
        this.menuOrder = menuOrder;
    }

    public long getParentMenu() {
        return parentMenu;
    }

    public void setParentMenu(long parentMenu) {
        this.parentMenu = parentMenu;
    }

    public String getMenuType() {
        return menuType;
    }

    public void setMenuType(String menuType) {
        this.menuType = menuType;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public int getMenuDepth() {
        return menuDepth;
    }

    public void setMenuDepth(int menuDepth) {
        this.menuDepth = menuDepth;
    }

    @Override
    public String toString() {
        return "{ID:" + getId() + ", Display Name:" + getDisplayName() + ", Order:" + getMenuOrder() + ", Parent:" + getParentMenu() + ", Menu Type:" + getMenuType() + ", Childred:" + getChilds() + "}";
    }

}
