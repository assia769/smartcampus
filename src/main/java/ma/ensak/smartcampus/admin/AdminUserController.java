package ma.ensak.smartcampus.admin;

import ma.ensak.smartcampus.admin.AdminUserDtos.*;
import ma.ensak.smartcampus.enums.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService service;

    public AdminUserController(AdminUserService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse creer(@RequestBody CreateUserRequest req) {
        return service.creer(req);
    }

    @GetMapping
    public List<UserResponse> lister(@RequestParam(required = false) String q,
                                     @RequestParam(required = false) Role role,
                                     @RequestParam(required = false) Boolean actif) {
        return service.lister(q, role, actif);
    }

    @GetMapping("/{id}")
    public UserResponse detail(@PathVariable Long id) {
        return service.detail(id);
    }

    @PutMapping("/{id}")
    public UserResponse modifier(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        return service.modifier(id, req);
    }

    @PutMapping("/{id}/role")
    public UserResponse changerRole(@PathVariable Long id, @RequestBody RoleRequest req,
                                    Authentication auth) {
        return service.changerRole(id, req.role(), auth.getName());
    }

    @PutMapping("/{id}/statut")
    public UserResponse changerStatut(@PathVariable Long id, @RequestBody StatutRequest req,
                                      Authentication auth) {
        return service.changerStatut(id, req.actif(), auth.getName());
    }
}