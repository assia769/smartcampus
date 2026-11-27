package ma.ensak.smartcampus.entity;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EquipementSalleRepository extends JpaRepository<EquipementSalle, Long> {
    Optional<EquipementSalle> findByIdAndSalleId(Long id, Long salleId);
    boolean existsBySalleIdAndNomIgnoreCase(Long salleId, String nom);
}