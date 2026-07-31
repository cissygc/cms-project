package com.example.dto.dashboard;

import com.example.dto.post.PostResponseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalPosts;
    private long totalMedia;
    private long totalUsers; // sadece ADMIN için doldurulur, editör için 0 döner
    private List<PostResponseDto> recentPosts;
}
