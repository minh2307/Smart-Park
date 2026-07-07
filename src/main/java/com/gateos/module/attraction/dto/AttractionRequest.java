package com.gateos.module.attraction.dto;

import com.gateos.module.attraction.entity.Attraction;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AttractionRequest {

    @NotNull(message = "Venue ID không được để trống")
    private Long venueId;

    @NotBlank(message = "Tên trò chơi không được để trống")
    @Size(min = 3, max = 100, message = "Tên trò chơi phải từ 3-100 ký tự")
    private String name;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa phải lớn hơn 0")
    private Integer capacity;

    private String description;

    private Attraction.AttractionStatus status = Attraction.AttractionStatus.ACTIVE;
}
