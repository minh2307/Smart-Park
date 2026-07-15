package com.smartpark.domain.retail.repository;

import com.smartpark.domain.retail.entity.RetailItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RetailItemRepository extends JpaRepository<RetailItem, Long>, JpaSpecificationExecutor<RetailItem> {
    Optional<RetailItem> findBySku(String sku);
    List<RetailItem> findByRetailShopId(Long shopId);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from RetailItem i join fetch i.retailShop s join fetch s.park where i.sku = :sku")
    Optional<RetailItem> findBySkuForUpdate(String sku);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from RetailItem i join fetch i.retailShop s join fetch s.park where i.id = :id")
    Optional<RetailItem> findByIdForUpdate(Long id);
}
