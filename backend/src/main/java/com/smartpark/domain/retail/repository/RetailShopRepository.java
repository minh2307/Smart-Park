package com.smartpark.domain.retail.repository;

import com.smartpark.domain.retail.entity.RetailShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RetailShopRepository extends JpaRepository<RetailShop, Long> {
}
