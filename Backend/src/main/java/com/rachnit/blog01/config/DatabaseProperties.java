package com.rachnit.blog01.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.database")
public class DatabaseProperties {

    private boolean showSql = false;
    private boolean enableH2Console = false;
    private String ddlAuto = "validate";

    // Getters and setters
    public boolean isShowSql() { return showSql; }
    public void setShowSql(boolean showSql) { this.showSql = showSql; }
    
    public boolean isEnableH2Console() { return enableH2Console; }
    public void setEnableH2Console(boolean enableH2Console) { this.enableH2Console = enableH2Console; }
    
    public String getDdlAuto() { return ddlAuto; }
    public void setDdlAuto(String ddlAuto) { this.ddlAuto = ddlAuto; }
}