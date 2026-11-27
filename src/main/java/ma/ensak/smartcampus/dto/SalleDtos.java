package ma.ensak.smartcampus.dto;

import jakarta.validation.constraints.*;
import ma.ensak.smartcampus.entity.EquipementSalle;
import ma.ensak.smartcampus.entity.Salle;
import ma.ensak.smartcampus.enums.EtatSalle;
import ma.ensak.smartcampus.enums.TypeSalle;

import java.util.Comparator;
import java.util.List;

public class SalleDtos {

    public record SalleRequest(
            @NotBlank(message = "Le nom est obligatoire")
            @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères") String nom,
            @NotBlank(message = "Le bâtiment est obligatoire")
            @Size(max = 100, message = "Le bâtiment ne doit pas dépasser 100 caractères") String batiment,
            @Size(max = 30, message = "L'étage ne doit pas dépasser 30 caractères") String etage,
            @NotNull(message = "La capacité est obligatoire")
            @Min(value = 1, message = "La capacité doit être supérieure à 0") Integer capacite,
            @NotNull(message = "Le type est obligatoire") TypeSalle type,
            EtatSalle etat,
            @Size(max = 500, message = "La description ne doit pas dépasser 500 caractères") String description) {}

    public record EquipementRequest(
            @NotBlank(message = "Le nom de l'équipement est obligatoire")
            @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères") String nom,
            @NotBlank(message = "L'état est obligatoire")
            @Pattern(regexp = "BON|USAGE|DEFECTUEUX", message = "État invalide (BON, USAGE, DEFECTUEUX)") String etat,
            @Size(max = 500, message = "La description ne doit pas dépasser 500 caractères") String description) {}

    public record EquipementResponse(Long id, String nom, String etat, String description) {
        public static EquipementResponse from(EquipementSalle e) {
            return new EquipementResponse(e.getId(), e.getNom(), e.getEtat(), e.getDescription());
        }
    }

    public record SalleResponse(Long id, String nom, String batiment, String etage, int capacite,
                                TypeSalle type, EtatSalle etat, String description,
                                List<EquipementResponse> equipements) {
        public static SalleResponse from(Salle s) {
            List<EquipementResponse> eq = s.getEquipements().stream()
                    .sorted(Comparator.comparing(EquipementSalle::getNom, String.CASE_INSENSITIVE_ORDER))
                    .map(EquipementResponse::from).toList();
            return new SalleResponse(s.getId(), s.getNom(), s.getBatiment(), s.getEtage(),
                    s.getCapacite(), s.getType(), s.getEtat(), s.getDescription(), eq);
        }
    }
}