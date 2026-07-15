package com.smartpark.domain.retail.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.retail.entity.RetailItem;
import com.smartpark.domain.retail.repository.RetailItemRepository;
import com.smartpark.domain.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RetailService {

    private final RetailItemRepository retailItemRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public Page<RetailItem> findAll(Pageable pageable) {
        return retailItemRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public RetailItem findById(Long id) {
        return retailItemRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Sản phẩm không tồn tại: " + id));
    }

    @Transactional
    public RetailItem create(RetailItem retailItem) {
        if (retailItemRepository.findBySku(retailItem.getSku()).isPresent()) {
            throw new BusinessException("SKU '" + retailItem.getSku() + "' đã tồn tại.");
        }
        return retailItemRepository.save(retailItem);
    }

    @Transactional
    public RetailItem updateStock(Long id, Integer quantity) {
        return inventoryService.setStockFromLegacyApi(id, quantity);
    }
}
