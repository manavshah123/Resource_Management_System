package com.wishtree.rmp.scheduler;

import com.wishtree.rmp.dto.AllocationDto;
import com.wishtree.rmp.service.AllocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Scheduled jobs for allocation management.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AllocationScheduler {

    private final AllocationService allocationService;

    /**
     * Check for upcoming deallocations daily at 9 AM.
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void checkUpcomingDeallocations() {
        log.info("Running scheduled job: checkUpcomingDeallocations");
        
        List<AllocationDto> upcomingDeallocations = allocationService.getUpcomingDeallocations(7);
        
        if (!upcomingDeallocations.isEmpty()) {
            log.info("Found {} allocations ending within 7 days", upcomingDeallocations.size());
            
            for (AllocationDto allocation : upcomingDeallocations) {
                log.info("Upcoming deallocation: {} from {} ending on {}",
                        allocation.getEmployeeName(),
                        allocation.getProjectName(),
                        allocation.getEndDate());
                // Here you could send notifications via email/Slack
            }
        }
    }

    /**
     * Check for overallocated employees daily at 10 AM.
     */
    @Scheduled(cron = "0 0 10 * * ?")
    public void checkOverallocations() {
        log.info("Running scheduled job: checkOverallocations");
        
        List<Long> overallocatedIds = allocationService.getOverallocatedEmployeeIds();
        
        if (!overallocatedIds.isEmpty()) {
            log.warn("Found {} overallocated employees", overallocatedIds.size());
            // Here you could send alerts to managers
        }
    }

    /**
     * Weekly utilization report - Every Monday at 8 AM.
     */
    @Scheduled(cron = "0 0 8 ? * MON")
    public void generateWeeklyUtilizationReport() {
        log.info("Running scheduled job: generateWeeklyUtilizationReport");
        // Implementation for generating and sending weekly reports
    }
}

