package ma.ensak.smartcampus.admin;

import ma.ensak.smartcampus.admin.AdminUserDtos.*;
import ma.ensak.smartcampus.entity.User;
import ma.ensak.smartcampus.entity.UserRepository;
import ma.ensak.smartcampus.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
public class AdminUserService {

    // ADMIN n'est pas attribuable ici : le compte Admin est provisionné à l'installation
    private static final Set<Role> ROLES_AUTORISES =
            EnumSet.of(Role.ETUDIANT, Role.ENSEIGNANT, Role.SUPERVISEUR);

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final String domaine;

    public AdminUserService(UserRepository repo, PasswordEncoder encoder,
                            @Value("${app.email-domain:@usms.ma}") String domaine) {
        this.repo = repo;
        this.encoder = encoder;
        this.domaine = domaine.toLowerCase();
    }

    // ---------- S3-A1 : création ----------
    public UserResponse creer(CreateUserRequest r) {
        String nom = r.nom() == null ? "" : r.nom().trim();
        String email = r.email() == null ? "" : r.email().trim().toLowerCase();

        if (nom.isEmpty()) throw erreur(HttpStatus.BAD_REQUEST, "Le nom est obligatoire.");
        if (!emailValide(email))
            throw erreur(HttpStatus.BAD_REQUEST, "L'adresse e-mail doit se terminer par " + domaine);
        if (r.motDePasse() == null || r.motDePasse().length() < 8)
            throw erreur(HttpStatus.BAD_REQUEST, "Le mot de passe doit contenir au moins 8 caractères.");
        if (r.role() == null || !ROLES_AUTORISES.contains(r.role()))
            throw erreur(HttpStatus.BAD_REQUEST, "Rôle autorisé : ETUDIANT, ENSEIGNANT ou SUPERVISEUR.");
        if (repo.findByEmail(email).isPresent())
            throw erreur(HttpStatus.CONFLICT, "Cette adresse e-mail existe déjà.");

        String tel = (r.telephone() == null || r.telephone().isBlank()) ? null : r.telephone().trim();
        User u = new User(nom, email, encoder.encode(r.motDePasse()), tel, r.role());
        return UserResponse.from(repo.save(u));
    }

    // ---------- S3-A2 : liste, recherche, détail ----------
    public List<UserResponse> lister(String q, Role role, Boolean actif) {
        String terme = (q == null) ? "" : q.trim().toLowerCase();
        return repo.findAll().stream()
                .filter(u -> terme.isEmpty()
                        || u.getNom().toLowerCase().contains(terme)
                        || u.getEmail().toLowerCase().contains(terme))
                .filter(u -> role == null || u.getRole() == role)
                .filter(u -> actif == null || u.isActif() == actif)
                .sorted(Comparator.comparing(u -> u.getNom().toLowerCase()))
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse detail(Long id) {
        return UserResponse.from(trouver(id));
    }

    // ---------- S3-A3 : modification, rôle, statut ----------
    public UserResponse modifier(Long id, UpdateUserRequest r) {
        User u = trouver(id);
        String nom = r.nom() == null ? "" : r.nom().trim();
        if (nom.isEmpty()) throw erreur(HttpStatus.BAD_REQUEST, "Le nom est obligatoire.");
        u.setNom(nom);
        u.setTelephone((r.telephone() == null || r.telephone().isBlank()) ? null : r.telephone().trim());
        return UserResponse.from(repo.save(u));
    }

    public UserResponse changerRole(Long id, Role role, String emailConnecte) {
        User u = trouver(id);
        interdireSoiMeme(u, emailConnecte, "Vous ne pouvez pas modifier votre propre rôle.");
        if (role == null || !ROLES_AUTORISES.contains(role))
            throw erreur(HttpStatus.BAD_REQUEST, "Rôle autorisé : ETUDIANT, ENSEIGNANT ou SUPERVISEUR.");
        u.setRole(role);
        return UserResponse.from(repo.save(u));
    }

    public UserResponse changerStatut(Long id, boolean actif, String emailConnecte) {
        User u = trouver(id);
        interdireSoiMeme(u, emailConnecte, "Vous ne pouvez pas désactiver votre propre compte.");
        u.setActif(actif);
        return UserResponse.from(repo.save(u));
    }

    // ---------- utilitaires ----------
    private boolean emailValide(String email) {
        if (!email.endsWith(domaine)) return false;
        String local = email.substring(0, email.length() - domaine.length());
        return !local.isEmpty() && !local.contains("@") && !local.matches(".*\\s.*");
    }

    private User trouver(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> erreur(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));
    }

    private void interdireSoiMeme(User cible, String emailConnecte, String message) {
        if (cible.getEmail().equalsIgnoreCase(emailConnecte))
            throw erreur(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException erreur(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }
}