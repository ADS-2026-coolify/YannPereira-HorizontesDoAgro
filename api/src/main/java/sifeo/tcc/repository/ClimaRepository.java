package sifeo.tcc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sifeo.tcc.models.entities.Clima;

import java.util.List;

@Repository
public interface ClimaRepository extends JpaRepository<Clima, Integer> {
    List<Clima> findBySitioIdOrderByDataHoraDesc(Integer sitioId);

    List<Clima> findBySitio_Usuario_Id(Integer usuarioId);
}