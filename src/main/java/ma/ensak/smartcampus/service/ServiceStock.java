package ma.ensak.smartcampus.service;

import ma.ensak.smartcampus.dto.StockDtos.*;
import ma.ensak.smartcampus.entity.Materiel;
import ma.ensak.smartcampus.entity.MaterielRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ServiceStock {

    private final MaterielRepository repo;

    public ServiceStock(MaterielRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<MaterielResponse> lister(String q) {
        List<Materiel> items = (q == null || q.isBlank())
                ? repo.findAllByOrderByDesignationAsc()
                : repo.findByDesignationContainingIgnoreCaseOrderByDesignationAsc(q.trim());
        return items.stream().map(MaterielResponse::from).toList();
    }

    @Transactional
    public MaterielResponse ajouterMateriel(MaterielRequest req) {
        String nom = req.designation().trim();
        if (repo.existsByDesignationIgnoreCase(nom)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet article existe déjà dans le stock");
        }
        return MaterielResponse.from(repo.save(new Materiel(nom, req.quantiteTotale(), req.etat())));
    }

    @Transactional
    public MaterielResponse modifierStock(Long id, MaterielRequest req) {
        Materiel m = trouver(id);
        String nom = req.designation().trim();
        if (!m.getDesignation().equalsIgnoreCase(nom) && repo.existsByDesignationIgnoreCase(nom)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet article existe déjà dans le stock");
        }
        // La quantité déjà réservée (total - disponible) est conservée
        int reservee = m.getQuantiteTotale() - m.getQuantiteDisponible();
        if (req.quantiteTotale() < reservee) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La quantité totale ne peut pas être inférieure à la quantité déjà réservée (" + reservee + ")");
        }
        m.setDesignation(nom);
        m.setEtat(req.etat());
        m.setQuantiteTotale(req.quantiteTotale());
        m.setQuantiteDisponible(req.quantiteTotale() - reservee);
        return MaterielResponse.from(repo.save(m));
    }

    /** Entrée ou retrait de quantité (S3-C2) */
    @Transactional
    public MaterielResponse enregistrerMouvement(Long id, MouvementRequest req) {
        Materiel m = trouver(id);
        if (req.type().equals("ENTREE")) {
            m.setQuantiteTotale(m.getQuantiteTotale() + req.quantite());
            m.setQuantiteDisponible(m.getQuantiteDisponible() + req.quantite());
        } else {
            if (req.quantite() > m.getQuantiteDisponible()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Retrait impossible : seulement " + m.getQuantiteDisponible() + " unité(s) disponible(s)");
            }
            m.setQuantiteTotale(m.getQuantiteTotale() - req.quantite());
            m.setQuantiteDisponible(m.getQuantiteDisponible() - req.quantite());
        }
        return MaterielResponse.from(repo.save(m));
    }

    @Transactional
    public void retirerMateriel(Long id) {
       Materiel m = trouver(id);
       if (!m.getLignesReservations().isEmpty()) {
           throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Impossible de retirer cet article : il est lié à des réservations");
       }
       repo.delete(m);
    }

    private Materiel trouver(Long id) {
        return repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Article introuvable"));
    }
}