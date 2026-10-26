package ma.ensak.smartcampus.config;

import ma.ensak.smartcampus.user.Role;
import ma.ensak.smartcampus.user.User;
import ma.ensak.smartcampus.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UserDataLoader.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;

    public UserDataLoader(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }
        users.save(new User("etudiant@ensak.ma", encoder.encode("etudiant123"), Role.ETUDIANT));
        users.save(new User("prof@ensak.ma", encoder.encode("prof12345"), Role.ENSEIGNANT));
        users.save(new User("admin@ensak.ma", encoder.encode("admin12345"), Role.ADMIN));
        log.info("{} comptes de test créés", users.count());
    }
}