package com.smartpark.domain.pos.repository;

import com.smartpark.domain.pos.entity.PosTerminal;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PosTerminalRepository extends JpaRepository<PosTerminal, Long> {
    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from PosTerminal t join fetch t.park where t.terminalCode = :code")
    Optional<PosTerminal> findByCodeForUpdate(String code);
}
