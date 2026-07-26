package com.example.service;

import com.example.dto.dashboard.DashboardStatsDto;

public interface IDashboardService {
    DashboardStatsDto getStats(String username, boolean isAdmin);
}
