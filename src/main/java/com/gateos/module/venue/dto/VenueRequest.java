package com.gateos.module.venue.dto;

import com.gateos.module.venue.entity.Venue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VenueRequest {

    @NotBlank(message = "Tên địa điểm không được để trống")
    @Size(min = 5, max = 100, message = "Tên địa điểm phải từ 5-100 ký tự")
    private String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    private String description;

    private Venue.VenueStatus status = Venue.VenueStatus.ACTIVE;
}
