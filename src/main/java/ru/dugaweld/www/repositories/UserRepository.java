package ru.dugaweld.www.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.dugaweld.www.models.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
}