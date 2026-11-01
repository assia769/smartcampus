package ma.ensak.smartcampus.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import ma.ensak.smartcampus.enums.StatutReservation;

@Entity
@Table(name = "reservations", indexes = {
    @Index(name = "idx_reservation_salle_dates", columnList = "salle_id,date_debut,date_fin")
})
public class Reservation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDateTime dateFin;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_annulation")
    private LocalDateTime dateAnnulation;

    @Column(name = "date_decision")
    private LocalDateTime dateDecision;

    @Column(length = 500)
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutReservation statut = StatutReservation.EN_ATTENTE;

    @Column(name = "motif_refus", length = 500)
    private String motifRefus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decideur_id")
    private User decideur;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LigneMaterielReservation> lignesMateriel = new ArrayList<>();

    protected Reservation() { }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }
    public LocalDateTime getDateFin() { return dateFin; }
    public void setDateFin(LocalDateTime dateFin) { this.dateFin = dateFin; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
    public LocalDateTime getDateAnnulation() { return dateAnnulation; }
    public void setDateAnnulation(LocalDateTime dateAnnulation) { this.dateAnnulation = dateAnnulation; }
    public LocalDateTime getDateDecision() { return dateDecision; }
    public void setDateDecision(LocalDateTime dateDecision) { this.dateDecision = dateDecision; }
    public String getMotif() { return motif; }
    public void setMotif(String motif) { this.motif = motif; }
    public StatutReservation getStatut() { return statut; }
    public void setStatut(StatutReservation statut) { this.statut = statut; }
    public String getMotifRefus() { return motifRefus; }
    public void setMotifRefus(String motifRefus) { this.motifRefus = motifRefus; }
    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }
    public Salle getSalle() { return salle; }
    public void setSalle(Salle salle) { this.salle = salle; }
    public User getDecideur() { return decideur; }
    public void setDecideur(User decideur) { this.decideur = decideur; }
    public List<LigneMaterielReservation> getLignesMateriel() { return lignesMateriel; }
    public void ajouterLigneMateriel(LigneMaterielReservation ligne) {
        lignesMateriel.add(ligne);
        ligne.setReservation(this);
    }
    public void retirerLigneMateriel(LigneMaterielReservation ligne) {
        lignesMateriel.remove(ligne);
        ligne.setReservation(null);
    }
}
