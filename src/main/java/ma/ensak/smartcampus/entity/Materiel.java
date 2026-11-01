package ma.ensak.smartcampus.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "materiels")
public class Materiel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120, unique = true)
    private String designation;

    @Column(nullable = false)
    private Integer quantiteTotale;

    @Column(nullable = false)
    private Integer quantiteDisponible;

    @Column(length = 50)
    private String etat;

    @OneToMany(mappedBy = "materiel")
    private List<LigneMaterielReservation> lignesReservations = new ArrayList<>();

    protected Materiel() { }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public Integer getQuantiteTotale() { return quantiteTotale; }
    public void setQuantiteTotale(Integer quantiteTotale) { this.quantiteTotale = quantiteTotale; }
    public Integer getQuantiteDisponible() { return quantiteDisponible; }
    public void setQuantiteDisponible(Integer quantiteDisponible) { this.quantiteDisponible = quantiteDisponible; }
    public String getEtat() { return etat; }
    public void setEtat(String etat) { this.etat = etat; }
    public List<LigneMaterielReservation> getLignesReservations() { return lignesReservations; }
}
