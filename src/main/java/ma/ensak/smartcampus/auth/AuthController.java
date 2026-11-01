package ma.ensak.smartcampus.auth;

import ma.ensak.smartcampus.entity.User;
import ma.ensak.smartcampus.entity.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository repo, PasswordEncoder encoder, JwtService jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        User user = repo.findByEmail(req.email()).orElse(null);
        if (user == null || !encoder.matches(req.password(), user.getMotDePasseHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Identifiants incorrects"));
        }
        String role = user.getRole().name();
        return ResponseEntity.ok(Map.of(
                "token", jwt.generate(user.getEmail(), role),
                "email", user.getEmail(),
                "nom", user.getNom(),
                "role", role));
    }
}