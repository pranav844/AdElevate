package com.adelevate.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.adelevate.entities.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
