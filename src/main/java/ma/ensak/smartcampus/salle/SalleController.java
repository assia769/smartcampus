package ma.ensak.smartcampus.salle;

import jakarta.validation.Valid;
import ma.ensak.smartcampus.dto.SalleDtos.*;
import ma.ensak.smartcampus.enums.TypeSalle;
import ma.ensak.smartcampus.service.ServiceSalle;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salles")
public class SalleController {

    private final ServiceSalle service;

    public SalleController(ServiceSalle service) {
        this.service = service;
    }

    // Lecture : tout utilisateur connecté (liste + fiche avec équipements)
    @GetMapping
    public List<SalleResponse> lister(@RequestParam(required = false) String q,
                                      @RequestParam(required = false) String batiment,
                                      @RequestParam(required = false) Integer capaciteMin,
                                      @RequestParam(required = false) TypeSalle type,
                                      @RequestParam(required = false) String equipement) {
        return service.lister(q, batiment, capaciteMin, type, equipement);
    }

    @GetMapping("/{id}")
    public SalleResponse obtenir(@PathVariable Long id) {
        return service.obtenir(id);
    }

    // Écriture : ADMIN uniquement
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalleResponse> creer(@Valid @RequestBody SalleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.creer(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SalleResponse modifier(@PathVariable Long id, @Valid @RequestBody SalleRequest req) {
        return service.modifier(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        service.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/equipements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EquipementResponse> ajouterEquipement(@PathVariable Long id,
                                                                @Valid @RequestBody EquipementRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.ajouterEquipement(id, req));
    }

    @PutMapping("/{id}/equipements/{equipementId}")
    @PreAuthorize("hasRole('ADMIN')")
    public EquipementResponse modifierEquipement(@PathVariable Long id, @PathVariable Long equipementId,
                                                 @Valid @RequestBody EquipementRequest req) {
        return service.modifierEquipement(id, equipementId, req);
    }

    @DeleteMapping("/{id}/equipements/{equipementId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> retirerEquipement(@PathVariable Long id, @PathVariable Long equipementId) {
        service.retirerEquipement(id, equipementId);
        return ResponseEntity.noContent().build();
    }
}