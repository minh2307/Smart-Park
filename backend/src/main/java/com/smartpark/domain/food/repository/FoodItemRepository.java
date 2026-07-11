package com.smartpark.domain.food.repository;

import com.smartpark.domain.food.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByFoodStallId(Long stallId);
    List<FoodItem> findByFoodStallIdAndStatus(Long stallId, FoodItem.FoodItemStatus status);
}
