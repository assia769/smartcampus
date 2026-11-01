package ma.ensak.smartcampus.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import ma.ensak.smartcampus.enums.StatutEnvoi;
import ma.ensak.smartcampus.enums.TypeNotification;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TypeNotification type;

    @Column(nullable = false, length = 200)
    private String sujet;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_envoi")
    private LocalDateTime dateEnvoi;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutEnvoi statutEnvoi = StatutEnvoi.EN_ATTENTE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destinataire_id", nullable = false)
    private User destinataire;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    protected Notification() { }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TypeNotification getType() { return type; }
    public void setType(TypeNotification type) { this.type = type; }
    public String getSujet() { return sujet; }
    public void setSujet(String sujet) { this.sujet = sujet; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
    public LocalDateTime getDateEnvoi() { return dateEnvoi; }
    public void setDateEnvoi(LocalDateTime dateEnvoi) { this.dateEnvoi = dateEnvoi; }
    public StatutEnvoi getStatutEnvoi() { return statutEnvoi; }
    public void setStatutEnvoi(StatutEnvoi statutEnvoi) { this.statutEnvoi = statutEnvoi; }
    public User getDestinataire() { return destinataire; }
    public void setDestinataire(User destinataire) { this.destinataire = destinataire; }
    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }
}
