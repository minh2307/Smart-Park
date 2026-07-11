package com.smartpark.domain.retail.repository;

import com.smartpark.domain.retail.entity.RetailItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RetailItemRepository extends JpaRepository<RetailItem, Long> {
    Optional<RetailItem> findBySku(String sku);
    List<RetailItem> findByRetailShopId(Long shopId);
}
