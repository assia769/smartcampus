package ma.ensak.smartcampus.entity;

 

import jakarta.persistence.*;

@Entity
@Table(name = "contacts_support")
public class ContactSupport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nomTechnicien;

    @Column(nullable = false, length = 30)
    private String telephone;

    protected ContactSupport() { }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomTechnicien() { return nomTechnicien; }
    public void setNomTechnicien(String nomTechnicien) { this.nomTechnicien = nomTechnicien; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
}
