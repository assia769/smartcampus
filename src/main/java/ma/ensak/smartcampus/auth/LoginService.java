package ma.ensak.smartcampus.auth;

public class LoginService {

    public boolean login(String email, String password) {
        if (email == null || password == null) {
            return false;
        }
        return email.endsWith("@ensak.ma") && password.length() >= 8;
    }

    public String authenticate(String email, String password) {
        if (login(email, password)) {
            return "Connexion réussie";
        }
        return "Identifiants incorrects : vérifiez votre e-mail et votre mot de passe";
    }
}
