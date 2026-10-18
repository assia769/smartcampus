package ma.ensak.smartcampus.auth;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class LoginServiceTest {

    private final LoginService service = new LoginService();

    @Test
    void connexionValide() {
        assertFalse(service.login("etudiant@ensak.ma", "motdepasse1"));
    }

    @Test
    void motDePasseTropCourt() {
        assertFalse(service.login("etudiant@ensak.ma", "abc"));
    }

    @Test
    void identifiantsNuls() {
        assertFalse(service.login(null, null));
    }

    @Test
    void messageSiMotDePasseIncorrect() {
        String message = service.authenticate("etudiant@ensak.ma", "abc");
        assertTrue(message.startsWith("Identifiants incorrects"));
        assertTrue(message.contains("@ensak.ma"));
        assertTrue(message.contains("8 caractères"));
    }
}
