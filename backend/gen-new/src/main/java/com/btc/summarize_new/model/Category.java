package com.btc.summarize_new.model;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter 
@Setter 
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tương ứng với SERIAL
    private Integer id;

    @JsonProperty("name")
    @Column(nullable = false, length = 100)
    private String name;

    @JsonProperty("slug")
    @Column(nullable = false, unique = true, length = 100)
    private String slug;
    
    @JsonProperty("description")
    @Column(length = 200)
    private String description;
}
