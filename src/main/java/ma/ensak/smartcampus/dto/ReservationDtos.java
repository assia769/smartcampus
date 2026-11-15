package ma.ensak.smartcampus.dto;

import jakarta.validation.constraints.*;
import ma.ensak.smartcampus.entity.Reservation;
import ma.ensak.smartcampus.enums.StatutReservation;
import ma.ensak.smartcampus.enums.TypeSalle;

import java.time.LocalDateTime;

public class ReservationDtos {

    public record ReservationRequest(
            @NotNull(message = "La salle est obligatoire") Long salleId,
            @NotNull(message = "La date et l'heure de début sont obligatoires") LocalDateTime dateDebut,
            @NotNull(message = "La durée est obligatoire")
            @Min(value = 30, message = "La durée minimale est de 30 minutes") Integer dureeMinutes,
            @Size(max = 500, message = "Le motif ne doit pas dépasser 500 caractères") String motif) {}

    public record RefusRequest(
            @NotBlank(message = "Le motif du refus est obligatoire")
            @Size(max = 500, message = "Le motif ne doit pas dépasser 500 caractères") String motif) {}

    public record CreneauResponse(LocalDateTime dateDebut, LocalDateTime dateFin) {}

    public record ReservationResponse(Long id, Long salleId, String salleNom, String batiment,
                                      TypeSalle typeSalle, LocalDateTime dateDebut, LocalDateTime dateFin,
                                      StatutReservation statut, String motif, String motifRefus,
                                      String demandeurNom, String demandeurEmail,
                                      LocalDateTime dateCreation, boolean conflit) {
        public static ReservationResponse from(Reservation r, boolean conflit) {
            return new ReservationResponse(r.getId(), r.getSalle().getId(), r.getSalle().getNom(),
                    r.getSalle().getBatiment(), r.getSalle().getType(), r.getDateDebut(), r.getDateFin(),
                    r.getStatut(), r.getMotif(), r.getMotifRefus(), r.getUtilisateur().getNom(),
                    r.getUtilisateur().getEmail(), r.getDateCreation(), conflit);
        }
    }
}