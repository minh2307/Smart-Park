package com.smartpark.domain.park.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.park.repository.ParkRepository;
import com.smartpark.domain.park.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParkService {

    private final ParkRepository parkRepository;
    private final ZoneRepository zoneRepository;

    @Transactional(readOnly = true)
    public Page<Park> findAllParks(Pageable pageable) {
        return parkRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Park findParkById(Long id) {
        return parkRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Công viên không tồn tại: " + id));
    }

    @Transactional
    public Park createPark(Park park) {
        if (parkRepository.existsByCode(park.getCode())) {
            throw new BusinessException("Mã công viên '" + park.getCode() + "' đã tồn tại.");
        }
        return parkRepository.save(park);
    }

    @Transactional
    public Park updatePark(Long id, Park updated) {
        Park existing = findParkById(id);
        existing.setName(updated.getName());
        existing.setAddress(updated.getAddress());
        existing.setDescription(updated.getDescription());
        existing.setMaxCapacity(updated.getMaxCapacity());
        existing.setOpenTime(updated.getOpenTime());
        existing.setCloseTime(updated.getCloseTime());
        return parkRepository.save(existing);
    }

    @Transactional
    public void softDeletePark(Long id) {
        Park park = findParkById(id);
        park.setStatus(Park.ParkStatus.CLOSED);
        parkRepository.save(park);
    }

    @Transactional(readOnly = true)
    public List<Zone> findZonesByPark(Long parkId) {
        return zoneRepository.findByParkId(parkId);
    }

    @Transactional
    public Zone createZone(Long parkId, Zone zone) {
        Park park = findParkById(parkId);
        if (zoneRepository.existsByCode(zone.getCode())) {
            throw new BusinessException("Mã khu vực '" + zone.getCode() + "' đã tồn tại.");
        }
        zone.setPark(park);
        return zoneRepository.save(zone);
    }
}
