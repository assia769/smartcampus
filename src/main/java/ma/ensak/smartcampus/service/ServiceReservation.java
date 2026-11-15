package ma.ensak.smartcampus.service;

import ma.ensak.smartcampus.dto.ReservationDtos.*;
import ma.ensak.smartcampus.dto.SalleDtos.SalleResponse;
import ma.ensak.smartcampus.entity.*;
import ma.ensak.smartcampus.enums.EtatSalle;
import ma.ensak.smartcampus.enums.Role;
import ma.ensak.smartcampus.enums.StatutReservation;
import ma.ensak.smartcampus.enums.TypeSalle;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ServiceReservation {

    private static final LocalTime OUVERTURE = LocalTime.of(8, 0);
    private static final LocalTime FERMETURE = LocalTime.of(20, 0);
    private static final int DUREE_MIN = 30;

    private final ReservationRepository reservations;
    private final SalleRepository salles;
    private final UserRepository users;
    private final int dureeMaxMinutes;

    public ServiceReservation(ReservationRepository reservations, SalleRepository salles,
                              UserRepository users,
                              @Value("${app.reservation.duree-max-minutes:240}") int dureeMaxMinutes) {
        this.reservations = reservations;
        this.salles = salles;
        this.users = users;
        this.dureeMaxMinutes = dureeMaxMinutes;
    }

    // ---------- Réserver ----------

    @Transactional
    public ReservationResponse creer(String email, ReservationRequest req) {
        User u = utilisateur(email);
        LocalDateTime debut = req.dateDebut();
        LocalDateTime fin = debut.plusMinutes(req.dureeMinutes());
        validerCreneau(debut, req.dureeMinutes());

        // Verrou sur la salle : sérialise les réservations simultanées de la même salle
        Salle s = salles.findByIdForUpdate(req.salleId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable"));
        if (s.getEtat() == EtatSalle.HORS_SERVICE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Salle hors service");
        }

        boolean amphi = s.getType() == TypeSalle.AMPHITHEATRE;
        if (amphi && u.getRole() != Role.ADMIN && (req.motif() == null || req.motif().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le motif est obligatoire pour un amphithéâtre");
        }

        if (reservations.compterChevauchements(s.getId(), StatutReservation.CONFIRMEE, debut, fin) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Créneau déjà réservé");
        }

        Reservation r = new Reservation();
        r.setUtilisateur(u);
        r.setSalle(s);
        r.setDateDebut(debut);
        r.setDateFin(fin);
        r.setMotif(req.motif() == null || req.motif().isBlank() ? null : req.motif().trim());
        // Amphi demandé par un non-admin : en attente de validation. Sinon : confirmée directement.
        boolean validationRequise = amphi && u.getRole() != Role.ADMIN;
        r.setStatut(validationRequise ? StatutReservation.EN_ATTENTE : StatutReservation.CONFIRMEE);
        return ReservationResponse.from(reservations.save(r), false);
    }

    // ---------- Consultation ----------

    @Transactional(readOnly = true)
    public List<ReservationResponse> mes(String email) {
        User u = utilisateur(email);
        return reservations.findByUtilisateurIdOrderByDateDebutDesc(u.getId()).stream()
                .map(r -> ReservationResponse.from(r, false)).toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> enAttente() {
        return reservations.findByStatutOrderByDateDebutAsc(StatutReservation.EN_ATTENTE).stream()
                .map(r -> ReservationResponse.from(r, reservations.compterChevauchements(
                        r.getSalle().getId(), StatutReservation.CONFIRMEE, r.getDateDebut(), r.getDateFin()) > 0))
                .toList();
    }

    /** Salles libres sur un créneau (état DISPONIBLE et aucune réservation confirmée qui chevauche). */
    @Transactional(readOnly = true)
    public List<SalleResponse> disponibles(LocalDateTime debut, int dureeMinutes, TypeSalle type, Integer capaciteMin) {
        validerCreneau(debut, dureeMinutes);
        return libres(debut, dureeMinutes, type, capaciteMin).stream().map(SalleResponse::from).toList();
    }

    /** Salles équivalentes (même type, capacité suffisante, équipements proches) si la salle choisie est prise. */
    @Transactional(readOnly = true)
    public List<SalleResponse> suggestions(Long salleId, LocalDateTime debut, int dureeMinutes) {
        validerCreneau(debut, dureeMinutes);
        Salle cible = salles.findById(salleId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable"));
        Set<String> noms = cible.getEquipements().stream()
                .map(e -> e.getNom().toLowerCase()).collect(Collectors.toSet());
        return libres(debut, dureeMinutes, cible.getType(), cible.getCapacite()).stream()
                .filter(s -> !s.getId().equals(salleId))
                .sorted(Comparator
                        .comparingLong((Salle x) -> -x.getEquipements().stream()
                                .filter(e -> noms.contains(e.getNom().toLowerCase())).count())
                        .thenComparing(Salle::getCapacite))
                .limit(5)
                .map(SalleResponse::from).toList();
    }

    /** Créneaux occupés d'une salle sur la semaine commençant à la date donnée. */
    @Transactional(readOnly = true)
    public List<CreneauResponse> calendrier(Long salleId, LocalDate debutSemaine) {
        LocalDateTime debut = debutSemaine.atStartOfDay();
        return reservations.creneaux(salleId, StatutReservation.CONFIRMEE, debut, debut.plusDays(7)).stream()
                .map(r -> new CreneauResponse(r.getDateDebut(), r.getDateFin())).toList();
    }

    // ---------- Annuler ----------

    @Transactional
    public ReservationResponse annuler(String email, Long id) {
        User u = utilisateur(email);
        Reservation r = trouver(id);
        if (!r.getUtilisateur().getId().equals(u.getId()) && u.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        }
        if (r.getStatut() != StatutReservation.CONFIRMEE && r.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette réservation ne peut plus être annulée");
        }
        if (!r.getDateDebut().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Annulation impossible : la réservation a déjà commencé");
        }
        r.setStatut(StatutReservation.ANNULEE);
        r.setDateAnnulation(LocalDateTime.now());
        return ReservationResponse.from(reservations.save(r), false);
    }

    // ---------- Validation des amphis (admin) ----------

    @Transactional
    public ReservationResponse valider(String emailAdmin, Long id) {
        User admin = utilisateur(emailAdmin);
        Reservation r = trouver(id);
        salles.findByIdForUpdate(r.getSalle().getId()); // même verrou que la création
        if (r.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette demande a déjà été traitée");
        }
        if (r.getSalle().getEtat() == EtatSalle.HORS_SERVICE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Salle hors service");
        }
        if (!r.getDateDebut().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La date de cette demande est déjà passée");
        }
        if (reservations.compterChevauchements(r.getSalle().getId(), StatutReservation.CONFIRMEE,
                r.getDateDebut(), r.getDateFin()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Conflit : une réservation confirmée existe déjà sur ce créneau");
        }
        r.setStatut(StatutReservation.CONFIRMEE);
        r.setDecideur(admin);
        r.setDateDecision(LocalDateTime.now());
        return ReservationResponse.from(reservations.save(r), false);
    }

    @Transactional
    public ReservationResponse refuser(String emailAdmin, Long id, String motif) {
        User admin = utilisateur(emailAdmin);
        Reservation r = trouver(id);
        if (r.getStatut() != StatutReservation.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette demande a déjà été traitée");
        }
        r.setStatut(StatutReservation.REFUSEE);
        r.setMotifRefus(motif.trim());
        r.setDecideur(admin);
        r.setDateDecision(LocalDateTime.now());
        return ReservationResponse.from(reservations.save(r), false);
    }

    // ---------- Utilitaires ----------

    private List<Salle> libres(LocalDateTime debut, int dureeMinutes, TypeSalle type, Integer capaciteMin) {
        Set<Long> occupees = new HashSet<>(reservations.sallesOccupees(
                StatutReservation.CONFIRMEE, debut, debut.plusMinutes(dureeMinutes)));
        return salles.findAllByOrderByBatimentAscNomAsc().stream()
                .filter(s -> s.getEtat() == EtatSalle.DISPONIBLE)
                .filter(s -> !occupees.contains(s.getId()))
                .filter(s -> type == null || s.getType() == type)
                .filter(s -> capaciteMin == null || s.getCapacite() >= capaciteMin)
                .toList();
    }

    private void validerCreneau(LocalDateTime debut, int dureeMinutes) {
        if (debut == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date de début obligatoire");
        if (dureeMinutes < DUREE_MIN || dureeMinutes > dureeMaxMinutes) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La durée doit être comprise entre " + DUREE_MIN + " et " + dureeMaxMinutes + " minutes");
        }
        if (!debut.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le créneau doit être dans le futur");
        }
        LocalDateTime fin = debut.plusMinutes(dureeMinutes);
        if (!fin.toLocalDate().equals(debut.toLocalDate())
                || debut.toLocalTime().isBefore(OUVERTURE) || fin.toLocalTime().isAfter(FERMETURE)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Les réservations sont possibles de 08:00 à 20:00 le même jour");
        }
    }

    private User utilisateur(String email) {
        return users.findByEmail(email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
    }

    private Reservation trouver(Long id) {
        return reservations.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));
    }
}