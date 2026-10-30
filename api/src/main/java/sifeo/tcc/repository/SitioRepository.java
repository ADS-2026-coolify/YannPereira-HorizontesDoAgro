package sifeo.tcc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sifeo.tcc.models.entities.Sitio;

import java.util.List;

@Repository
public interface SitioRepository extends JpaRepository<Sitio, Integer> {

    List<Sitio> findByUsuarioId(Integer usuarioId);
}