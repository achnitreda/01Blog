package com.rachnit.blog01.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// we know that those are jpa annotations are like contract that Hibernate follows to convert our java objects
// to sql raws but I know it stands for java persistence api why here we import jakarta what is jakarta ??
// correct me if I'm wrong
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY) // explain it to me it means what
    private Long id;

    @Column(unique = true, nullable = false) // is this means that it should be unique and never null but how can the user insert null
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // Default constructor (required by JPA)
    // you'll need it later when we fetch users from the database!
    // TODO: uncomment this line.
    // public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}