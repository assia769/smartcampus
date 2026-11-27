package ma.ensak.smartcampus.reservation;

import jakarta.validation.Valid;
import ma.ensak.smartcampus.dto.ReservationDtos.*;
import ma.ensak.smartcampus.dto.SalleDtos.SalleResponse;
import ma.ensak.smartcampus.enums.TypeSalle;
import ma.ensak.smartcampus.service.ServiceReservation;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ServiceReservation service;

    public ReservationController(ServiceReservation service) {
        this.service = service;
    }

    // ----- Étudiant / enseignant / admin -----

    @PostMapping
    @PreAuthorize("hasAnyRole('ETUDIANT','ENSEIGNANT','ADMIN')")
    public ResponseEntity<ReservationResponse> creer(Authentication auth, @Valid @RequestBody ReservationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.creer(auth.getName(), req));
    }

    @GetMapping("/mes")
    @PreAuthorize("hasAnyRole('ETUDIANT','ENSEIGNANT','ADMIN')")
    public List<ReservationResponse> mes(Authentication auth) {
        return service.mes(auth.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ETUDIANT','ENSEIGNANT','ADMIN')")
    public ReservationResponse annuler(Authentication auth, @PathVariable Long id) {
        return service.annuler(auth.getName(), id);
    }

    // ----- Consultation : tout utilisateur connecté -----

    @GetMapping("/disponibles")
    public List<SalleResponse> disponibles(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam int dureeMinutes,
            @RequestParam(required = false) TypeSalle type,
            @RequestParam(required = false) Integer capaciteMin) {
        return service.disponibles(debut, dureeMinutes, type, capaciteMin);
    }

    @GetMapping("/suggestions")
    public List<SalleResponse> suggestions(
            @RequestParam Long salleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam int dureeMinutes) {
        return service.suggestions(salleId, debut, dureeMinutes);
    }

    @GetMapping("/salle/{salleId}/calendrier")
    public List<CreneauResponse> calendrier(
            @PathVariable Long salleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate semaine) {
        return service.calendrier(salleId, semaine);
    }

    // ----- Admin : validation des amphis -----

    @GetMapping("/en-attente")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReservationResponse> enAttente() {
        return service.enAttente();
    }

    @PostMapping("/{id}/valider")
    @PreAuthorize("hasRole('ADMIN')")
    public ReservationResponse valider(Authentication auth, @PathVariable Long id) {
        return service.valider(auth.getName(), id);
    }

    @PostMapping("/{id}/refuser")
    @PreAuthorize("hasRole('ADMIN')")
    public ReservationResponse refuser(Authentication auth, @PathVariable Long id,
                                       @Valid @RequestBody RefusRequest req) {
        return service.refuser(auth.getName(), id, req.motif());
    }
}