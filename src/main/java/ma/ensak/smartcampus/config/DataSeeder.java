package ma.ensak.smartcampus.config;

import ma.ensak.smartcampus.entity.User;
import ma.ensak.smartcampus.entity.UserRepository;
import ma.ensak.smartcampus.enums.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            create(repo, encoder, "Admin Smart", "admin@ensak.ma", "Admin@1234", Role.ADMIN);
            create(repo, encoder, "Karim Alaoui", "enseignant@ensak.ma", "Prof@1234", Role.ENSEIGNANT);
            create(repo, encoder, "Sara Bennani", "etudiant@ensak.ma", "Etud@1234", Role.ETUDIANT);
            create(repo, encoder, "Youssef Idrissi", "superviseur@ensak.ma", "Super@1234", Role.SUPERVISEUR);
        };
    }

    private void create(UserRepository repo, PasswordEncoder enc, String nom,
                        String email, String pwd, Role role) {
        if (repo.findByEmail(email).isPresent()) return;
        repo.save(new User(nom, email, enc.encode(pwd), null, role));
    }
}