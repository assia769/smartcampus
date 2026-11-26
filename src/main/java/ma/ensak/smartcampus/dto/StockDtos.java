package ma.ensak.smartcampus.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import ma.ensak.smartcampus.entity.Materiel;

public class StockDtos {

    public record MaterielRequest(
            @NotBlank(message = "La désignation est obligatoire")
            @Size(max = 120, message = "La désignation ne doit pas dépasser 120 caractères") String designation,
            @Min(value = 0, message = "La quantité ne peut pas être négative") int quantiteTotale,
            @NotBlank(message = "L'état est obligatoire")
            @Pattern(regexp = "BON|USAGE|DEFECTUEUX", message = "État invalide (BON, USAGE, DEFECTUEUX)") String etat) {}

    public record MouvementRequest(
            @NotBlank @Pattern(regexp = "ENTREE|RETRAIT", message = "Type invalide (ENTREE ou RETRAIT)") String type,
            @Min(value = 1, message = "La quantité doit être au moins 1") int quantite) {}

    public record MaterielResponse(Long id, String designation, int quantiteTotale,
                                   int quantiteDisponible, String etat) {
        public static MaterielResponse from(Materiel m) {
            return new MaterielResponse(m.getId(), m.getDesignation(), m.getQuantiteTotale(),
                    m.getQuantiteDisponible(), m.getEtat());
        }
    }
} 