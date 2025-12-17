package com.rmp.config;

import com.rmp.scheduler.DailyReportJob;
import com.rmp.scheduler.WeeklyReportJob;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuartzConfig {

    @Value("${app.scheduler.daily-report.enabled:true}")
    private boolean dailyReportEnabled;

    @Value("${app.scheduler.daily-report.cron:0 0 8 * * ?}")
    private String dailyReportCron;

    @Value("${app.scheduler.weekly-report.enabled:true}")
    private boolean weeklyReportEnabled;

    @Value("${app.scheduler.weekly-report.cron:0 0 9 ? * MON}")
    private String weeklyReportCron;

    // ==================== DAILY REPORT JOB ====================
    
    @Bean
    public JobDetail dailyReportJobDetail() {
        return JobBuilder.newJob(DailyReportJob.class)
                .withIdentity("dailyReportJob", "reportJobs")
                .withDescription("Daily summary report sent to admins")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger dailyReportTrigger() {
        if (!dailyReportEnabled) {
            // Return a trigger that never fires
            return TriggerBuilder.newTrigger()
                    .withIdentity("dailyReportTrigger", "reportTriggers")
                    .forJob(dailyReportJobDetail())
                    .startAt(DateBuilder.futureDate(100, DateBuilder.IntervalUnit.YEAR))
                    .build();
        }
        
        return TriggerBuilder.newTrigger()
                .withIdentity("dailyReportTrigger", "reportTriggers")
                .withDescription("Triggers daily report at 8 AM every day")
                .forJob(dailyReportJobDetail())
                .withSchedule(CronScheduleBuilder
                        .cronSchedule(dailyReportCron)
                        .withMisfireHandlingInstructionFireAndProceed())
                .build();
    }

    // ==================== WEEKLY REPORT JOB ====================
    
    @Bean
    public JobDetail weeklyReportJobDetail() {
        return JobBuilder.newJob(WeeklyReportJob.class)
                .withIdentity("weeklyReportJob", "reportJobs")
                .withDescription("Weekly summary report sent to admins")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger weeklyReportTrigger() {
        if (!weeklyReportEnabled) {
            // Return a trigger that never fires
            return TriggerBuilder.newTrigger()
                    .withIdentity("weeklyReportTrigger", "reportTriggers")
                    .forJob(weeklyReportJobDetail())
                    .startAt(DateBuilder.futureDate(100, DateBuilder.IntervalUnit.YEAR))
                    .build();
        }
        
        return TriggerBuilder.newTrigger()
                .withIdentity("weeklyReportTrigger", "reportTriggers")
                .withDescription("Triggers weekly report at 9 AM every Monday")
                .forJob(weeklyReportJobDetail())
                .withSchedule(CronScheduleBuilder
                        .cronSchedule(weeklyReportCron)
                        .withMisfireHandlingInstructionFireAndProceed())
                .build();
    }
}


