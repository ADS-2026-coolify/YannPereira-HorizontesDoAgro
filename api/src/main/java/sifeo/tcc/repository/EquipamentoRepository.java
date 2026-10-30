package sifeo.tcc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sifeo.tcc.models.entities.Equipamento;

import java.util.List;

@Repository
public interface EquipamentoRepository extends JpaRepository<Equipamento, Integer> {
    List<Equipamento> findBySitioId(Integer sitioId);

    List<Equipamento> findBySitio_Usuario_Id(Integer usuarioId);
}