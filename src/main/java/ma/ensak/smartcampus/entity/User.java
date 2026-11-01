
package ma.ensak.smartcampus.entity;
import ma.ensak.smartcampus.enums.Role;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "mot_de_passe_hash", nullable = false)
    private String motDePasseHash;

    @Column(length = 20)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    protected User() {
    }

    public User(String nom, String email, String motDePasseHash,
                String telephone, Role role) {
        this.nom = nom;
        this.email = email;
        this.motDePasseHash = motDePasseHash;
        this.telephone = telephone;
        this.role = role;
    }

    // Constructeur de compatibilité avec l'ancien code
    public User(String email, String password, Role role) {
        this(email, email, password, null, role);
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getEmail() {
        return email;
    }

    // Conservé pour la compatibilité avec Spring Security
    public String getPassword() {
        return motDePasseHash;
    }

    public String getMotDePasseHash() {
        return motDePasseHash;
    }

    public String getTelephone() {
        return telephone;
    }

    public Role getRole() {
        return role;
    }

    // Setters
    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setMotDePasseHash(String motDePasseHash) {
        this.motDePasseHash = motDePasseHash;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
