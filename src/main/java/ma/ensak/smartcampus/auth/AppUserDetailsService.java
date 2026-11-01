package ma.ensak.smartcampus.auth;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import ma.ensak.smartcampus.entity.UserRepository;
 

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository users;

    public AppUserDetailsService(UserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        ma.ensak.smartcampus.entity.User utilisateur = users.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        return User.withUsername(utilisateur.getEmail())
                .password(utilisateur.getPassword())
                .roles(utilisateur.getRole().name())
                .build();
    }
}