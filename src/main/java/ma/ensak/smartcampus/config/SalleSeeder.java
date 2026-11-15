package ma.ensak.smartcampus.config;

import ma.ensak.smartcampus.entity.EquipementSalle;
import ma.ensak.smartcampus.entity.Salle;
import ma.ensak.smartcampus.entity.SalleRepository;
import ma.ensak.smartcampus.enums.EtatSalle;
import ma.ensak.smartcampus.enums.TypeSalle;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class SalleSeeder {

    @Bean
    CommandLineRunner seedSalles(SalleRepository repo) {
        return args -> inserer(repo);
    }

    @Transactional
    void inserer(SalleRepository repo) {
        if (repo.count() > 0) return; // ne rien faire si des salles existent déjà

        // --- Salles de cours ---
        creer(repo, "Salle 101", "A", "1", 40, TypeSalle.SALLE, EtatSalle.DISPONIBLE,
                "Salle de cours standard",
                eq("Projecteur", "BON"), eq("Tableau blanc", "BON"), eq("Climatisation", "BON"));

        creer(repo, "Salle 102", "A", "1", 35, TypeSalle.SALLE, EtatSalle.DISPONIBLE,
                "Salle de cours standard",
                eq("Projecteur", "USAGE"), eq("Tableau blanc", "BON"));

        creer(repo, "Salle 201", "A", "2", 30, TypeSalle.SALLE, EtatSalle.DISPONIBLE,
                "Salle de travaux dirigés",
                eq("Projecteur", "BON"), eq("Tableau blanc", "BON"), eq("Prises électriques", "BON"));

        creer(repo, "Salle 202", "A", "2", 30, TypeSalle.SALLE, EtatSalle.HORS_SERVICE,
                "Fuite au plafond, en réparation",
                eq("Tableau blanc", "DEFECTUEUX"));

        // --- Salles informatiques ---
        creer(repo, "Salle Info 1", "B", "RDC", 25, TypeSalle.SALLE, EtatSalle.DISPONIBLE,
                "Salle de travaux pratiques informatique",
                eq("Postes informatiques", "BON"), eq("Projecteur", "BON"), eq("Climatisation", "BON"), eq("Wi-Fi", "BON"));

        creer(repo, "Salle Info 2", "B", "RDC", 25, TypeSalle.SALLE, EtatSalle.DISPONIBLE,
                "Salle de travaux pratiques informatique",
                eq("Postes informatiques", "USAGE"), eq("Projecteur", "BON"), eq("Wi-Fi", "BON"));

        // --- Salle de réunion ---
        creer(repo, "Salle de réunion", "C", "1", 15, TypeSalle.SALLE, EtatSalle.DISPONIBLE,
                "Réunions et soutenances",
                eq("Écran TV", "BON"), eq("Visioconférence", "BON"), eq("Climatisation", "BON"));

        // --- Amphithéâtres ---
        creer(repo, "Amphi A", "D", "RDC", 250, TypeSalle.AMPHITHEATRE, EtatSalle.DISPONIBLE,
                "Grand amphithéâtre, réservation soumise à validation",
                eq("Vidéoprojecteur", "BON"), eq("Système de sonorisation", "BON"),
                eq("Microphones", "BON"), eq("Climatisation", "BON"));

        creer(repo, "Amphi B", "D", "1", 150, TypeSalle.AMPHITHEATRE, EtatSalle.DISPONIBLE,
                "Amphithéâtre moyen, réservation soumise à validation",
                eq("Vidéoprojecteur", "BON"), eq("Système de sonorisation", "USAGE"), eq("Microphones", "BON"));
    }

    private record Eq(String nom, String etat) {}

    private static Eq eq(String nom, String etat) { return new Eq(nom, etat); }

    private void creer(SalleRepository repo, String nom, String batiment, String etage, int capacite,
                       TypeSalle type, EtatSalle etat, String description, Eq... equipements) {
        Salle s = new Salle();
        s.setNom(nom);
        s.setBatiment(batiment);
        s.setEtage(etage);
        s.setCapacite(capacite);
        s.setType(type);
        s.setEtat(etat);
        s.setDescription(description);
        for (Eq e : equipements) {
            s.getEquipements().add(new EquipementSalle(e.nom(), e.etat(), null, s));
        }
        repo.save(s); // les équipements sont enregistrés en cascade
    }
}