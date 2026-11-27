package ma.ensak.smartcampus.service;

import ma.ensak.smartcampus.dto.SalleDtos.*;
import ma.ensak.smartcampus.entity.*;
import ma.ensak.smartcampus.enums.EtatSalle;
import ma.ensak.smartcampus.enums.TypeSalle;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ServiceSalle {

    private final SalleRepository salles;
    private final EquipementSalleRepository equipements;
    private final ReservationRepository reservations;

    public ServiceSalle(SalleRepository salles, EquipementSalleRepository equipements,
                        ReservationRepository reservations) {
        this.salles = salles;
        this.equipements = equipements;
        this.reservations = reservations;
    }

    // ---------- Salles ----------

    @Transactional(readOnly = true)
    public List<SalleResponse> lister(String q, String batiment, Integer capaciteMin,
                                      TypeSalle type, String equipement) {
        return salles.findAllByOrderByBatimentAscNomAsc().stream()
                .filter(s -> vide(q) || contient(s.getNom(), q) || contient(s.getBatiment(), q))
                .filter(s -> vide(batiment) || s.getBatiment().equalsIgnoreCase(batiment.trim()))
                .filter(s -> capaciteMin == null || s.getCapacite() >= capaciteMin)
                .filter(s -> type == null || s.getType() == type)
                .filter(s -> vide(equipement) || s.getEquipements().stream()
                        .anyMatch(e -> contient(e.getNom(), equipement)))
                .map(SalleResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SalleResponse obtenir(Long id) {
        return SalleResponse.from(trouver(id));
    }

    @Transactional
    public SalleResponse creer(SalleRequest req) {
        String nom = req.nom().trim();
        String batiment = req.batiment().trim();
        if (salles.existsByNomIgnoreCaseAndBatimentIgnoreCase(nom, batiment)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette salle existe déjà dans ce bâtiment");
        }
        Salle s = new Salle();
        appliquer(s, req);
        s.setEtat(req.etat() != null ? req.etat() : EtatSalle.DISPONIBLE);
        return SalleResponse.from(salles.save(s));
    }

    @Transactional
    public SalleResponse modifier(Long id, SalleRequest req) {
        Salle s = trouver(id);
        String nom = req.nom().trim();
        String batiment = req.batiment().trim();
        boolean identiteChangee = !s.getNom().equalsIgnoreCase(nom) || !s.getBatiment().equalsIgnoreCase(batiment);
        if (identiteChangee && salles.existsByNomIgnoreCaseAndBatimentIgnoreCase(nom, batiment)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette salle existe déjà dans ce bâtiment");
        }
        appliquer(s, req);
        if (req.etat() != null) s.setEtat(req.etat());
        return SalleResponse.from(salles.save(s));
    }

    /** Une salle avec historique n'est jamais supprimée : on la passe HORS_SERVICE. */
    @Transactional
    public void supprimer(Long id) {
        Salle s = trouver(id);
        if (reservations.existsBySalleId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Suppression impossible : cette salle a des réservations. "
                            + "Passez-la à l'état HORS_SERVICE pour conserver l'historique.");
        }
        salles.delete(s); // les équipements sont supprimés en cascade
    }

    // ---------- Équipements ----------

    @Transactional
    public EquipementResponse ajouterEquipement(Long salleId, EquipementRequest req) {
        Salle s = trouver(salleId);
        String nom = req.nom().trim();
        if (equipements.existsBySalleIdAndNomIgnoreCase(salleId, nom)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet équipement existe déjà dans cette salle");
        }
        EquipementSalle e = new EquipementSalle(nom, req.etat(), nettoyer(req.description()), s);
        return EquipementResponse.from(equipements.save(e));
    }

    @Transactional
    public EquipementResponse modifierEquipement(Long salleId, Long equipementId, EquipementRequest req) {
        EquipementSalle e = trouverEquipement(salleId, equipementId);
        String nom = req.nom().trim();
        if (!e.getNom().equalsIgnoreCase(nom) && equipements.existsBySalleIdAndNomIgnoreCase(salleId, nom)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet équipement existe déjà dans cette salle");
        }
        e.setNom(nom);
        e.setEtat(req.etat());
        e.setDescription(nettoyer(req.description()));
        return EquipementResponse.from(equipements.save(e));
    }

    @Transactional
    public void retirerEquipement(Long salleId, Long equipementId) {
        equipements.delete(trouverEquipement(salleId, equipementId));
    }

    // ---------- Utilitaires ----------

    private void appliquer(Salle s, SalleRequest req) {
        s.setNom(req.nom().trim());
        s.setBatiment(req.batiment().trim());
        s.setEtage(nettoyer(req.etage()));
        s.setCapacite(req.capacite());
        s.setType(req.type());
        s.setDescription(nettoyer(req.description()));
    }

    private Salle trouver(Long id) {
        return salles.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Salle introuvable"));
    }

    private EquipementSalle trouverEquipement(Long salleId, Long equipementId) {
        return equipements.findByIdAndSalleId(equipementId, salleId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Équipement introuvable dans cette salle"));
    }

    private static boolean vide(String s) { return s == null || s.isBlank(); }
    private static boolean contient(String texte, String q) {
        return texte != null && texte.toLowerCase().contains(q.trim().toLowerCase());
    }
    private static String nettoyer(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
}