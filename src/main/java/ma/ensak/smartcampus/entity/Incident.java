package ma.ensak.smartcampus.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import ma.ensak.smartcampus.enums.StatutIncident;

@Entity
@Table(name = "incidents")
public class Incident {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutIncident statut = StatutIncident.OUVERT;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_resolution")
    private LocalDateTime dateResolution;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "declarant_id", nullable = false)
    private User declarant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traite_par_id")
    private User traitePar;

    protected Incident() { }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public StatutIncident getStatut() { return statut; }
    public void setStatut(StatutIncident statut) { this.statut = statut; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
    public LocalDateTime getDateResolution() { return dateResolution; }
    public void setDateResolution(LocalDateTime dateResolution) { this.dateResolution = dateResolution; }
    public User getDeclarant() { return declarant; }
    public void setDeclarant(User declarant) { this.declarant = declarant; }
    public Salle getSalle() { return salle; }
    public void setSalle(Salle salle) { this.salle = salle; }
    public User getTraitePar() { return traitePar; }
    public void setTraitePar(User traitePar) { this.traitePar = traitePar; }
}
