package com.smartpark.domain.park.controller;

import com.smartpark.common.response.ApiResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ai/recommendation")
public class AiRecommendationController {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationDto {
        private Long id;
        private String title;
        private String category;
        private String image;
        private Integer matchScore;
        private List<String> tags;
    }

    @GetMapping("/attractions")
    public ResponseEntity<ApiResponse<List<RecommendationDto>>> getRecommendedAttractions(
            @RequestParam(required = false, defaultValue = "All") String category) {
        
        List<RecommendationDto> recommendations = Arrays.asList(
                new RecommendationDto(
                        1L,
                        "Hố Đen Vũ Trụ (Black Hole)",
                        "Thrill",
                        "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80",
                        98,
                        Arrays.asList("Tốc độ cao", "Cảm giác mạnh", "Ngoài trời")
                ),
                new RecommendationDto(
                        2L,
                        "Bể Tạo Sóng Đầm Sen",
                        "Water",
                        "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80",
                        95,
                        Arrays.asList("Thư giãn", "Ướt nước", "Bể bơi")
                ),
                new RecommendationDto(
                        3L,
                        "Tàu Lượn Siêu Tốc Rồng Bay",
                        "Thrill",
                        "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80",
                        92,
                        Arrays.asList("Vòng lượn", "Ngoài trời", "Cực đại")
                ),
                new RecommendationDto(
                        4L,
                        "Fantasy Kid Zone",
                        "Kids",
                        "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80",
                        89,
                        Arrays.asList("Trẻ em", "Trong nhà", "An toàn")
                )
        );

        if (!"All".equalsIgnoreCase(category)) {
            recommendations = recommendations.stream()
                    .filter(r -> r.getCategory().equalsIgnoreCase(category))
                    .toList();
        }

        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<RecommendationDto>>> getRecommendedTickets() {
        List<RecommendationDto> recommendations = Arrays.asList(
                new RecommendationDto(
                        101L,
                        "VIP Express Pass Đầm Sen",
                        "VIP",
                        "",
                        99,
                        Arrays.asList("Ưu tiên hàng chờ", "Lounge VIP", "Show diễn VIP")
                ),
                new RecommendationDto(
                        102L,
                        "Vé Trọn Gói Tiêu Chuẩn",
                        "Family",
                        "",
                        94,
                        Arrays.asList("Tiết kiệm", "Tất cả trò chơi", "Quét QR vào cổng")
                )
        );
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    @GetMapping("/combo")
    public ResponseEntity<ApiResponse<List<RecommendationDto>>> getRecommendedCombos() {
        List<RecommendationDto> recommendations = Arrays.asList(
                new RecommendationDto(
                        201L,
                        "Combo All-In-One Đầm Sen",
                        "Family",
                        "",
                        97,
                        Arrays.asList("Vé standard", "Voucher ăn trưa 150k", "Nước uống miễn phí")
                )
        );
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }
}
