package ma.ensak.smartcampus.entity;

import ma.ensak.smartcampus.enums.StatutReservation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    boolean existsBySalleId(Long salleId);

    /** Nombre de réservations ayant ce statut qui chevauchent [debut, fin[ sur la salle. */
    @Query("select count(r) from Reservation r where r.salle.id = :salleId and r.statut = :statut "
            + "and r.dateDebut < :fin and r.dateFin > :debut")
    long compterChevauchements(@Param("salleId") Long salleId, @Param("statut") StatutReservation statut,
                               @Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    /** Ids des salles occupées sur le créneau. */
    @Query("select distinct r.salle.id from Reservation r where r.statut = :statut "
            + "and r.dateDebut < :fin and r.dateFin > :debut")
    List<Long> sallesOccupees(@Param("statut") StatutReservation statut,
                              @Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("select r from Reservation r where r.salle.id = :salleId and r.statut = :statut "
            + "and r.dateDebut < :fin and r.dateFin > :debut order by r.dateDebut")
    List<Reservation> creneaux(@Param("salleId") Long salleId, @Param("statut") StatutReservation statut,
                               @Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @EntityGraph(attributePaths = {"salle", "utilisateur"})
    List<Reservation> findByUtilisateurIdOrderByDateDebutDesc(Long utilisateurId);

    @EntityGraph(attributePaths = {"salle", "utilisateur"})
    List<Reservation> findByStatutOrderByDateDebutAsc(StatutReservation statut);
}