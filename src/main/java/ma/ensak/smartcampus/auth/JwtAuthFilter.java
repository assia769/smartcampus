package ma.ensak.smartcampus.auth;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ma.ensak.smartcampus.entity.User;
import ma.ensak.smartcampus.entity.UserRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository users;

    public JwtAuthFilter(JwtService jwtService, UserRepository users) {
        this.jwtService = jwtService;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims c = jwtService.parse(header.substring(7));
                // On relit l'utilisateur en base : compte supprimé ou désactivé = non authentifié,
                // et le rôle pris en compte est toujours le rôle actuel (pas celui du token).
                users.findByEmail(c.getSubject())
                        .filter(User::isActif)
                        .ifPresent(u -> {
                            var auth = new UsernamePasswordAuthenticationToken(
                                    u.getEmail(), null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name())));
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        });
            } catch (Exception ignored) {
                // token invalide : l'utilisateur reste non authentifié
            }
        }
        chain.doFilter(req, res);
    }
}