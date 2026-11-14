package ma.ensak.smartcampus.config;

import ma.ensak.smartcampus.entity.Materiel;
import ma.ensak.smartcampus.entity.MaterielRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StockSeeder implements CommandLineRunner {

    private final MaterielRepository repo;

    public StockSeeder(MaterielRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        repo.saveAll(List.of(
                new Materiel("Microphone sans fil", 10, "BON"),
                new Materiel("Caméra HD", 4, "BON"),
                new Materiel("Rallonge électrique", 15, "USAGE"),
                new Materiel("Vidéoprojecteur portable", 3, "BON")));
    }
}