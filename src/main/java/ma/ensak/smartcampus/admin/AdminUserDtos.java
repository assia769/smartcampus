package ma.ensak.smartcampus.admin;

import ma.ensak.smartcampus.entity.User;
import ma.ensak.smartcampus.enums.Role;

public final class AdminUserDtos {

    private AdminUserDtos() {}

    public record CreateUserRequest(String nom, String email, String motDePasse,
                                    String telephone, Role role) {}

    public record UpdateUserRequest(String nom, String telephone) {}

    public record RoleRequest(Role role) {}

    public record StatutRequest(boolean actif) {}

    public record UserResponse(Long id, String nom, String email, String telephone,
                               Role role, boolean actif) {
        public static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getNom(), u.getEmail(),
                    u.getTelephone(), u.getRole(), u.isActif());
        }
    }
}