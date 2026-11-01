package ma.ensak.smartcampus.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lignes_materiel_reservation")
public class LigneMaterielReservation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer quantite;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "materiel_id", nullable = false)
    private Materiel materiel;

    protected LigneMaterielReservation() { }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getQuantite() { return quantite; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }
    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }
    public Materiel getMateriel() { return materiel; }
    public void setMateriel(Materiel materiel) { this.materiel = materiel; }
}
