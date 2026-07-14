package com.smartpark.domain.ride.repository;

import com.smartpark.domain.ride.entity.RideCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RideCategoryRepository extends JpaRepository<RideCategory, Long> {
}
