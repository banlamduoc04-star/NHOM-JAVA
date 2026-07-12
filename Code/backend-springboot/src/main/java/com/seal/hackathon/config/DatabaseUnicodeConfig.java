package com.seal.hackathon.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

@Configuration
public class DatabaseUnicodeConfig {

    @Bean
    @Order(0)
    CommandLineRunner sqlServerUnicodeColumns(JdbcTemplate jdbcTemplate) {
        return args -> {
            String databaseProduct = jdbcTemplate.execute(
                    (ConnectionCallback<String>) connection ->
                            connection.getMetaData().getDatabaseProductName()
            );

            if (databaseProduct == null
                    || !databaseProduct.toLowerCase().contains("sql server")) {
                return;
            }

            List<String> statements = List.of(
                    alterColumn("announcements", "targetRole", "NVARCHAR(30)", false),
                    alterColumn("announcements", "title", "NVARCHAR(200)", false),
                    alterColumn("announcements", "content", "NVARCHAR(2000)", false),

                    alterColumn("app_users", "fullName", "NVARCHAR(100)", false),
                    alterColumn("app_users", "universityName", "NVARCHAR(200)", true),

                    alterColumn("audit_logs", "actionName", "NVARCHAR(100)", false),
                    alterColumn("audit_logs", "entityName", "NVARCHAR(100)", false),
                    alterColumn("audit_logs", "oldValue", "NVARCHAR(2000)", true),
                    alterColumn("audit_logs", "newValue", "NVARCHAR(2000)", true),

                    alterColumn("criterion_templates", "templateName", "NVARCHAR(150)", false),
                    alterColumn("criterion_templates", "description", "NVARCHAR(1000)", true),

                    alterColumn(
                            "criterion_template_items",
                            "criterionName",
                            "NVARCHAR(150)",
                            false
                    ),

                    alterColumn(
                            "event_criteria",
                            "criterionName",
                            "NVARCHAR(150)",
                            false
                    ),
                    alterColumn(
                            "event_criteria",
                            "description",
                            "NVARCHAR(1000)",
                            true
                    ),

                    alterColumn("hackathon_events", "eventName", "NVARCHAR(150)", false),
                    alterColumn("hackathon_events", "description", "NVARCHAR(2000)", true),

                    alterColumn("hackathon_rounds", "roundName", "NVARCHAR(150)", false),

                    alterColumn("prizes", "prizeName", "NVARCHAR(150)", false),
                    alterColumn("prizes", "description", "NVARCHAR(1000)", true),

                    alterColumn("round_results", "reason", "NVARCHAR(1000)", true),

                    alterColumn("scores", "comment", "NVARCHAR(1000)", true),

                    alterColumn(
                            "submissions",
                            "eliminationReason",
                            "NVARCHAR(1000)",
                            true
                    ),

                    alterColumn("teams", "teamName", "NVARCHAR(150)", false),

                    alterColumn("tracks", "trackName", "NVARCHAR(150)", false),
                    alterColumn("tracks", "description", "NVARCHAR(1000)", true)
            );

            for (String sql : statements) {
                try {
                    jdbcTemplate.execute(sql);
                } catch (Exception ignored) {
                    // Keep the application booting even if an existing SQL Server constraint blocks one column.
                }
            }
        };
    }

    private String alterColumn(
            String table,
            String column,
            String sqlType,
            boolean nullable
    ) {
        return "IF OBJECT_ID(N'" + table + "', N'U') IS NOT NULL "
                + "AND COL_LENGTH(N'" + table + "', N'" + column + "') IS NOT NULL "
                + "BEGIN ALTER TABLE [" + table + "] ALTER COLUMN [" + column + "] "
                + sqlType
                + (nullable ? " NULL" : " NOT NULL")
                + " END";
    }
}