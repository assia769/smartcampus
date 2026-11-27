package ma.ensak.smartcampus.entity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

public interface SalleRepository extends JpaRepository<Salle, Long> {
    List<Salle> findAllByOrderByBatimentAscNomAsc();
    boolean existsByNomIgnoreCaseAndBatimentIgnoreCase(String nom, String batiment);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Salle s where s.id = :id")
    Optional<Salle> findByIdForUpdate(@Param("id") Long id);
}