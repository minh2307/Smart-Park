package com.gateos.module.venue.repository;

import com.gateos.module.venue.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);

    @Query("SELECT v FROM Venue v WHERE " +
           "(:search IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(v.address) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR v.status = :status)")
    Page<Venue> findAllWithFilter(
            @Param("search") String search,
            @Param("status") Venue.VenueStatus status,
            Pageable pageable);
}
