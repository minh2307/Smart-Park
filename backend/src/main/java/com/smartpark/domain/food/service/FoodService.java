package com.smartpark.domain.food.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.food.entity.FoodItem;
import com.smartpark.domain.food.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodItemRepository foodItemRepository;

    @Transactional(readOnly = true)
    public Page<FoodItem> findAll(Pageable pageable) {
        return foodItemRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public FoodItem findById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Món ăn không tồn tại: " + id));
    }

    @Transactional
    public FoodItem create(FoodItem foodItem) {
        return foodItemRepository.save(foodItem);
    }

    @Transactional
    public void softDelete(Long id) {
        FoodItem foodItem = findById(id);
        foodItem.setStatus(FoodItem.FoodItemStatus.UNAVAILABLE);
        foodItemRepository.save(foodItem);
    }
}
