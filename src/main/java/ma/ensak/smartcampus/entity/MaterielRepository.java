package ma.ensak.smartcampus.entity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterielRepository extends JpaRepository<Materiel, Long> {
    List<Materiel> findAllByOrderByDesignationAsc();
    List<Materiel> findByDesignationContainingIgnoreCaseOrderByDesignationAsc(String q);
    boolean existsByDesignationIgnoreCase(String designation);
}