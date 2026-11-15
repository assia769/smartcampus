package ma.ensak.smartcampus.entity;

import jakarta.persistence.*;
import ma.ensak.smartcampus.enums.EtatSalle;
import ma.ensak.smartcampus.enums.TypeSalle;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salles")
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String batiment;

    @Column(length = 30)
    private String etage;

    @Column(nullable = false)
    private Integer capacite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TypeSalle type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EtatSalle etat = EtatSalle.DISPONIBLE;

    @Column(length = 500)
    private String description;

    @OneToMany(mappedBy = "salle", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    private List<EquipementSalle> equipements = new ArrayList<>();

    public Salle() { }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getBatiment() { return batiment; }
    public void setBatiment(String batiment) { this.batiment = batiment; }
    public String getEtage() { return etage; }
    public void setEtage(String etage) { this.etage = etage; }
    public Integer getCapacite() { return capacite; }
    public void setCapacite(Integer capacite) { this.capacite = capacite; }
    public TypeSalle getType() { return type; }
    public void setType(TypeSalle type) { this.type = type; }
    public EtatSalle getEtat() { return etat; }
    public void setEtat(EtatSalle etat) { this.etat = etat; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<EquipementSalle> getEquipements() { return equipements; }
}