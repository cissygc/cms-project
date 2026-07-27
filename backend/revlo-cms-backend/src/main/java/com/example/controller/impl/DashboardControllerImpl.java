package com.example.controller.impl;

import com.example.controller.IDashboardController;
import com.example.dto.dashboard.DashboardStatsDto;
import com.example.service.IDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardControllerImpl implements IDashboardController {

    private final IDashboardService dashboardService;

    public DashboardControllerImpl(IDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ADMIN"));
    }

    @Override
    public ResponseEntity<?> getStats(Authentication authentication) {
        DashboardStatsDto stats = dashboardService.getStats(authentication.getName(), isAdmin(authentication));
        return ResponseEntity.ok(stats);
    }
}
