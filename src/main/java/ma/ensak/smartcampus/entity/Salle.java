
package ma.ensak.smartcampus.entity;

import jakarta.persistence.*;
import  ma.ensak.smartcampus.enums.TypeSalle;
import  ma.ensak.smartcampus.enums.EtatSalle;

@Entity
@Table(name = "salles")
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String batiment;
    private String etage;
    private Integer capacite;

    @Enumerated(EnumType.STRING)
    private TypeSalle type;

    @Enumerated(EnumType.STRING)
    private EtatSalle etat;

    private String description;

    public Salle() {
    }

    // Getters et Setters à générer dans VS Code
}
