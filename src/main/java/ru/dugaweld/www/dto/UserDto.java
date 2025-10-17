package ru.dugaweld.www.dto;

import lombok.Data;
import ru.dugaweld.www.models.User;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String postalCode;
    private String role;
    private LocalDateTime createdAt;

    public static UserDto fromUser(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setPostalCode(user.getPostalCode());
        dto.setRole(user.getRole() != null ? user.getRole().name() : "USER");
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
