package ma.ensak.smartcampus.stock;

import jakarta.validation.Valid;
import ma.ensak.smartcampus.dto.StockDtos.*;
import ma.ensak.smartcampus.service.ServiceStock;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@PreAuthorize("hasAnyRole('SUPERVISEUR','ADMIN')")
public class StockController {

    private final ServiceStock service;

    public StockController(ServiceStock service) {
        this.service = service;
    }

    @GetMapping
    public List<MaterielResponse> lister(@RequestParam(required = false) String q) {
        return service.lister(q);
    }

    @PostMapping
    public ResponseEntity<MaterielResponse> ajouter(@Valid @RequestBody MaterielRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.ajouterMateriel(req));
    }

    @PutMapping("/{id}")
    public MaterielResponse modifier(@PathVariable Long id, @Valid @RequestBody MaterielRequest req) {
        return service.modifierStock(id, req);
    }

    @PostMapping("/{id}/mouvements")
    public MaterielResponse mouvement(@PathVariable Long id, @Valid @RequestBody MouvementRequest req) {
        return service.enregistrerMouvement(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> retirer(@PathVariable Long id) {
        service.retirerMateriel(id);
        return ResponseEntity.noContent().build();
    }
}