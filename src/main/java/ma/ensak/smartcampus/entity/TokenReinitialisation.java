package ma.ensak.smartcampus.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_reinitialisation")
public class TokenReinitialisation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String tokenHash;

    @Column(nullable = false)
    private LocalDateTime expiration;

    @Column(nullable = false)
    private Boolean utilise = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    protected TokenReinitialisation() { }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public LocalDateTime getExpiration() { return expiration; }
    public void setExpiration(LocalDateTime expiration) { this.expiration = expiration; }
    public Boolean getUtilise() { return utilise; }
    public void setUtilise(Boolean utilise) { this.utilise = utilise; }
    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }
}
